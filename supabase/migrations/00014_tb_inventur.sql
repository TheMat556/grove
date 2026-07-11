CREATE TABLE TB_INVENTUR (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	stand_id		UUID NOT NULL REFERENCES tb_stand(id),
	produkt_id		UUID NOT NULL REFERENCES tb_produkt(id),
	profil_id		UUID NOT NULL REFERENCES tb_profil(id),
	datum			DATE NOT NULL,
	differenz		INT NOT NULL,
	grund			TEXT
);
