-- Globale Betriebseinstellungen: genau eine Zeile (id = 1).
-- Die sms_*-Spalten steuern die (noch nicht versendete) SMS-Erinnerung für
-- Lieferungen: wie viele Tage vor dem geplanten Lieferdatum und zu welcher
-- Uhrzeit sie verschickt werden soll (siehe lib/sms.ts).
CREATE TABLE TB_EINSTELLUNGEN (
	id					INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
	sms_aktiv			BOOLEAN NOT NULL DEFAULT TRUE,
	sms_vorlauf_tage	INT NOT NULL DEFAULT 1 CHECK (sms_vorlauf_tage >= 0),
	sms_uhrzeit			TIME NOT NULL DEFAULT '08:00'
);

-- Default-Zeile anlegen, damit getEinstellungen() ohne Sonderfall liest.
INSERT INTO tb_einstellungen DEFAULT VALUES;
