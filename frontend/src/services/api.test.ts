import axios from 'axios';
import { getTasks, addTask, updateTask, deleteTask } from './api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('api service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getTasks returns tasks', async () => {
    const tasks = [{ id: 1, title: 'Test', completed: false, priority: 0, date: '2025-06-02' }];
    mockedAxios.get.mockResolvedValueOnce({ data: tasks });
    const result = await getTasks();
    expect(result).toEqual(tasks);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks');
  });

  it('addTask posts and returns new task', async () => {
    const newTask = { title: 'New', completed: false, priority: 0, date: '2025-06-02' };
    const returnedTask = { ...newTask, id: 2 };
    mockedAxios.post.mockResolvedValueOnce({ data: returnedTask });
    const result = await addTask(newTask);
    expect(result).toEqual(returnedTask);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/tasks',
      newTask,
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });

  it('updateTask puts and returns updated task', async () => {
    const updatedTask = { id: 1, title: 'Updated', completed: true, priority: 1, date: '2025-06-03' };
    mockedAxios.put.mockResolvedValueOnce({ data: updatedTask });
    const result = await updateTask(updatedTask);
    expect(result).toEqual(updatedTask);
    expect(mockedAxios.put).toHaveBeenCalledWith('/api/tasks/1', updatedTask);
  });

  it('deleteTask calls axios.delete', async () => {
    mockedAxios.delete.mockResolvedValueOnce({});
    await deleteTask(1);
    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/tasks/1');
  });
});