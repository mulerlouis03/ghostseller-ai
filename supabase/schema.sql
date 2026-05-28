create table if not exists users (id uuid primary key,name text not null,email text unique not null,password_hash text not null,plan text default 'Free',credits integer default 20,role text default 'user',stripe_customer_id text,created_at timestamptz default now());
alter table users add column if not exists role text default 'user';
alter table users add column if not exists stripe_customer_id text;
create table if not exists projects (id uuid primary key,user_id uuid references users(id) on delete cascade,name text not null,description text,created_at timestamptz default now());
create table if not exists posts (id uuid primary key,user_id uuid references users(id) on delete cascade,project_id uuid references projects(id) on delete cascade,product text,date text,time text,title text,hook text,caption text,script text,hashtags text,status text default 'à publier',created_at timestamptz default now());
create table if not exists leads (id uuid primary key,user_id uuid references users(id) on delete cascade,project_id uuid references projects(id) on delete cascade,name text not null,phone text,product text,message text,reply text,status text default 'nouveau',created_at timestamptz default now(),updated_at timestamptz);
create table if not exists trends (id uuid primary key,user_id uuid references users(id) on delete cascade,niche text,country text,goal text,title text,reason text,hashtags text,viral_score integer,content_angle text,cta text,created_at timestamptz default now());
create table if not exists auto_campaigns (id uuid primary key,user_id uuid references users(id) on delete cascade,project_id uuid references projects(id) on delete cascade,product text,audience text,offer text,objective text,strategy text,whatsapp_cta text,viral_score integer,hooks jsonb,content_plan jsonb,created_at timestamptz default now());
create table if not exists video_concepts (id uuid primary key,user_id uuid references users(id) on delete cascade,project_id uuid references projects(id) on delete cascade,product text,audience text,offer text,style text,duration text,goal text,viral_score integer,title text,hook text,storyboard jsonb,subtitles jsonb,voiceover text,caption text,hashtags text,whatsapp_cta text,template text,production_notes text,created_at timestamptz default now());
create index if not exists idx_users_role on users(role);


create table if not exists campaigns (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  product text,
  type text,
  count integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_leads_user_id on leads(user_id);

create index if not exists idx_auto_campaigns_user_id on auto_campaigns(user_id);

create table if not exists social_connections (
 id uuid primary key,
 user_id uuid references users(id) on delete cascade,
 provider text not null,
 username text,
 page_id text,
 instagram_user_id text,
 access_token text,
 page_access_token text,
 status text default 'connected',
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);
create index if not exists idx_social_connections_user_id on social_connections(user_id);
create index if not exists idx_social_connections_provider on social_connections(provider);


create table if not exists waitlist (
  id uuid primary key,
  name text,
  email text unique not null,
  business text,
  created_at timestamptz default now()
);

create index if not exists idx_waitlist_email
on waitlist(email);

create index if not exists idx_users_plan on users(plan);


-- V51 Onboarding + controlled access
alter table users add column if not exists access_status text default 'approved';
alter table users add column if not exists onboarding_completed boolean default false;
alter table users add column if not exists business_type text default '';
alter table users add column if not exists main_goal text default '';
alter table users add column if not exists main_platform text default '';
alter table users add column if not exists max_projects integer default 1;
alter table users add column if not exists max_posts integer default 10;
alter table users add column if not exists max_leads integer default 10;

create index if not exists idx_users_access_status on users(access_status);
create index if not exists idx_users_onboarding_completed on users(onboarding_completed);

update users
set access_status='approved'
where access_status is null;

create table if not exists content_history (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  type text default 'content',
  niche text default '',
  platform text default '',
  prompt text default '',
  result jsonb default '{}'::jsonb,
  favorite boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_content_history_user_id on content_history(user_id);
create index if not exists idx_content_history_created_at on content_history(created_at);
create index if not exists idx_content_history_favorite on content_history(favorite);

create table if not exists growth_plans (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  product text default '',
  target text default '',
  goal text default '',
  market text default '',
  plan jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_growth_plans_user_id on growth_plans(user_id);
create index if not exists idx_growth_plans_created_at on growth_plans(created_at);

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

create table if not exists agent_runs (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  selected_agent text default '',
  task text default '',
  context jsonb default '{}'::jsonb,
  result jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_agent_runs_user_id on agent_runs(user_id);
create index if not exists idx_agent_runs_selected_agent on agent_runs(selected_agent);
create index if not exists idx_agent_runs_created_at on agent_runs(created_at);

create table if not exists unified_brain_runs (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  objective text default '',
  selected_agent text default '',
  decision jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_unified_brain_runs_user_id on unified_brain_runs(user_id);
create index if not exists idx_unified_brain_runs_selected_agent on unified_brain_runs(selected_agent);
create index if not exists idx_unified_brain_runs_created_at on unified_brain_runs(created_at);

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

create table if not exists persistent_memory (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  niche text default '',
  platform text default '',
  hook text default '',
  cta text default '',
  strategy text default '',
  campaign_name text default '',
  metrics jsonb default '{}'::jsonb,
  performance_score integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_persistent_memory_user_id on persistent_memory(user_id);
create index if not exists idx_persistent_memory_score on persistent_memory(performance_score);
create index if not exists idx_persistent_memory_platform on persistent_memory(platform);
create index if not exists idx_persistent_memory_niche on persistent_memory(niche);
