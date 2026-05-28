create table if not exists agent_runs (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  selected_agent text default '',
  task text default '',
  context jsonb default '{}'::jsonb,
  result jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists unified_brain_runs (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  objective text default '',
  selected_agent text default '',
  decision jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_agent_runs_user_id on agent_runs(user_id);
create index if not exists idx_agent_runs_selected_agent on agent_runs(selected_agent);
create index if not exists idx_agent_runs_created_at on agent_runs(created_at);

create index if not exists idx_unified_brain_runs_user_id on unified_brain_runs(user_id);
create index if not exists idx_unified_brain_runs_selected_agent on unified_brain_runs(selected_agent);
create index if not exists idx_unified_brain_runs_created_at on unified_brain_runs(created_at);
