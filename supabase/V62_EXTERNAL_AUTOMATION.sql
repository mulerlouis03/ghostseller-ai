create table if not exists external_actions (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  connector text default '',
  action text default '',
  payload jsonb default '{}'::jsonb,
  status text default 'queued',
  result jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists agent_schedules (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  title text default '',
  connector text default '',
  frequency text default 'daily',
  task jsonb default '{}'::jsonb,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists webhook_events (
  id uuid primary key,
  source text default '',
  payload jsonb default '{}'::jsonb,
  headers jsonb default '{}'::jsonb,
  processed boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_external_actions_user_id on external_actions(user_id);
create index if not exists idx_external_actions_status on external_actions(status);
create index if not exists idx_agent_schedules_user_id on agent_schedules(user_id);
create index if not exists idx_webhook_events_source on webhook_events(source);
