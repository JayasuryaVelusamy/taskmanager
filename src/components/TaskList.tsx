import React, { useMemo, useState, useEffect } from 'react';
import { Card, Text, Button, Group, Stack, Paper, useMantineColorScheme, Tabs } from '@mantine/core';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { deleteTask, toggleTaskComplete, reorderTasks } from '../store/taskSlice';
import { Task } from '../types/task';

interface TaskItemProps {
    task: Task;
    onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = React.memo(({ task, onEdit }) => {
    const dispatch = useAppDispatch();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const isPastDue = new Date(task.dueDate) < new Date();

    const getCardColors = () => {
        if (task.completed) {
            return {
                border: isDark ? '#2F9E44' : '#37B24D',
                bg: isDark ? 'rgba(47, 158, 68, 0.1)' : 'rgba(47, 158, 68, 0.05)',
                text: isDark ? '#40C057' : '#2F9E44'
            };
        }
        if (isPastDue) {
            return {
                border: isDark ? '#FA5252' : '#E03131',
                bg: isDark ? 'rgba(250, 82, 82, 0.1)' : 'rgba(250, 82, 82, 0.05)',
                text: isDark ? '#FF6B6B' : '#FA5252'
            };
        }
        return {
            border: isDark ? '#4C51BF' : '#228BE6',
            bg: isDark ? 'rgba(76, 81, 191, 0.1)' : 'white',
            text: isDark ? '#5C7CFA' : '#228BE6'
        };
    };

    const colors = getCardColors();

    return (
        <Draggable draggableId={task.id} index={task.order}>
            {(provided: DraggableProvided) => (
                <Card
                    shadow="sm"
                    padding="lg"
                    withBorder
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        ...provided.draggableProps.style,
                        marginBottom: '0.5rem',
                        borderLeft: `4px solid ${colors.border}`,
                        backgroundColor: colors.bg,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: isDark
                                ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                                : '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }
                    }}
                >
                    <Stack>
                        <Group style={{ justifyContent: 'space-between' }}>
                            <Text
                                fw={600}
                                size="lg"
                                style={{
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    color: colors.text
                                }}
                            >
                                {task.title}
                            </Text>
                            <Text
                                size="sm"
                                style={{
                                    color: isPastDue
                                        ? isDark ? '#FF6B6B' : '#FA5252'
                                        : isDark ? '#A0AEC0' : '#718096',
                                    fontWeight: isPastDue ? 600 : 400
                                }}
                            >
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                            </Text>
                        </Group>
                        <Text
                            size="sm"
                            style={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: isDark ? '#E2E8F0' : '#4A5568'
                            }}
                        >
                            {task.description}
                        </Text>
                        <Group style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <Button
                                variant="light"
                                color={task.completed
                                    ? isDark ? "gray" : "dark"
                                    : isDark ? "teal" : "green"}
                                onClick={() => dispatch(toggleTaskComplete(task.id))}
                                style={{ transition: 'transform 0.2s' }}
                            >
                                {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                            </Button>
                            <Button
                                variant="light"
                                color={isDark ? "violet" : "blue"}
                                onClick={() => onEdit(task)}
                                style={{ transition: 'transform 0.2s' }}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="light"
                                color={isDark ? "pink" : "red"}
                                onClick={() => dispatch(deleteTask(task.id))}
                                style={{ transition: 'transform 0.2s' }}
                            >
                                Delete
                            </Button>
                        </Group>
                    </Stack>
                </Card>
            )}
        </Draggable>
    );
});

TaskItem.displayName = 'TaskItem';

interface TaskListProps {
    onEditTask: (task: Task) => void;
    view: 'all' | 'kanban';
}

