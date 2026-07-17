# Grove – Datenbankschema (ERD)

Verkauf von Weihnachtsbäumen/Kreuzen an saisonalen Ständen.

## Legende

- **Saison-unabhängig** (Stammdaten): `tb_profil`, `tb_saison`, `tb_standort`, `tb_stand`,
  `tb_produkt`, `tb_kunde`
- **Saison-abhängig** (Bewegungsdaten): `tb_preisempfehlung`, `tb_wareneingang`(+position),
  `tb_reservierung`, `tb_verkauf`(+position), `tb_inventur`, `tb_einsatz`, `tb_stand_saison`

Die saison-abhängigen Kopf-Tabellen tragen eine direkte `saison_id` (FK auf `tb_saison`).
Positionstabellen (`tb_position`, `tb_wareneingangsposition`) erben die Saison über ihre
Kopfzeile und haben daher keine eigene `saison_id`. `tb_stand_saison` ist die M:N-Zuordnung,
über die derselbe Stand in mehreren Saisons eingesetzt werden kann.

```mermaid
erDiagram
    tb_profil {
        uuid id PK "= auth.users.id"
        text name
        text rolle "admin | mitarbeiter"
        text telefon
        boolean aktiv
        timestamptz erstellt_am
    }

    tb_saison {
        uuid id PK
        text name
        date start_datum
        date end_datum
        boolean active "max. 1 aktiv (partial unique idx)"
    }

    tb_standort {
        uuid id PK
        int plz
        text ort
        text adresse
    }

    tb_stand {
        uuid id PK
        uuid standort_id FK
        text bezeichnung
    }

    tb_produkt {
        uuid id PK
        text art "Baum | Kreuz"
        text bezeichnung
        int von_cm
        int bis_cm "CHECK bis_cm >= von_cm"
    }

    tb_kunde {
        uuid id PK
        text name
        text telefon
        text adresse
        boolean ist_firma
    }

    tb_stand_saison {
        uuid stand_id PK,FK
        uuid saison_id PK,FK
    }

    tb_preisempfehlung {
        uuid id PK
        uuid saison_id FK
        uuid produkt_id FK
        numeric preis
    }

    tb_wareneingang {
        uuid id PK
        uuid saison_id FK
        uuid stand_id FK
        date datum
        uuid erfasst_von FK "-> tb_profil"
    }

    tb_wareneingangsposition {
        uuid id PK
        uuid wareneingang_id FK
        uuid produkt_id FK
        int menge "> 0"
    }

    tb_reservierung {
        uuid id PK
        uuid saison_id FK
        uuid stand_id FK
        uuid profil_id FK
        uuid kunde_id FK
        text versandart "abholung | lieferung"
        date geplantes_datum
        text status "offen | erfuellt | storniert"
        numeric anzahlungsbetrag
        timestamptz reserviert_am
    }

    tb_verkauf {
        uuid id PK
        uuid saison_id FK
        uuid stand_id FK
        uuid profil_id FK
        uuid reservierung_id FK "nullable"
        text aktion_bz
        numeric preis_gesamt
        text anmerkung
        timestamptz verkauft_am
    }

    tb_position {
        uuid id PK
        uuid verkauf_id FK
        uuid produkt_id FK
        int menge "> 0"
        numeric einzelpreis
        boolean kreuz_montiert
        int hoehe_cm
    }

    tb_inventur {
        uuid id PK
        uuid saison_id FK
        uuid stand_id FK
        uuid produkt_id FK
        uuid profil_id FK
        date datum
        int differenz
        text grund
    }

    tb_einsatz {
        uuid id PK
        uuid saison_id FK
        uuid stand_id FK
        uuid profil_id FK
        date von
        date bis "nullable, >= von"
    }

    tb_standort  ||--o{ tb_stand                  : "hat"

    tb_stand     ||--o{ tb_stand_saison           : ""
    tb_saison    ||--o{ tb_stand_saison           : ""

    tb_saison    ||--o{ tb_preisempfehlung        : "gilt in"
    tb_produkt   ||--o{ tb_preisempfehlung        : "für"

    tb_saison    ||--o{ tb_wareneingang           : ""
    tb_stand     ||--o{ tb_wareneingang           : "an"
    tb_profil    ||--o{ tb_wareneingang           : "erfasst von"
    tb_wareneingang ||--o{ tb_wareneingangsposition : "enthält"
    tb_produkt   ||--o{ tb_wareneingangsposition  : ""

    tb_saison    ||--o{ tb_reservierung           : ""
    tb_stand     ||--o{ tb_reservierung           : ""
    tb_profil    ||--o{ tb_reservierung           : ""
    tb_kunde     ||--o{ tb_reservierung           : ""

    tb_saison    ||--o{ tb_verkauf                : ""
    tb_stand     ||--o{ tb_verkauf                : ""
    tb_profil    ||--o{ tb_verkauf                : ""
    tb_reservierung ||--o| tb_verkauf             : "wird zu"
    tb_verkauf   ||--o{ tb_position               : "enthält"
    tb_produkt   ||--o{ tb_position               : ""

    tb_saison    ||--o{ tb_inventur               : ""
    tb_stand     ||--o{ tb_inventur               : ""
    tb_produkt   ||--o{ tb_inventur               : ""
    tb_profil    ||--o{ tb_inventur               : ""

    tb_saison    ||--o{ tb_einsatz               : ""
    tb_stand     ||--o{ tb_einsatz               : ""
    tb_profil    ||--o{ tb_einsatz               : ""
```
