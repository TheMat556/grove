CREATE TABLE TB_STANDORT (
	id 				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	plz				INTEGER NOT NULL,
	ort				TEXT NOT NULL,
	adresse			TEXT NOT NULL
);

