CREATE TABLE TB_SAISON (
	id				UUID			PRIMARY KEY DEFAULT gen_random_uuid(),
	name 			TEXT NOT NULL,
	start_datum		DATE NOT NULL,
	end_datum		DATE NOT NULL,
	active			BOOLEAN NOT NULL DEFAULT FALSE
);

/*
ALTER TABLE tb_saison ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Saison lesen für alle" ON tb_saison
    FOR SELECT USING (true)

CREATE POLICY "Saisons schreiben für Authentifizierte" ON tb_saison
    FOR INSERT WITH CHECK (auth.role() = 'authenticated')

CREATE POLICY "Saisons aktualisieren für Authentifizierte" ON tb_saison
    FOR UPDATE USING (auth.role() = 'authenticated')

CREATE POLICY "Saisons löschen für Authentifizierte" ON tb_saison
    FOR DELETE USING (auth.role() = 'authenticated')
*/
