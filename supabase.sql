-- Widget Tâche 13BK — schéma Supabase
-- À exécuter une seule fois dans l'éditeur SQL du projet Supabase.

create table if not exists public.widget_items (
  id uuid primary key default gen_random_uuid(),
  person text not null check (person in ('stephan', 'caroline')),
  type text not null check (type in ('note', 'tache', 'rappel')),
  content text not null default '',
  item_date date not null default current_date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists widget_items_person_date_idx
  on public.widget_items (person, item_date);

alter table public.widget_items enable row level security;

-- Le widget n'a pas d'authentification (usage interne à 2 personnes),
-- ces policies autorisent la clé "anon" à lire/écrire uniquement
-- dans cette table isolée.
drop policy if exists "widget_items_select" on public.widget_items;
create policy "widget_items_select"
  on public.widget_items for select
  using (true);

drop policy if exists "widget_items_insert" on public.widget_items;
create policy "widget_items_insert"
  on public.widget_items for insert
  with check (true);

drop policy if exists "widget_items_update" on public.widget_items;
create policy "widget_items_update"
  on public.widget_items for update
  using (true)
  with check (true);

drop policy if exists "widget_items_delete" on public.widget_items;
create policy "widget_items_delete"
  on public.widget_items for delete
  using (true);
