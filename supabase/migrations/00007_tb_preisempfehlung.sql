CREATE TABLE TB_PREISEMPFEHLUNG (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	saison_id		UUID NOT NULL REFERENCES tb_saison(id),
	produkt_id		UUID NOT NULL REFERENCES tb_produkt(id),
	preis			NUMERIC NOT NULL
);
