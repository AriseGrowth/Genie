-- Enable RLS on all tables
alter table workspaces enable row level security;
alter table tasks enable row level security;
alter table email_drafts enable row level security;
alter table approvals enable row level security;
alter table meeting_summaries enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Workspaces: user can only see their own
create policy "workspaces_owner" on workspaces
  for all using (auth.uid() = user_id);

-- Tasks: user can access tasks belonging to their workspaces
create policy "tasks_owner" on tasks
  for all using (
    exists (
      select 1 from workspaces
      where workspaces.id = tasks.workspace_id
        and workspaces.user_id = auth.uid()
    )
  );

-- Email drafts
create policy "email_drafts_owner" on email_drafts
  for all using (
    exists (
      select 1 from workspaces
      where workspaces.id = email_drafts.workspace_id
        and workspaces.user_id = auth.uid()
    )
  );

-- Approvals: gated on user_id directly
create policy "approvals_owner" on approvals
  for all using (auth.uid() = user_id);

-- Meeting summaries
create policy "meeting_summaries_owner" on meeting_summaries
  for all using (
    exists (
      select 1 from workspaces
      where workspaces.id = meeting_summaries.workspace_id
        and workspaces.user_id = auth.uid()
    )
  );

-- Conversations
create policy "conversations_owner" on conversations
  for all using (auth.uid() = user_id);

-- Messages: accessible via conversation ownership
create policy "messages_owner" on messages
  for all using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
        and conversations.user_id = auth.uid()
    )
  );
