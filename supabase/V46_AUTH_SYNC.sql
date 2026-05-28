-- V46 AUTH UNIFIED FIX
-- À exécuter seulement si tu veux vérifier les comptes GhostSeller.

alter table users add column if not exists role text default 'user';
alter table users add column if not exists plan text default 'Free';
alter table users add column if not exists credits integer default 20;

update users
set role='owner', plan='Pro', credits=9999
where email in ('ghostseller.ai@gmail.com','mulerlouis03@gmail.com');

select id, name, email, role, plan, credits
from users
where email in ('ghostseller.ai@gmail.com','mulerlouis03@gmail.com');