export const TaskList: React.FC<TaskListProps> = React.memo(({ onEditTask, view }) => {
    const dispatch = useAppDispatch();
    const tasks = useAppSelector(state => state.tasks.tasks);
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const [statusFilter, setStatusFilter] = useState<string>(() => {
        return localStorage.getItem('taskManagerStatusFilter') || 'all';
    });

    useEffect(() => {
        localStorage.setItem('taskManagerStatusFilter', statusFilter);
    }, [statusFilter]);

    const sortedTasks = useMemo(() => [...tasks].sort((a, b) => a.order - b.order), [tasks]);

    const filteredAndSortedTasks = useMemo(() => {
        if (statusFilter === 'completed') {
            return sortedTasks.filter(task => task.completed);
        } else if (statusFilter === 'pending') {
            return sortedTasks.filter(task => !task.completed);
        }
        return sortedTasks;
    }, [sortedTasks, statusFilter]);

    const { pendingTasks, completedTasks } = useMemo(() => ({
        pendingTasks: sortedTasks.filter((task: Task) => !task.completed),
        completedTasks: sortedTasks.filter((task: Task) => task.completed)
    }), [sortedTasks]);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        let sourceTask: Task;
        let destinationIndex: number;

        if (view === 'kanban') {
            const sourceIsPending = result.source.droppableId === 'pending';
            const destIsPending = result.destination.droppableId === 'pending';
            const sourceList = sourceIsPending ? pendingTasks : completedTasks;
            sourceTask = sourceList[result.source.index];

            if (sourceIsPending !== destIsPending) {
                dispatch(toggleTaskComplete(sourceTask.id));
            }

            const pendingOffset = destIsPending ? 0 : pendingTasks.length;
            destinationIndex = pendingOffset + result.destination.index;
        } else {
            sourceTask = sortedTasks[result.source.index];
            destinationIndex = result.destination.index;
        }

        const taskIndex = tasks.findIndex(t => t.id === sourceTask.id);
        dispatch(reorderTasks({
            startIndex: taskIndex,
            endIndex: destinationIndex
        }));
    };

    const renderAllView = () => (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Stack style={{ gap: '1rem' }}>
                <Group justify="flex-start">
                    <Tabs
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value || 'all')}
                        styles={{
                            tab: {
                                fontWeight: 600,
                                color: isDark ? '#E2E8F0' : '#2D3748',
                                '&[data-active]': {
                                    background: isDark
                                        ? 'linear-gradient(135deg, #4C51BF 0%, #6B46C1 100%)'
                                        : 'linear-gradient(135deg, #4299E1 0%, #63B3ED 100%)',
                                    color: 'white',
                                    border: 'none'
                                }
                            }
                        }}
                    >
                        <Tabs.List>
                            <Tabs.Tab value="all">All</Tabs.Tab>
                            <Tabs.Tab value="pending">Pending</Tabs.Tab>
                            <Tabs.Tab value="completed">Completed</Tabs.Tab>
                        </Tabs.List>
                    </Tabs>
                </Group>
                <Droppable droppableId="all">
                    {(provided: DroppableProvided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            <Stack style={{ gap: '1rem' }}>
                                {filteredAndSortedTasks.map((task: Task, index: number) => (
                                    <TaskItem
                                        key={task.id}
                                        task={{ ...task, order: index }}
                                        onEdit={onEditTask}
                                    />
                                ))}
                                {filteredAndSortedTasks.length === 0 && (
                                    <Text ta="center" c="dimmed">
                                        No tasks found
                                    </Text>
                                )}
                            </Stack>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </Stack>
        </DragDropContext>
    );

    const columnStyle = (isCompleted: boolean) => ({
        background: isDark
            ? isCompleted
                ? 'linear-gradient(135deg, #2F6B25, #2D5922)'
                : 'linear-gradient(135deg, #2B4999, #1A365D)'
            : isCompleted
                ? 'linear-gradient(135deg, #2F9E44, #37B24D)'
                : 'linear-gradient(135deg, #228BE6, #15AABF)',
        color: 'white',
        borderRadius: '8px 8px 0 0'
    });

    const renderKanbanView = () => (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Group align="flex-start" grow style={{ gap: '1rem' }}>
                <Stack style={{ gap: '1rem' }}>
                    <Paper
                        withBorder
                        p="md"
                        style={columnStyle(false)}
                    >
                        <Group justify="space-between" mb="md">
                            <Text fw={600} size="lg">Pending Tasks</Text>
                            <Text size="sm" style={{ opacity: 0.9 }}>{pendingTasks.length}</Text>
                        </Group>
                        <Droppable droppableId="pending">
                            {(provided: DroppableProvided) => (
                                <Paper
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={{
                                        minHeight: '200px',
                                        backgroundColor: isDark ? '#1A202C' : 'white',
                                        borderRadius: '0 0 8px 8px',
                                        padding: '1rem'
                                    }}
                                    withBorder
                                >
                                    {pendingTasks.map((task: Task, index: number) => (
                                        <TaskItem
                                            key={task.id}
                                            task={{ ...task, order: index }}
                                            onEdit={onEditTask}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </Paper>
                            )}
                        </Droppable>
                    </Paper>
                </Stack>

                <Stack style={{ gap: '1rem' }}>
                    <Paper
                        withBorder
                        p="md"
                        style={columnStyle(true)}
                    >
                        <Group justify="space-between" mb="md">
                            <Text fw={600} size="lg">Completed Tasks</Text>
                            <Text size="sm" style={{ opacity: 0.9 }}>{completedTasks.length}</Text>
                        </Group>
                        <Droppable droppableId="completed">
                            {(provided: DroppableProvided) => (
                                <Paper
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={{
                                        minHeight: '200px',
                                        backgroundColor: isDark ? '#1A202C' : 'white',
                                        borderRadius: '0 0 8px 8px',
                                        padding: '1rem'
                                    }}
                                    withBorder
                                >
                                    {completedTasks.map((task: Task, index: number) => (
                                        <TaskItem
                                            key={task.id}
                                            task={{ ...task, order: index }}
                                            onEdit={onEditTask}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </Paper>
                            )}
                        </Droppable>
                    </Paper>
                </Stack>
            </Group>
        </DragDropContext>
    );

    return view === 'all' ? renderAllView() : renderKanbanView();
});

TaskList.displayName = 'TaskList';
