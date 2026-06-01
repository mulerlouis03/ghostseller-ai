create table if not exists tiktok_oauth_states (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  state text unique,
  code_verifier text default '',
  created_at timestamptz default now()
);

create table if not exists tiktok_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  open_id text default '',
  display_name text default '',
  avatar_url text default '',
  access_token text default '',
  refresh_token text default '',
  scopes text default '',
  status text default 'connected',
  expires_at timestamptz,
  refresh_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tiktok_publish_attempts (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  video_url text default '',
  caption text default '',
  mode text default '',
  status text default '',
  response jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_tiktok_oauth_states_state on tiktok_oauth_states(state);
create index if not exists idx_tiktok_accounts_user_id on tiktok_accounts(user_id);
create index if not exists idx_tiktok_publish_attempts_user_id on tiktok_publish_attempts(user_id);
