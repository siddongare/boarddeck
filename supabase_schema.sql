-- BoardDeck Cloud Sync Schema (Supabase Postgres + Row Level Security)
-- Paste into your Supabase project's SQL Editor once to enable cross-device sync.

create table if not exists public.boarddeck_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  progress_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.boarddeck_profiles enable row level security;

create policy "Users can view their own progress"
  on public.boarddeck_profiles
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.boarddeck_profiles
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.boarddeck_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.touch_boarddeck_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_boarddeck_updated_at on public.boarddeck_profiles;
create trigger trg_boarddeck_updated_at
  before update on public.boarddeck_profiles
  for each row execute function public.touch_boarddeck_updated_at();
