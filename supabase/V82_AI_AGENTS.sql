create table if not exists ai_agents (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  agent_key text default '',
  name text default '',
  role text default '',
  status text default 'active',
  memory jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists agent_missions (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  title text default '',
  objective text default '',
  target_platform text default '',
  status text default 'active',
  steps jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists agent_memory (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  agent_key text default '',
  memory_key text default '',
  memory_value text default '',
  created_at timestamptz default now()
);

create index if not exists idx_ai_agents_user_id on ai_agents(user_id);
create index if not exists idx_agent_missions_user_id on agent_missions(user_id);
create index if not exists idx_agent_memory_user_id on agent_memory(user_id);
