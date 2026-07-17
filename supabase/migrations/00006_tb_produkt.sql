CREATE TABLE TB_PRODUKT (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	art				TEXT NOT NULL DEFAULT 'Baum' CHECK (art IN ('Baum', 'Kreuz')),
	bezeichnung		TEXT NOT NULL,
	von_cm			INT NOT NULL,
	bis_cm			INT NOT NULL,
	CONSTRAINT produkt_cm_bereich_gueltig CHECK (bis_cm >= von_cm)
);
