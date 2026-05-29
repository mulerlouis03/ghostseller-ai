create table if not exists billing_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  email text default '',
  stripe_customer_id text default '',
  stripe_subscription_id text default '',
  plan text default 'free',
  status text default 'inactive',
  credits integer default 0,
  posts_limit integer default 0,
  leads_limit integer default 0,
  projects_limit integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists billing_events (
  id uuid primary key,
  user_id uuid references users(id) on delete set null,
  event_type text default '',
  plan text default '',
  stripe_id text default '',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_billing_profiles_user_id on billing_profiles(user_id);
create index if not exists idx_billing_profiles_customer on billing_profiles(stripe_customer_id);
create index if not exists idx_billing_profiles_subscription on billing_profiles(stripe_subscription_id);
create index if not exists idx_billing_events_user_id on billing_events(user_id);
create index if not exists idx_billing_events_type on billing_events(event_type);
