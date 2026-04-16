'use client';

import AuthGuard from '../../components/AuthGuard';
import TaskList from '../../components/Tasks/TaskList';

export default function TasksPage() {
  return (
    <AuthGuard>
      <TaskList />
    </AuthGuard>
  );
}
