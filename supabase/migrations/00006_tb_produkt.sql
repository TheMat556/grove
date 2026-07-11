CREATE TABLE TB_PRODUKT (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	produktart_id	UUID NOT NULL REFERENCES tb_produktart(id),
	bezeichnung		TEXT NOT NULL,
	von_cm			INT NOT NULL,
	bis_cm			INT NOT NULL
);
