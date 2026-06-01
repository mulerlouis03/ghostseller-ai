create table if not exists business_goals (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  goal text default '',
  niche text default '',
  platform text default '',
  budget text default '0',
  cadence text default 'daily',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists autopilot_runs (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  type text default '',
  input jsonb default '{}'::jsonb,
  output jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists recurring_campaigns (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  campaign_name text default '',
  niche text default '',
  platform text default '',
  frequency text default 'weekly',
  workflow jsonb default '[]'::jsonb,
  active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_business_goals_user_id on business_goals(user_id);
create index if not exists idx_autopilot_runs_user_id on autopilot_runs(user_id);
create index if not exists idx_recurring_campaigns_user_id on recurring_campaigns(user_id);
