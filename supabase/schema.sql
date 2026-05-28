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
