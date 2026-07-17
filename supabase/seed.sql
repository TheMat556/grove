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

-- =============================================================================
-- DEV-USER für lokale Entwicklung
-- =============================================================================
-- Email:    dev@grove.de
-- Passwort: dev123
-- Rolle:    admin
--
-- Nach `supabase start` oder `supabase db reset` verfügbar.
-- =============================================================================
INSERT INTO auth.users (
	instance_id,
	id,
	aud,
	role,
	email,
	encrypted_password,
	email_confirmed_at,
	raw_app_meta_data,
	raw_user_meta_data,
	created_at,
	updated_at,
	confirmation_token,
	email_change,
	email_change_token_new,
	recovery_token
)
VALUES (
	'00000000-0000-0000-0000-000000000000',
	'00000000-0000-0000-0000-000000000001',
	'authenticated',
	'authenticated',
	'dev@grove.de',
	crypt('dev123', gen_salt('bf')),
	now(),
	'{"provider":"email","providers":["email"]}',
	'{"name":"Dev User"}',
	now(),
	now(),
	'',
	'',
	'',
	''
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tb_profil (id, name, rolle)
VALUES (
	'00000000-0000-0000-0000-000000000001',
	'Dev User',
	'admin'
)
ON CONFLICT (id) DO NOTHING;
