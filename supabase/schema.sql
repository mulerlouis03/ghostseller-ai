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
