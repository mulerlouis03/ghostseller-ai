create table if not exists launch_events (
  id uuid primary key,
  type text default '',
  source text default '',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists launch_notes (
  id uuid primary key,
  user_id uuid references users(id) on delete set null,
  note text default '',
  created_at timestamptz default now()
);

create index if not exists idx_launch_events_type on launch_events(type);
create index if not exists idx_launch_events_source on launch_events(source);
create index if not exists idx_launch_events_created_at on launch_events(created_at);
create index if not exists idx_launch_notes_user_id on launch_notes(user_id);
