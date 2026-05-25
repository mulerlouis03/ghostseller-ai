alter table users add column if not exists role text default 'user';

-- Remplace TON_EMAIL par ton email exact de connexion GhostSeller.
update users
set role = 'admin'
where email = 'TON_EMAIL';

create index if not exists idx_users_role on users(role);