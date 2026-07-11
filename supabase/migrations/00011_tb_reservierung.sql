CREATE TABLE TB_RESERVIERUNG (
	id					UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	stand_id			UUID NOT NULL REFERENCES tb_stand(id),
	profil_id			UUID NOT NULL REFERENCES tb_profil(id),
	kunde_id			UUID NOT NULL REFERENCES tb_kunde(id),
	versandart			TEXT NOT NULL DEFAULT 'abholung' CHECK (versandart IN ('abholung', 'lieferung')),
	geplantes_datum		DATE NOT NULL,
	status				TEXT NOT NULL DEFAULT 'offen' CHECK (status IN ('offen', 'erfuellt', 'storniert')),
	anzahlungsbetrag	NUMERIC(10, 2), /* TODO: Checkn wie wir offenen Preis berechnen: Gesamtpreis - anzahlungsbetrag?*/
	reserviert_am		TIMESTAMPTZ NOT NULL DEFAULT now()
);
