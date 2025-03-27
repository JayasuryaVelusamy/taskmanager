import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import taskReducer from '../store/taskSlice';
import { TaskForm } from '../components/TaskForm';
import { MantineProvider } from '@mantine/core';

const createTestStore = () => {
    return configureStore({
        reducer: {
            tasks: taskReducer,
        },
    });
};

const renderWithProviders = (component: React.ReactElement) => {
    const store = createTestStore();
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

describe('TaskForm', () => {
    it('renders form fields correctly', () => {
        renderWithProviders(<TaskForm />);

        expect(screen.getByLabelText(/Task Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Due Date/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add Task/i })).toBeInTheDocument();
    });

    it('handles form submission correctly', () => {
        const mockOnComplete = jest.fn();
        renderWithProviders(<TaskForm onComplete={mockOnComplete} />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/Task Title/i), {
            target: { value: 'Test Task' },
        });
        fireEvent.change(screen.getByLabelText(/Description/i), {
            target: { value: 'Test Description' },
        });

        // Mock date selection
        const dateInput = screen.getByLabelText(/Due Date/i);
        fireEvent.change(dateInput, {
            target: { value: '2024-03-27' },
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

        // Verify onComplete was called
        expect(mockOnComplete).toHaveBeenCalled();
    });

    it('pre-fills form when editing task', () => {
        const mockTask = {
            id: '1',
            title: 'Test Task',
            description: 'Test Description',
            dueDate: '2024-03-27T00:00:00.000Z',
            completed: false,
            order: 0
        };

        renderWithProviders(<TaskForm task={mockTask} />);

        expect(screen.getByLabelText(/Task Title/i)).toHaveValue('Test Task');
        expect(screen.getByLabelText(/Description/i)).toHaveValue('Test Description');
        expect(screen.getByRole('button', { name: /Update Task/i })).toBeInTheDocument();
    });
});
