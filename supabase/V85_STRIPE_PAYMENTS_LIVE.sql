alter table users add column if not exists stripe_customer_id text default '';
alter table users add column if not exists stripe_subscription_id text default '';
alter table users add column if not exists subscription_status text default 'free';
alter table users add column if not exists trial_ends_at timestamptz;
alter table users add column if not exists updated_at timestamptz default now();

create table if not exists billing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  email text default '',
  plan text default '',
  event_type text default '',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_billing_events_user_id on billing_events(user_id);
create index if not exists idx_billing_events_email on billing_events(email);
create index if not exists idx_billing_events_event_type on billing_events(event_type);
