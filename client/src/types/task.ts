export type TaskStatus =
  | "todo"
  | "in-progress"
  | "completed";

export type TaskPriority =
  | "low"
  | "medium"
  | "high";

export interface TaskClient {
  _id: string;
  name: string;
  company?: string;
  email?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  client?: TaskClient | null;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  success: boolean;
  count: number;
  tasks: Task[];
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  client: string;
}