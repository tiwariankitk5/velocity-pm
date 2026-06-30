export type Role = "owner" | "admin" | "member";
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
}

export interface WorkspaceDTO {
  id: string;
  name: string;
  slug: string;
  role: Role;
  memberCount: number;
}

export interface ProjectDTO {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description?: string;
  status: "active" | "archived";
  deadline?: string;
}

export interface TaskDTO {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  dueDate?: string;
  labels: string[];
  subtasks: Array<{ id: string; title: string; completed: boolean }>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
