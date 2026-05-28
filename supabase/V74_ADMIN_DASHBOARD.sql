alter table users add column if not exists updated_at timestamptz default now();
alter table users add column if not exists access_status text default 'approved';
alter table users add column if not exists plan text default 'Free';
alter table users add column if not exists credits integer default 20;

create index if not exists idx_users_role on users(role);
create index if not exists idx_users_plan on users(plan);
create index if not exists idx_users_access_status on users(access_status);
