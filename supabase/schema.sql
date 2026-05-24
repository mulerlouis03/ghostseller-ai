create table if not exists users (id uuid primary key,name text not null,email text unique not null,password_hash text not null,plan text default 'Free',credits integer default 20,created_at timestamptz default now());
create table if not exists projects (id uuid primary key,user_id uuid references users(id) on delete cascade,name text not null,description text,created_at timestamptz default now());
create table if not exists campaigns (id uuid primary key,user_id uuid references users(id) on delete cascade,project_id uuid references projects(id) on delete cascade,product text,type text,count integer default 0,created_at timestamptz default now());
create table if not exists posts (id uuid primary key,user_id uuid references users(id) on delete cascade,project_id uuid references projects(id) on delete cascade,product text,date text,time text,title text,hook text,caption text,script text,hashtags text,status text default 'à publier',created_at timestamptz default now());
create table if not exists leads (id uuid primary key,user_id uuid references users(id) on delete cascade,project_id uuid references projects(id) on delete cascade,name text not null,phone text,product text,message text,reply text,status text default 'nouveau',created_at timestamptz default now(),updated_at timestamptz);
create index if not exists idx_projects_user_id on projects(user_id);
create index if not exists idx_campaigns_user_id on campaigns(user_id);
create index if not exists idx_posts_user_id on posts(user_id);
create index if not exists idx_leads_user_id on leads(user_id);
