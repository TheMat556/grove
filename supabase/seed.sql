-- =============================================================================
-- NUR LOKALE ENTWICKLUNG / CI. Läuft ausschließlich bei `supabase db reset`
-- über [db.seed] in config.toml und wird NICHT als Migration ausgeliefert.
--
-- Hintergrund: RLS (Row Level Security) ist in den Tabellen-Migrationen noch
-- auskommentiert. Ohne Grants könnten die von Tests/App genutzten Rollen nicht
-- auf die Tabellen zugreifen. Diese Grants sind bewusst NICHT in einer Migration,
-- damit sie niemals eine geteilte oder produktive Datenbank erreichen.
--
-- Bewusst ohne `anon`: nur authenticated (App) und service_role (Tests) erhalten
-- Zugriff. TODO(RLS): Sobald RLS + Policies aktiv sind, diese Datei entfernen.
-- =============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
