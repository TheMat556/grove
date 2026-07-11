CREATE TABLE TB_WARENEINGANG (
	id 				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	stand_id		UUID NOT NULL REFERENCES tb_stand(id),
	datum			DATE NOT NULL DEFAULT now(),
	erfasst_von		UUID NOT NULL REFERENCES tb_profil(id)
);
