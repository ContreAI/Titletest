export type TaskStatus = 'ongoing' | 'due' | 'complete' | 'todo' | 'in-progress' | 'done' | 'cancelled';

export interface Task {
  id: string;
  title?: string;
  label?: string;
  status: TaskStatus;
  assignee?: string;
  dueDate?: Date | string;
  startDate: number;
  endDate: number;
  description?: string;
}

export interface Project {
  id: string;
  name?: string;
  label?: string;
  status: TaskStatus;
  tasks: Task[];
  startDate?: Date | string | number;
  endDate?: Date | string | number;
}

