import React, { useState, useEffect, useCallback } from 'react';
import { createTheme, MantineProvider, Container, Title, Stack, ActionIcon, useMantineColorScheme, Group, Button, Tabs, Modal, Paper } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { QuoteDisplay } from './components/QuoteDisplay';
import { Task } from './types/task';

const ThemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ActionIcon
      onClick={() => toggleColorScheme()}
      variant="outline"
      size="lg"
      aria-label="Toggle color scheme"
      style={{
        borderColor: 'transparent',
        background: isDark ? 'rgba(26, 32, 44, 0.5)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)'
      }}
    >
      {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  );
};

const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem 0',
      background: isDark
        ? 'linear-gradient(135deg, #1A202C 0%, #2D3748 50%, #1A202C 100%)'
        : 'linear-gradient(135deg, #EBF4FF 0%, #E6FFFA 50%, #EBF8FF 100%)'
    }}>
      {children}
    </div>
  );
};

const AppContent = () => {
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('taskManagerActiveTab') || 'all';
  });
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    localStorage.setItem('taskManagerActiveTab', activeTab);
  }, [activeTab]);
  const isDark = colorScheme === 'dark';

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  }, []);

  const handleCompleteEdit = useCallback(() => {
    setEditingTask(undefined);
    setIsFormOpen(false);
  }, []);

  return (
    <Container size="md" py="xl">
      <Paper
        withBorder
        shadow="md"
        radius="lg"
        p="xl"
        style={{
          background: isDark ? 'rgba(26, 32, 44, 0.5)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'}`
        }}
      >
        <Stack style={{ gap: '2rem' }}>
          <Group style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Title
              order={1}
              style={{
                color: isDark ? '#E2E8F0' : '#2D3748',
                fontWeight: 700,
                fontSize: '2rem',
                transition: 'color 0.2s ease'
              }}
            >
              Task Manager
            </Title>
            <ThemeToggle />
          </Group>
          <QuoteDisplay />
          <Paper
            p="md"
            radius="md"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)'
                : 'linear-gradient(135deg, #E2E8F0 0%, #EDF2F7 100%)'
            }}
          >
            <Group style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Tabs
                value={activeTab}
                onChange={(value) => setActiveTab(value || 'all')}
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
                  <Tabs.Tab value="all">All Tasks</Tabs.Tab>
                  <Tabs.Tab value="kanban">Kanban Board</Tabs.Tab>
                </Tabs.List>
              </Tabs>
              <Button
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #4C51BF 0%, #6B46C1 100%)'
                    : 'linear-gradient(135deg, #4299E1 0%, #63B3ED 100%)',
                  border: 'none',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => setIsFormOpen(true)}
              >
                Add Task
              </Button>
            </Group>
          </Paper>

          <Modal
            opened={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingTask(undefined);
            }}
            title={editingTask ? "Edit Task" : "Add New Task"}
            size="md"
            styles={{
              title: {
                fontWeight: 600,
                background: isDark
                  ? 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E0 100%)'
                  : 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }
            }}
          >
            <TaskForm
              task={editingTask}
              onComplete={handleCompleteEdit}
            />
          </Modal>

          <TaskList
            onEditTask={handleEditTask}
            view={activeTab as 'all' | 'kanban'}
          />
        </Stack>
      </Paper>
    </Container>
  );
};

const theme = createTheme({
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
  primaryColor: 'blue',
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
    blue: [
      '#E6F3FF',
      '#C3E0FF',
      '#95C5FF',
      '#67AAFF',
      '#4299E1',
      '#3182CE',
      '#2B6CB0',
      '#2C5282',
      '#2A4365',
      '#1A365D'
    ]
  }
});

export const App = () => {
  return (
    <Provider store={store}>
      <MantineProvider
        theme={theme}
        defaultColorScheme="light"
        colorSchemeManager={{
          get: () => (localStorage.getItem('taskManagerColorScheme') as 'light' | 'dark') || 'light',
          set: (colorScheme) => localStorage.setItem('taskManagerColorScheme', colorScheme),
          subscribe: () => () => { },  // No-op since we don't need external subscriptions
          unsubscribe: () => { },     // No-op since we don't use subscriptions
          clear: () => localStorage.removeItem('taskManagerColorScheme')
        }}
      >
        <AppWrapper>
          <AppContent />
        </AppWrapper>
      </MantineProvider>
    </Provider>
  );
};

export default App;
