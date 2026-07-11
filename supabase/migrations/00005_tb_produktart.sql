CREATE TABLE TB_PRODUKTART (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	produktart		TEXT NOT NULL DEFAULT 'Baum' CHECK (produktart IN ('Baum', 'Kreuz'))
);
