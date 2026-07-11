CREATE TABLE TB_POSITION (
	id						UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	verkauf_id				UUID NOT NULL REFERENCES tb_verkauf(id),
	produkt_id				UUID NOT NULL REFERENCES tb_produkt(id),
	menge					INT NOT NULL CHECK (menge > 0),
	einzelpreis				NUMERIC(10, 2) NOT NULL,
	kreuz_montiert			BOOLEAN NOT NULL DEFAULT false, /* TODO: Wie Preisempfehlung für Kreuz geben?)*/
	hoehe_cm				INT NOT NULL
);
