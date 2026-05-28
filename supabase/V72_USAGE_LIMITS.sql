create table if not exists usage_counters (
  user_id uuid primary key references users(id) on delete cascade,
  used_credits integer default 0,
  used_posts integer default 0,
  used_leads integer default 0,
  used_projects integer default 0,
  updated_at timestamptz default now()
);

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  event_type text default '',
  cost integer default 0,
  usage_type text default '',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_usage_events_user_id on usage_events(user_id);
create index if not exists idx_usage_events_created_at on usage_events(created_at);

insert into usage_counters (user_id, used_credits, used_posts, used_leads, used_projects, updated_at)
select id, 0, 0, 0, 0, now()
from users
on conflict (user_id) do nothing;

update users set
  credits = coalesce(credits,20),
  max_projects = coalesce(max_projects,1),
  max_posts = coalesce(max_posts,10),
  max_leads = coalesce(max_leads,10)
where role not in ('owner','admin');

update users set
  credits = 999999,
  max_projects = 999999,
  max_posts = 999999,
  max_leads = 999999
where role in ('owner','admin');
