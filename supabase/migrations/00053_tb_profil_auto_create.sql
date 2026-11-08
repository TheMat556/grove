-- Jeder Auth-User bekommt sofort ein tb_profil. Ohne diese Zeile scheitert
-- das Protected-Layout (Sidebar lädt das Profil), bevor der User etwas tun kann.
CREATE OR REPLACE FUNCTION public.fn_create_profil_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	INSERT INTO public.tb_profil (id, name)
	VALUES (
		NEW.id,
		COALESCE(
			NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
			NULLIF(split_part(NEW.email, '@', 1), ''),
			'Profil'
		)
	)
	ON CONFLICT (id) DO NOTHING;

	RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_profil_for_new_user ON auth.users;

CREATE TRIGGER trg_create_profil_for_new_user
	AFTER INSERT ON auth.users
	FOR EACH ROW
	EXECUTE FUNCTION public.fn_create_profil_for_new_user();

-- Bestehende Auth-User ohne Profil nachziehen.
INSERT INTO public.tb_profil (id, name)
SELECT
	u.id,
	COALESCE(
		NULLIF(u.raw_user_meta_data ->> 'name', ''),
		NULLIF(split_part(u.email, '@', 1), ''),
		'Profil'
	)
FROM auth.users u
LEFT JOIN public.tb_profil p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
