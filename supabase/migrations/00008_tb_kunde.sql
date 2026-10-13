CREATE TABLE TB_KUNDE (
	id 				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name			TEXT NOT NULL,
	telefon			TEXT NOT NULL,
	adresse			TEXT NOT NULL,
	ist_firma		BOOLEAN NOT NULL
);

/*
-- TODO(RLS): zusammen mit den übrigen Tabellen aktivieren (siehe seed.sql).
ALTER TABLE tb_kunde ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kunde lesen für alle" ON tb_kunde
    FOR SELECT USING (true);

CREATE POLICY "Kunden schreiben für Authentifizierte" ON tb_kunde
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Kunden aktualisieren für Authentifizierte" ON tb_kunde
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Kunden löschen für Authentifizierte" ON tb_kunde
    FOR DELETE USING (auth.role() = 'authenticated');
*/
