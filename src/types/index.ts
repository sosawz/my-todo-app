export interface Project {
  id: string; 
  name: string;
  createdAt?: number;
}

export type Priority = 'Low' | 'Normal' | 'High';

export interface Task {
  id: string;
  title: string;
  projectId: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;   
  createdAt: number;  
}

export interface SubTask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface MyTodoData {
  projects: Project[];
  tasks: Task[];
  subTasks: SubTask[];
}