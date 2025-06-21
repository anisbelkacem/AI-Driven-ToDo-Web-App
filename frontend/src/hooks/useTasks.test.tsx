import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as taskApi from '../services/api';
import { useTasks } from './useTasks';

jest.mock('../services/api');

const mockTasks = [
  { id: 1, title: 'Task 1', completed: false, priority: 0, date: '2025-06-02' },
];

// FIX: Use object instead of {} as type
function wrapper({ children }: React.PropsWithChildren<object>) {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (taskApi.getTasks as jest.Mock).mockResolvedValue(mockTasks);
    (taskApi.addTask as jest.Mock).mockResolvedValue({ ...mockTasks[0], id: 2 });
    (taskApi.updateTask as jest.Mock).mockResolvedValue({ ...mockTasks[0], title: 'Updated' });
    (taskApi.deleteTask as jest.Mock).mockResolvedValue({});
  });
  
  it('adds a task', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    await act(async () => {
      result.current.addTask({ title: 'New', completed: false, priority: 0, date: '2025-06-03' });
    });
    expect(taskApi.addTask).toHaveBeenCalled();
  });

  it('updates a task', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    await act(async () => {
      result.current.updateTask({ ...mockTasks[0], title: 'Updated' });
    });
    expect(taskApi.updateTask).toHaveBeenCalled();
  });

  it('toggles a task', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    await act(async () => {
      result.current.toggleTask({ ...mockTasks[0], completed: true });
    });
    expect(taskApi.updateTask).toHaveBeenCalled();
  });

  it('deletes a task', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    await act(async () => {
      result.current.deleteTask(1);
    });
    expect(taskApi.deleteTask).toHaveBeenCalledWith(1);
  });

  it('isLoading is false when no mutation is pending', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    expect(result.current.isLoading).toBe(false);
  });
});