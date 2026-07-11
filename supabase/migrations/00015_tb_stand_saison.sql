CREATE TABLE tb_stand_saison (
	stand_id UUID NOT NULL REFERENCES tb_stand(id),
	saison_id UUID NOT NULL REFERENCES tb_saison(id),
	PRIMARY KEY (stand_id, saison_id)
);
