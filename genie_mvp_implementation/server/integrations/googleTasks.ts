/**
 * Google Tasks integration stub.
 *
 * Exposes functions to create and list tasks via the Google Tasks
 * API. These are placeholders; implement them using the
 * googleapis client library when you connect real data.
 */

export interface TaskInput {
  title: string;
  notes?: string;
  dueAt?: string;
}

export async function createTask(userId: string, input: TaskInput) {
  // TODO: call tasks.tasks.insert
  return {
    externalRef: 'google-task-id'
  };
}

export async function listOpenTasks(userId: string, dateFrom?: string) {
  // TODO: call tasks.tasks.list
  return [];
}