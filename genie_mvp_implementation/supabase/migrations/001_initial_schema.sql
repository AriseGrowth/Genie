-- Workspaces: one personal + one business per user
create table workspaces (
  id text primary key,
  user_id uuid references auth.users not null,
  kind text not null check (kind in ('personal', 'business')),
  name text not null,
  created_at timestamptz default now()
);

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id text references workspaces(id) not null,
  title text not null,
  notes text,
  due_at timestamptz,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  source text not null default 'manual' check (source in ('manual', 'assistant', 'meeting', 'email')),
  external_provider text,
  external_ref text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Email drafts
create table email_drafts (
  id uuid primary key default gen_random_uuid(),
  workspace_id text references workspaces(id) not null,
  to_list text[] not null default '{}',
  cc_list text[] not null default '{}',
  bcc_list text[] not null default '{}',
  subject text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'pending_approval', 'sent', 'rejected', 'failed')),
  gmail_draft_id text,
  external_provider text,
  external_ref text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Approvals
create table approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  workspace_id text references workspaces(id) not null,
  action_type text not null check (action_type in ('send_email', 'create_calendar_event', 'update_calendar_event', 'store_sensitive_memory')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'failed', 'expired')),
  payload jsonb not null default '{}',
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- Meeting summaries
create table meeting_summaries (
  id uuid primary key default gen_random_uuid(),
  workspace_id text references workspaces(id) not null,
  title text not null,
  summary text not null,
  decisions text[] not null default '{}',
  action_items jsonb not null default '[]',
  followup_draft jsonb,
  created_at timestamptz default now()
);

-- Conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  workspace_id text references workspaces(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages (conversation history)
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  tool_name text,
  tool_result jsonb,
  created_at timestamptz default now()
);

-- Trigger to update updated_at on tasks
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at before update on tasks
  for each row execute function update_updated_at();

create trigger email_drafts_updated_at before update on email_drafts
  for each row execute function update_updated_at();

create trigger conversations_updated_at before update on conversations
  for each row execute function update_updated_at();
