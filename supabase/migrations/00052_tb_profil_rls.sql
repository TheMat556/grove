-- Row Level Security für tb_profil. Bislang verließ sich die App auf die
-- Server-Action-Guards (profile/actions.ts) – jeder mit gültigem JWT konnte
-- aber direkt via Supabase-API tb_profil schreiben (z. B. rolle='admin').
-- Die Policies spiegeln genau die App-Regel: jederzeit lesbar für
-- angemeldete Nutzer, ändern darf man nur das eigene Profil oder als Admin.
-- Andere Tabellen folgen (das Muster hier gilt entsprechend).

ALTER TABLE tb_profil ENABLE ROW LEVEL SECURITY;

-- Admin-Prüfung als SECURITY DEFINER, damit der EXISTS-Check auf tb_profil
-- selbst nicht rekursiv die eigene Policy triggert.
CREATE OR REPLACE FUNCTION fn_ist_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM tb_profil
        WHERE id = auth.uid() AND rolle = 'admin'
    );
$$;

CREATE POLICY "Profile lesen für Authentifizierte" ON tb_profil
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Profil anlegen nur selbst oder Admin" ON tb_profil
    FOR INSERT WITH CHECK (id = auth.uid() OR fn_ist_admin());

CREATE POLICY "Profil ändern nur selbst oder Admin" ON tb_profil
    FOR UPDATE USING (id = auth.uid() OR fn_ist_admin())
    WITH CHECK (id = auth.uid() OR fn_ist_admin());
