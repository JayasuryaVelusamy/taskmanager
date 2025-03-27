import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DragDropContext } from 'react-beautiful-dnd';
import taskReducer from '../store/taskSlice';
import { TaskList } from '../components/TaskList';
import { MantineProvider } from '@mantine/core';
import { Task, TaskFilter } from '../types/task';

// Mock react-beautiful-dnd
jest.mock('react-beautiful-dnd', () => ({
    DragDropContext: ({ children }: { children: React.ReactNode }) => children,
    Droppable: ({ children }: { children: Function }) => children({
        draggableProps: {
            style: {},
        },
        innerRef: jest.fn(),
    }),
    Draggable: ({ children }: { children: Function }) => children({
        draggableProps: {
            style: {},
        },
        innerRef: jest.fn(),
        dragHandleProps: {},
    }),
}));

const mockTasks = [
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
        dueDate: '2024-03-28T00:00:00.000Z',
        completed: true,
        order: 1
    }
];

interface TaskState {
    tasks: Task[];
    filter: TaskFilter;
    quote: string;
}

const defaultState: TaskState = {
    tasks: mockTasks,
    filter: 'all',
    quote: ''
};

const createTestStore = (initialState: Partial<TaskState> = {}) => {
    return configureStore({
        reducer: {
            tasks: taskReducer,
        },
        preloadedState: {
            tasks: {
                ...defaultState,
                ...initialState
            }
        }
    });
};

const renderWithProviders = (component: React.ReactElement, initialState: Partial<TaskState> = {}) => {
    const store = createTestStore(initialState);
    return {
        ...render(
            <Provider store={store}>
                <MantineProvider>
                    {component}
                </MantineProvider>
            </Provider>
        ),
        store,
    };
};

describe('TaskList', () => {
    describe('All View', () => {
        it('renders tasks in list view', () => {
            renderWithProviders(<TaskList onEditTask={jest.fn()} view="all" />);

            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
            expect(screen.getByText('Description 1')).toBeInTheDocument();
            expect(screen.getByText('Description 2')).toBeInTheDocument();
        });

        it('handles task deletion in list view', () => {
            const { store } = renderWithProviders(<TaskList onEditTask={jest.fn()} view="all" />);

            const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
            fireEvent.click(deleteButtons[0]);

            const state = store.getState();
            expect(state.tasks.tasks).toHaveLength(1);
            expect(state.tasks.tasks[0].id).toBe('2');
        });

        it('calls onEditTask when edit button is clicked in list view', () => {
            const mockOnEdit = jest.fn();
            renderWithProviders(<TaskList onEditTask={mockOnEdit} view="all" />);

            const editButtons = screen.getAllByRole('button', { name: /Edit/i });
            fireEvent.click(editButtons[0]);

            expect(mockOnEdit).toHaveBeenCalledWith(mockTasks[0]);
        });

        it('toggles task completion status in list view', () => {
            const { store } = renderWithProviders(<TaskList onEditTask={jest.fn()} view="all" />);

            const toggleButtons = screen.getAllByRole('button', {
                name: /(Mark Complete|Mark Incomplete)/i
            });
            fireEvent.click(toggleButtons[0]);

            const state = store.getState();
            expect(state.tasks.tasks[0].completed).toBe(true);
        });
    });

    describe('Kanban View', () => {
        it('renders separate columns for pending and completed tasks', () => {
            renderWithProviders(<TaskList onEditTask={jest.fn()} view="kanban" />);

            expect(screen.getByText('Pending Tasks')).toBeInTheDocument();
            expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
        });

        it('shows correct task counts in column headers', () => {
            renderWithProviders(<TaskList onEditTask={jest.fn()} view="kanban" />);

            const pendingCount = screen.getByText('1');
            const completedCount = screen.getByText('1');

            expect(pendingCount).toBeInTheDocument();
            expect(completedCount).toBeInTheDocument();
        });

        it('displays tasks in correct columns', () => {
            renderWithProviders(<TaskList onEditTask={jest.fn()} view="kanban" />);

            const pendingColumn = screen.getByText('Pending Tasks').closest('div');
            const completedColumn = screen.getByText('Completed Tasks').closest('div');

            expect(pendingColumn).toContainElement(screen.getByText('Task 1'));
            expect(completedColumn).toContainElement(screen.getByText('Task 2'));
        });

        it('handles task deletion in kanban view', () => {
            const { store } = renderWithProviders(<TaskList onEditTask={jest.fn()} view="kanban" />);

            const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
            fireEvent.click(deleteButtons[0]);

            const state = store.getState();
            expect(state.tasks.tasks).toHaveLength(1);
            expect(state.tasks.tasks[0].id).toBe('2');
        });
    });
});
