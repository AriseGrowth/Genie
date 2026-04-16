-- user_integrations: stores OAuth tokens per provider per user
create table if not exists user_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  provider text not null,
  access_token text,
  refresh_token text,
  token_expiry timestamptz,
  account_email text,
  created_at timestamptz default now(),
  unique (user_id, provider)
);

alter table user_integrations enable row level security;

create policy "Users manage own integrations"
  on user_integrations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
