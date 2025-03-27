import taskReducer, {
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    reorderTasks,
    setQuote,
} from '../store/taskSlice';
import { Task, TaskFilter } from '../types/task';

interface TaskState {
    tasks: Task[];
    filter: TaskFilter;
    quote: string;
}

describe('taskSlice', () => {
    const initialState: TaskState = {
        tasks: [],
        quote: '',
        filter: 'all'
    };

    it('should handle initial state', () => {
        expect(taskReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle addTask', () => {
        const newTask = {
            id: '1',
            title: 'Test Task',
            description: 'Test Description',
            dueDate: '2024-03-27T00:00:00.000Z',
            completed: false,
            order: 0
        };

        const state = taskReducer(initialState, addTask(newTask));
        expect(state.tasks).toHaveLength(1);
        expect(state.tasks[0]).toEqual(newTask);
    });

    it('should handle updateTask', () => {
        const initialStateWithTask = {
            ...initialState,
            tasks: [{
                id: '1',
                title: 'Old Title',
                description: 'Old Description',
                dueDate: '2024-03-27T00:00:00.000Z',
                completed: false,
                order: 0
            }]
        };

        const updatedTask = {
            id: '1',
            title: 'Updated Title',
            description: 'Updated Description',
            dueDate: '2024-03-28T00:00:00.000Z',
            completed: false,
            order: 0
        };

        const state = taskReducer(initialStateWithTask, updateTask(updatedTask));
        expect(state.tasks[0]).toEqual(updatedTask);
    });

    it('should handle deleteTask', () => {
        const initialStateWithTask = {
            ...initialState,
            tasks: [{
                id: '1',
                title: 'Test Task',
                description: 'Test Description',
                dueDate: '2024-03-27T00:00:00.000Z',
                completed: false,
                order: 0
            }]
        };

        const state = taskReducer(initialStateWithTask, deleteTask('1'));
        expect(state.tasks).toHaveLength(0);
    });

    it('should handle toggleTaskComplete', () => {
        const initialStateWithTask = {
            ...initialState,
            tasks: [{
                id: '1',
                title: 'Test Task',
                description: 'Test Description',
                dueDate: '2024-03-27T00:00:00.000Z',
                completed: false,
                order: 0
            }]
        };

        const state = taskReducer(initialStateWithTask, toggleTaskComplete('1'));
        expect(state.tasks[0].completed).toBe(true);
    });

    it('should handle reorderTasks', () => {
        const initialStateWithTasks = {
            ...initialState,
            tasks: [
                {
                    id: '1',
                    title: 'Task 1',
                    description: 'Description 1',
                    dueDate: '2024-03-27T00:00:00.000Z',
                    completed: false,
                    order: 0
                },
                {
                    id: '2',
                    title: 'Task 2',
                    description: 'Description 2',
                    dueDate: '2024-03-27T00:00:00.000Z',
                    completed: false,
                    order: 1
                }
            ]
        };

        const state = taskReducer(initialStateWithTasks, reorderTasks({ startIndex: 0, endIndex: 1 }));
        expect(state.tasks[0].order).toBe(1);
        expect(state.tasks[1].order).toBe(0);
    });

    it('should handle setQuote', () => {
        const quote = 'Test Quote';
        const state = taskReducer(initialState, setQuote(quote));
        expect(state.quote).toBe(quote);
    });
});
