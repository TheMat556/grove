CREATE TABLE TB_PROFIL (
	id				UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
	name			TEXT NOT NULL,
	rolle			TEXT NOT NULL DEFAULT 'mitarbeiter' CHECK (rolle IN ('admin', 'mitarbeiter')),
	telefon			TEXT,
	aktiv			BOOLEAN NOT NULL DEFAULT true,
	erstellt_am		TIMESTAMPTZ NOT NULL DEFAULT now()
);
