CREATE TABLE TB_EINSATZ (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	stand_id		UUID NOT NULL REFERENCES tb_stand(id),
	profil_id		UUID NOT NULL REFERENCES tb_profil(id),
	von				DATE NOT NULL,
	bis				DATE,
	CONSTRAINT einsatz_zeitraum_gueltig CHECK (bis IS NULL OR bis >= von)
);
