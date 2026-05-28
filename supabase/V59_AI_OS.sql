create table if not exists ai_tasks (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  title text default '',
  priority text default 'medium',
  completed boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_ai_tasks_user_id on ai_tasks(user_id);
create index if not exists idx_ai_tasks_created_at on ai_tasks(created_at);
