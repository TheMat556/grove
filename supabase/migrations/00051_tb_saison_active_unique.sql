CREATE UNIQUE INDEX idx_tb_saison_active ON tb_saison (active) WHERE active = true;

CREATE OR REPLACE FUNCTION deactivate_other_saisons()
RETURNS TRIGGER AS $$
BEGIN
	IF NEW.active = true THEN
	   UPDATE tb_saison SET active = false
	   WHERE active = true AND id <> NEW.id;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deactivate_other_saisons
	BEFORE INSERT OR UPDATE ON tb_saison
	FOR EACH ROW
	EXECUTE FUNCTION deactivate_other_saisons();
