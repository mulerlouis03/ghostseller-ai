create table if not exists execution_workflows (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  objective text default '',
  niche text default '',
  platform text default '',
  status text default 'draft',
  steps jsonb default '[]'::jsonb,
  retry_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists execution_logs (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  workflow_id uuid,
  event text default '',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists campaign_runners (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  campaign_name text default '',
  objective text default '',
  niche text default '',
  platform text default '',
  status text default 'ready',
  workflow jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_execution_workflows_user_id on execution_workflows(user_id);
create index if not exists idx_execution_workflows_status on execution_workflows(status);
create index if not exists idx_execution_logs_user_id on execution_logs(user_id);
create index if not exists idx_campaign_runners_user_id on campaign_runners(user_id);
