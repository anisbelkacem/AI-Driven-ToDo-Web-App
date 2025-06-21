import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import App from './App';

// Suppress console.error for cleaner test output
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

// Mock functions we'll use across tests
const mockRefetchTasks = jest.fn();
const mockAxiosGet = jest.fn();
const mockAxiosPost = jest.fn();

// Mock Login component
jest.mock('./components/Login', () => ({
  __esModule: true,
  default: ({ onLogin }: any) => <button onClick={onLogin}>Mock Login</button>
}));

// Mock axios
jest.mock('axios', () => ({
  get: () => mockAxiosGet(),
  post: () => mockAxiosPost()
}));

// First, modify the top-level useTasks mock to use a variable for isLoading
let mockIsLoading = false;  // Add this at the top with other mock variables

// Add this at the top with other mock variables
let mockTasks: Array<{ id: number; title: string; completed: boolean; date: string; priority: number }> = [];

// Update the useTasks mock to use mockTasks
jest.mock('./hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: mockTasks,
    addTask: jest.fn(),
    updateTask: jest.fn(),
    toggleTask: jest.fn(),
    deleteTask: jest.fn(),
    isLoading: mockIsLoading,
    refetchTasks: mockRefetchTasks
  })
}));

describe('App', () => {
  beforeEach(() => {
    // Reset all mocks and states before each test
    jest.clearAllMocks();
    mockIsLoading = false;
    mockTasks = [];
    mockAxiosGet.mockResolvedValue({ data: { firstName: 'Test', lastName: 'User' } });
    mockAxiosPost.mockResolvedValue({ status: 200 });
  });

  it('renders login button', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(screen.getByText(/mock login/i)).toBeInTheDocument();
  });

  it('renders without crashing', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(screen.getByText(/mock login/i)).toBeInTheDocument();
  });

  it('matches snapshot', async () => {
    const queryClient = new QueryClient();
    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('shows info alert when no tasks after login', async () => {
    jest.doMock('./hooks/useTasks', () => ({
      useTasks: () => ({
        tasks: [],
        addTask: jest.fn(),
        updateTask: jest.fn(),
        toggleTask: jest.fn(),
        deleteTask: jest.fn(),
        isLoading: false,
        refetchTasks: jest.fn(),
      }),
    }));
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    // Simulate login
    await act(async () => {
      screen.getByText(/mock login/i).click();
    });
    // Wait for the alert to appear
    expect(await screen.findByText(/no tasks found/i)).toBeInTheDocument();
  });

  it('shows loading spinner when loading after login', async () => {
    mockIsLoading = true;  // Set loading state to true
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    // Simulate login
    await act(async () => {
      screen.getByText(/mock login/i).click();
    });
    // Wait for and verify the loading spinner
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    // First login
    const loginButton = screen.getByText(/mock login/i);
    await act(async () => {
      loginButton.click();
    });
    // Open user menu
    const avatarButton = await screen.findByLabelText(/user menu/i);
    await act(async () => {
      avatarButton.click();
    });
    // Click logout
    const logoutItem = await screen.findByTestId('logout-menu-item');
    await act(async () => {
      logoutItem.click();
    });
    // Verify we're back to login screen and refetchTasks was called
    expect(await screen.findByText(/mock login/i)).toBeInTheDocument();
    expect(mockRefetchTasks).toHaveBeenCalled();
  });

  it('filters tasks correctly', async () => {
    // Set up mock tasks for this test
    mockTasks = [
      { id: 1, title: 'Task 1', completed: false, date: '2025-06-01', priority: 0 },
      { id: 2, title: 'Task 2', completed: true, date: '2025-06-15', priority: 1 },
    ];
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    // Login first
    await act(async () => {
      screen.getByText(/mock login/i).click();
    });
    // Verify initial state shows all tasks
    expect(await screen.findByText(/task 1/i)).toBeInTheDocument();
    expect(screen.getByText(/task 2/i)).toBeInTheDocument();
    // Find select elements
    const monthSelect = screen.getByTestId('month-filter-select');
    // Filter by month (June = 6)
    await act(async () => {
      fireEvent.change(monthSelect, { target: { value: 6 } }); // Changed to number
    });
    // Wait for re-render
    await screen.findByText(/task 1/i);
    // Should only see June tasks
    expect(screen.getByText(/task 1/i)).toBeInTheDocument();
    expect(screen.getByText(/task 2/i)).toBeInTheDocument();
    // Filter completed tasks
    const statusSelect = screen.getByTestId('status-filter-select');
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'completed' } });
    });
    // Wait for re-render
    await screen.findByText(/task 2/i);
    // Should only see completed June tasks
    expect(screen.queryByText(/task 1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/task 2/i)).toBeInTheDocument();
  });

  it('opens and closes user menu', async () => {
    mockTasks = [];
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    // Login first
    await act(async () => {
      screen.getByText(/mock login/i).click();
    });
    // Open menu
    const avatarButton = screen.getByLabelText(/user menu/i);
    await act(async () => {
      avatarButton.click();
    });
    // Verify menu is open
    const menu = screen.getByTestId('user-menu');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveClass('MuiMenu-root');
    expect(screen.getByText(/settings/i)).toBeVisible();
    // Close menu
    await act(async () => {
      screen.getByText(/settings/i).click();
    });
    // Verify menu items are not visible after closing
    expect(screen.queryByText(/settings/i)).not.toBeVisible();
  });

  it('handles API error during user data fetch', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API Error'));
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    // Login to trigger API call
    await act(async () => {
      screen.getByText(/mock login/i).click();
    });
    // Verify error is handled
    expect(await screen.findByText(/your tasks/i)).toBeInTheDocument();
  });

  it('shows loading spinner when tasks are loading', async () => {
    mockIsLoading = true;
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    await act(async () => {
      screen.getByText(/mock login/i).click();
    });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows empty state when no tasks exist', async () => {
    mockTasks = [];
    mockIsLoading = false;
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    await act(async () => {
      screen.getByText(/mock login/i).click();
    });
    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
  });

  it('redirects to login when accessing protected route while not authenticated', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(window.location.pathname).toBe('/login');
  });

  it('shows login screen when not authenticated', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(screen.getByText(/mock login/i)).toBeInTheDocument();
  });
});