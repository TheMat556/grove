CREATE TABLE TB_WARENEINGANGSPOSITION (
	id					UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	wareneingang_id		UUID NOT NULL REFERENCES tb_wareneingang(id),
	produkt_id			UUID NOT NULL REFERENCES tb_produkt(id),
	menge				INT NOT NULL CHECK (menge > 0)
);
