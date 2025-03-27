import React, { useState, useCallback } from 'react';
import { TextInput, Textarea, Button, Group, Stack, Paper, useMantineColorScheme } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useAppDispatch } from '../hooks/reduxHooks';
import { addTask, updateTask } from '../store/taskSlice';
import { Task } from '../types/task';
import { v4 as uuidv4 } from 'uuid';

interface TaskFormProps {
    task?: Task;
    onComplete?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = React.memo(({ task, onComplete }) => {
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [dueDate, setDueDate] = useState<Date | null>(task?.dueDate ? new Date(task.dueDate) : null);
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !dueDate) return;

        const baseTaskData = {
            id: task?.id || uuidv4(),
            title: title.trim(),
            description: description.trim(),
            dueDate: dueDate.toISOString(),
            completed: task?.completed || false,
        };

        if (task) {
            dispatch(updateTask({ ...baseTaskData, order: task.order }));
        } else {
            dispatch(addTask(baseTaskData));
        }

        setTitle('');
        setDescription('');
        setDueDate(null);
        onComplete?.();
    }, [title, description, dueDate, task, dispatch, onComplete]);

    const inputStyles = {
        label: {
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: isDark ? '#E2E8F0' : '#2D3748'
        },
        input: {
            backgroundColor: isDark ? '#2D3748' : undefined,
            color: isDark ? '#E2E8F0' : undefined,
            borderColor: isDark ? '#4A5568' : undefined,
            '&:focus': {
                borderColor: isDark ? '#4C51BF' : '#4299E1'
            }
        }
    };

    return (
        <Paper
            withBorder
            p="md"
            radius="md"
            style={{
                background: isDark
                    ? 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)'
                    : 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(66, 153, 225, 0.2)'}`
            }}
        >
            <form onSubmit={handleSubmit}>
                <Stack style={{ gap: '1.5rem' }}>
                    <TextInput
                        required
                        label="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter task title"
                        styles={inputStyles}
                    />
                    <Textarea
                        required
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter task description"
                        minRows={3}
                        styles={inputStyles}
                    />
                    <DateInput
                        required
                        label="Due Date"
                        value={dueDate}
                        onChange={setDueDate}
                        placeholder="Select due date"
                        clearable
                        styles={inputStyles}
                    />
                    <Group justify="flex-end">
                        <Button
                            type="submit"
                            style={{
                                background: isDark
                                    ? 'linear-gradient(135deg, #4C51BF 0%, #6B46C1 100%)'
                                    : 'linear-gradient(135deg, #4299E1 0%, #63B3ED 100%)',
                                border: 'none',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: isDark
                                        ? '0 4px 12px rgba(76, 81, 191, 0.3)'
                                        : '0 4px 12px rgba(66, 153, 225, 0.3)'
                                }
                            }}
                        >
                            {task ? 'Update Task' : 'Add Task'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
});

TaskForm.displayName = 'TaskForm';
