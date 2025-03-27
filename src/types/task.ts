export interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
    order: number;
}

export type TaskFilter = 'all' | 'completed' | 'pending';
