create table if not exists social_accounts (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  provider text default '',
  account_name text default '',
  account_id text default '',
  access_token_encrypted text default '',
  refresh_token_encrypted text default '',
  status text default 'connected',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists social_publish_queue (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  provider text default '',
  account_id text default '',
  content_type text default 'post',
  caption text default '',
  media_url text default '',
  scheduled_at timestamptz,
  status text default 'queued',
  result jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists social_oauth_events (
  id uuid primary key,
  provider text default '',
  code_present boolean default false,
  state text default '',
  query jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_social_accounts_user_id on social_accounts(user_id);
create index if not exists idx_social_accounts_provider on social_accounts(provider);
create index if not exists idx_social_publish_queue_user_id on social_publish_queue(user_id);
create index if not exists idx_social_publish_queue_status on social_publish_queue(status);
create index if not exists idx_social_oauth_events_provider on social_oauth_events(provider);
