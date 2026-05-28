alter table users add column if not exists trial_ends_at timestamptz;
alter table users add column if not exists subscription_status text default 'free';
alter table users add column if not exists updated_at timestamptz default now();

create table if not exists revenue_automation_logs (
  id uuid primary key,
  user_id uuid references users(id) on delete set null,
  email text default '',
  type text default '',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_revenue_automation_logs_user_id on revenue_automation_logs(user_id);
create index if not exists idx_revenue_automation_logs_email on revenue_automation_logs(email);
create index if not exists idx_revenue_automation_logs_type on revenue_automation_logs(type);
