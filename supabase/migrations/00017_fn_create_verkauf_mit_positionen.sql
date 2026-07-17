-- Erzeugt einen Verkauf mit N Positionen in einer Transaktion.
-- Wirft bei Fehlern (z. B. menge <= 0) und rollt alles zurück.
CREATE OR REPLACE FUNCTION create_verkauf_mit_positionen(
	p_verkauf jsonb,
	p_positionen jsonb
)
RETURNS tb_verkauf
LANGUAGE plpgsql
AS $$
DECLARE
	v_verkauf tb_verkauf;
	v_pos jsonb;
BEGIN
	-- Verkauf-Kopf anlegen
	INSERT INTO tb_verkauf (
		saison_id,
		stand_id,
		profil_id,
		reservierung_id,
		aktion_bz,
		preis_gesamt,
		anmerkung
	)
	SELECT
		(p_verkauf->>'saison_id')::uuid,
		(p_verkauf->>'stand_id')::uuid,
		(p_verkauf->>'profil_id')::uuid,
		(p_verkauf->>'reservierung_id')::uuid,
		(p_verkauf->>'aktion_bz')::text,
		(p_verkauf->>'preis_gesamt')::numeric,
		(p_verkauf->>'anmerkung')::text
	RETURNING * INTO v_verkauf;

	-- Positionen anlegen
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
			v_verkauf.id,
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
