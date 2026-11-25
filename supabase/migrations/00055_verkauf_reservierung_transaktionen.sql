-- Vorwärts-Migration für bereits angewendete Tabellen (00008/00011 bleiben unverändert).
-- Bestehende Datenbanken erhalten so die Spalten nachträglich; frische Datenbanken
-- bekommen sie nach dem ursprünglichen CREATE TABLE.

ALTER TABLE tb_kunde ADD COLUMN IF NOT EXISTS plz TEXT NOT NULL DEFAULT '';
ALTER TABLE tb_reservierung ADD COLUMN IF NOT EXISTS anmerkung TEXT;

-- Legt eine Reservierung an und verknüpft sie optional mit einem noch freien
-- Verkauf – beides in einer Transaktion. Die Verknüpfung ist bedingt: ein bereits
-- verknüpfter Verkauf wird nicht überschrieben, sondern der Aufruf schlägt fehl.
-- Ein Retry kann dadurch keine zweite Reservierung erzeugen, ohne zu verknüpfen.
CREATE OR REPLACE FUNCTION create_reservierung_mit_verkauf(
	p_reservierung jsonb,
	p_verkauf_id uuid DEFAULT NULL
)
RETURNS tb_reservierung
LANGUAGE plpgsql
AS $$
DECLARE
	v_reservierung tb_reservierung;
BEGIN
	INSERT INTO tb_reservierung (
		saison_id,
		stand_id,
		profil_id,
		kunde_id,
		versandart,
		geplantes_datum,
		status,
		anzahlungsbetrag,
		anmerkung
	)
	SELECT
		(p_reservierung->>'saison_id')::uuid,
		(p_reservierung->>'stand_id')::uuid,
		(p_reservierung->>'profil_id')::uuid,
		(p_reservierung->>'kunde_id')::uuid,
		COALESCE((p_reservierung->>'versandart')::text, 'abholung'),
		(p_reservierung->>'geplantes_datum')::date,
		COALESCE((p_reservierung->>'status')::text, 'offen'),
		(p_reservierung->>'anzahlungsbetrag')::numeric,
		(p_reservierung->>'anmerkung')::text
	RETURNING * INTO v_reservierung;

	IF p_verkauf_id IS NOT NULL THEN
		UPDATE tb_verkauf
		SET reservierung_id = v_reservierung.id
		WHERE id = p_verkauf_id
			AND reservierung_id IS NULL;

		IF NOT FOUND THEN
			RAISE EXCEPTION 'Der Verkauf ist bereits mit einer Reservierung verknüpft.';
		END IF;
	END IF;

	RETURN v_reservierung;
END;
$$;

-- Ersetzt Kopf und Positionen eines Verkaufs atomar: Kopf-Update, Löschen der
-- alten Positionen und Einfügen der neuen passieren in einer Transaktion.
CREATE OR REPLACE FUNCTION update_verkauf_mit_positionen(
	p_verkauf_id uuid,
	p_kopf jsonb,
	p_positionen jsonb
)
RETURNS tb_verkauf
LANGUAGE plpgsql
AS $$
DECLARE
	v_verkauf tb_verkauf;
	v_pos jsonb;
BEGIN
	UPDATE tb_verkauf
	SET
		stand_id = (p_kopf->>'stand_id')::uuid,
		aktion_bz = (p_kopf->>'aktion_bz')::text,
		anmerkung = (p_kopf->>'anmerkung')::text,
		preis_gesamt = (p_kopf->>'preis_gesamt')::numeric
	WHERE id = p_verkauf_id
	RETURNING * INTO v_verkauf;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'Verkauf wurde nicht gefunden.';
	END IF;

	DELETE FROM tb_position WHERE verkauf_id = p_verkauf_id;

	FOR v_pos IN SELECT * FROM jsonb_array_elements(p_positionen)
	LOOP
		INSERT INTO tb_position (
			verkauf_id,
			produkt_id,
			menge,
			einzelpreis,
			kreuz_montiert,
			hoehe_cm
		)
		VALUES (
			p_verkauf_id,
			(v_pos->>'produkt_id')::uuid,
			(v_pos->>'menge')::int,
			(v_pos->>'einzelpreis')::numeric,
			COALESCE((v_pos->>'kreuz_montiert')::boolean, false),
			(v_pos->>'hoehe_cm')::int
		);
	END LOOP;

	RETURN v_verkauf;
END;
$$;

-- Löscht Verkauf und Positionen atomar (Positionen zuerst wegen FK).
CREATE OR REPLACE FUNCTION delete_verkauf_mit_positionen(p_verkauf_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
	DELETE FROM tb_position WHERE verkauf_id = p_verkauf_id;
	DELETE FROM tb_verkauf WHERE id = p_verkauf_id;
END;
$$;
