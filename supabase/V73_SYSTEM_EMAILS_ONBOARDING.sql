alter table users add column if not exists preferred_language text default 'fr';
alter table users add column if not exists business_type text default '';
alter table users add column if not exists main_goal text default '';
alter table users add column if not exists main_platform text default '';
alter table users add column if not exists onboarding_completed boolean default false;

create table if not exists email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  email text default '',
  subject text default '',
  type text default 'system',
  status text default 'queued',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists user_notifications (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  type text default 'system',
  title text default '',
  message text default '',
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_email_logs_user_id on email_logs(user_id);
create index if not exists idx_email_logs_email on email_logs(email);
create index if not exists idx_user_notifications_user_id on user_notifications(user_id);
create index if not exists idx_user_notifications_read on user_notifications(read);
