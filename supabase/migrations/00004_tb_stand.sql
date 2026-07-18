CREATE TABLE TB_STAND (
	id 				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	standort_id		UUID NOT NULL REFERENCES tb_standort(id) ON DELETE RESTRICT,
	bezeichnung 	TEXT NOT NULL
);
