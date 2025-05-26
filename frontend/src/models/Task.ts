export interface Task {
  id: number;
  title: string;
  completed: boolean;
  userId?: number; // Optional, if tasks are user-specific
  priority: number;
  date: string; 
}