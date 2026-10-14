CREATE TABLE TB_KUNDE (
	id 				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name			TEXT NOT NULL,
	telefon			TEXT NOT NULL,
	adresse			TEXT NOT NULL,
	ist_firma		BOOLEAN NOT NULL
);
