CREATE TABLE TB_PRODUKT (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	art				TEXT NOT NULL DEFAULT 'Baum' CHECK (art IN ('Baum', 'Kreuz')),
	bezeichnung		TEXT NOT NULL,
	von_cm			INT NOT NULL,
	bis_cm			INT NOT NULL,
	CONSTRAINT produkt_cm_bereich_gueltig CHECK (bis_cm >= von_cm)
);

/*
-- TODO(RLS): zusammen mit den übrigen Tabellen aktivieren (siehe seed.sql).
ALTER TABLE tb_produkt ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produkt lesen für alle" ON tb_produkt
    FOR SELECT USING (true);

CREATE POLICY "Produkte schreiben für Authentifizierte" ON tb_produkt
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Produkte aktualisieren für Authentifizierte" ON tb_produkt
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Produkte löschen für Authentifizierte" ON tb_produkt
    FOR DELETE USING (auth.role() = 'authenticated');
*/
