-- Run this once in the Supabase SQL Editor.
create table if not exists public.projects (
  id text primary key,
  title text not null,
  eyebrow text not null default '',
  description text not null default '',
  url text not null,
  repo_url text,
  image_url text,
  category text not null default 'Client site',
  market text not null default 'Philippines',
  tags text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 1,
  accent text not null default 'lime',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.portfolio_admins enable row level security;

-- Keep the admin allowlist inaccessible through the public Data API.
revoke all on table public.portfolio_admins from anon, authenticated;

-- Put the authorization helper outside the exposed public schema. It is usable
-- by RLS policies, but cannot be called as a public RPC endpoint.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portfolio_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_portfolio_admin() from public;
grant execute on function private.is_portfolio_admin() to anon, authenticated;

alter table public.projects enable row level security;

-- Explicit table privileges plus RLS provide defense in depth.
revoke all on table public.projects from anon, authenticated;
grant select on table public.projects to anon, authenticated;
grant insert, update, delete on table public.projects to authenticated;

drop policy if exists "Published projects are public" on public.projects;
create policy "Published projects are public"
on public.projects for select to anon, authenticated
using (published = true or (select private.is_portfolio_admin()));

drop policy if exists "Authenticated admin can insert" on public.projects;
create policy "Authenticated admin can insert"
on public.projects for insert to authenticated
with check ((select private.is_portfolio_admin()));

drop policy if exists "Authenticated admin can update" on public.projects;
create policy "Authenticated admin can update"
on public.projects for update to authenticated
using ((select private.is_portfolio_admin())) with check ((select private.is_portfolio_admin()));

drop policy if exists "Authenticated admin can delete" on public.projects;
create policy "Authenticated admin can delete"
on public.projects for delete to authenticated
using ((select private.is_portfolio_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-previews',
  'project-previews',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public project previews" on storage.objects;
create policy "Public project previews"
on storage.objects for select
using (bucket_id = 'project-previews');

drop policy if exists "Admin can upload project previews" on storage.objects;
create policy "Admin can upload project previews"
on storage.objects for insert to authenticated
with check (bucket_id = 'project-previews' and (select private.is_portfolio_admin()));

drop policy if exists "Admin can update project previews" on storage.objects;
create policy "Admin can update project previews"
on storage.objects for update to authenticated
using (bucket_id = 'project-previews' and (select private.is_portfolio_admin()))
with check (bucket_id = 'project-previews' and (select private.is_portfolio_admin()));

drop policy if exists "Admin can delete project previews" on storage.objects;
create policy "Admin can delete project previews"
on storage.objects for delete to authenticated
using (bucket_id = 'project-previews' and (select private.is_portfolio_admin()));

-- Remove the older helper after every policy has moved to the private schema.
drop function if exists public.is_portfolio_admin();

-- After creating your Authentication user, replace the email and run this once:
-- insert into public.portfolio_admins (user_id)
-- select id from auth.users where email = 'YOUR_ADMIN_EMAIL';
