CREATE TABLE TB_PREISEMPFEHLUNG (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	saison_id		UUID NOT NULL REFERENCES tb_saison(id),
	produkt_id		UUID NOT NULL REFERENCES tb_produkt(id),
	preis			NUMERIC(10, 2) NOT NULL,
	CONSTRAINT preisempfehlung_saison_produkt_uniq UNIQUE (saison_id, produkt_id)
);
