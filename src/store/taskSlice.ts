import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskFilter } from '../types/task';

interface TaskState {
    tasks: Task[];
    filter: TaskFilter;
    quote: string;
}

const initialState: TaskState = {
    tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
    filter: 'all',
    quote: '',
};

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        addTask: (state, action: PayloadAction<Omit<Task, 'order'>>) => {
            const maxOrder = state.tasks.reduce((max, task) => Math.max(max, task.order), -1);
            const newTask = { ...action.payload, order: maxOrder + 1 };
            state.tasks.push(newTask);
            localStorage.setItem('tasks', JSON.stringify(state.tasks));
        },
        reorderTasks: (state, action: PayloadAction<{ startIndex: number; endIndex: number }>) => {
            const { startIndex, endIndex } = action.payload;
            // Remove task from current position
            const [task] = state.tasks.splice(startIndex, 1);

            // Insert at new position
            if (endIndex <= startIndex) {
                state.tasks.splice(endIndex, 0, task);
            } else {
                state.tasks.splice(endIndex - 1, 0, task);
            }

            // Update order of all tasks
            state.tasks.forEach((task, index) => {
                task.order = index;
            });

            localStorage.setItem('tasks', JSON.stringify(state.tasks));
        },
        updateTask: (state, action: PayloadAction<Task>) => {
            const index = state.tasks.findIndex(task => task.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
                localStorage.setItem('tasks', JSON.stringify(state.tasks));
            }
        },
        deleteTask: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter(task => task.id !== action.payload);
            localStorage.setItem('tasks', JSON.stringify(state.tasks));
        },
        setFilter: (state, action: PayloadAction<TaskFilter>) => {
            state.filter = action.payload;
        },
        setQuote: (state, action: PayloadAction<string>) => {
            state.quote = action.payload;
        },
        toggleTaskComplete: (state, action: PayloadAction<string>) => {
            const task = state.tasks.find(task => task.id === action.payload);
            if (task) {
                task.completed = !task.completed;
                localStorage.setItem('tasks', JSON.stringify(state.tasks));
            }
        }
    }
});

export const {
    addTask,
    updateTask,
    deleteTask,
    setFilter,
    setQuote,
    toggleTaskComplete,
    reorderTasks
} = taskSlice.actions;

export default taskSlice.reducer;
