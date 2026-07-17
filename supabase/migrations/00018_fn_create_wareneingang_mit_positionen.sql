-- Erzeugt einen Wareneingang mit N Positionen in einer Transaktion.
-- Wirft bei Fehlern (z. B. menge <= 0) und rollt alles zurück.
CREATE OR REPLACE FUNCTION create_wareneingang_mit_positionen(
	p_wareneingang jsonb,
	p_positionen jsonb
)
RETURNS tb_wareneingang
LANGUAGE plpgsql
AS $$
DECLARE
	v_wareneingang tb_wareneingang;
	v_pos jsonb;
BEGIN
	-- Wareneingang-Kopf anlegen
	INSERT INTO tb_wareneingang (
		saison_id,
		stand_id,
		datum,
		erfasst_von
	)
	SELECT
		(p_wareneingang->>'saison_id')::uuid,
		(p_wareneingang->>'stand_id')::uuid,
		COALESCE((p_wareneingang->>'datum')::date, now()),
		(p_wareneingang->>'erfasst_von')::uuid
	RETURNING * INTO v_wareneingang;

	-- Positionen anlegen
	FOR v_pos IN SELECT * FROM jsonb_array_elements(p_positionen)
	LOOP
		INSERT INTO tb_wareneingangsposition (
			wareneingang_id,
			produkt_id,
			menge
		)
		VALUES (
			v_wareneingang.id,
			(v_pos->>'produkt_id')::uuid,
			(v_pos->>'menge')::int
		);
	END LOOP;

	RETURN v_wareneingang;
END;
$$;
