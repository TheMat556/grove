-- Zwei Saisons dürfen sich nicht überschneiden. Das DB-Constraint ist die
-- verbindliche Prüfung; die App mappt den Fehler nur auf eine lesbare Meldung.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE tb_saison
	ADD CONSTRAINT saison_zeitraum_ueberlappt_nicht
	EXCLUDE USING gist (
		daterange(start_datum, end_datum, '[]') WITH &&
	);
