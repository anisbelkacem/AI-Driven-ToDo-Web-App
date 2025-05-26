export interface Task {
  id: number;
  title: string;
  completed: boolean;
  userId?: number; // Optional, if tasks are user-specific
  priority: number;
  
  
  // Add any other fields you need
  // For example, priority, due date, etc.
  // priority?: 'low' | 'medium' | 'high';
  // dueDate?: string; // ISO date string
  // Add any other fields you need
  // For example, tags, notes, etc.
  // tags?: string[]; // Array of tags
  // notes?: string; // Additional notes for the task
  // You can also add methods if needed, e.g., to format dates or check completion status
  // formatCreatedAt?: () => string; // Method to format createdAt date
}