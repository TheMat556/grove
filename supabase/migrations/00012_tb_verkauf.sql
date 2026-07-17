CREATE TABLE TB_VERKAUF (
	id 					UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	saison_id			UUID NOT NULL REFERENCES tb_saison(id),
	stand_id			UUID NOT NULL REFERENCES tb_stand(id),
	profil_id			UUID NOT NULL REFERENCES tb_profil(id),
	reservierung_id		UUID REFERENCES tb_reservierung(id),
	aktion_bz			TEXT,
	preis_gesamt		NUMERIC(10, 2) NOT NULL,
	anmerkung			TEXT,
    verkauft_am			TIMESTAMPTZ NOT NULL DEFAULT now()
);
