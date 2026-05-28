-- GhostSeller Owner Access
-- Exécute ce fichier dans Supabase SQL Editor après avoir créé ton compte dans GhostSeller.

update users
set role = 'owner'
where email = 'mulerlouis03@gmail.com';

-- Si tu utilises aussi le mail GhostSeller :
update users
set role = 'owner'
where email = 'ghostseller.ai@gmail.com';

select id, name, email, role, plan, credits
from users
where email in ('mulerlouis03@gmail.com','ghostseller.ai@gmail.com');
