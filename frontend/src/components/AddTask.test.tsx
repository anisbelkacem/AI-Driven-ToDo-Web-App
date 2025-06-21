import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddTask from './AddTask';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import * as api from '../services/api';

// Mock the API call
jest.mock('../services/api', () => ({
  addTask: jest.fn(() => Promise.resolve({ id: 1, title: 'My new task' })),
}));

function renderAddTask(onAdd = jest.fn()) {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <AddTask onAdd={onAdd} />
    </QueryClientProvider>
  );
}

test('renders AddTask and allows input', () => {
  renderAddTask();
  const input = screen.getByLabelText(/add a new task/i);
  fireEvent.change(input, { target: { value: 'My new task' } });
  expect(input).toHaveValue('My new task');
});

test('does not call onAdd when input is empty', () => {
  const onAdd = jest.fn();
  renderAddTask(onAdd);
  const addButton = screen.getByRole('button', { name: /add/i });
  expect(addButton).toBeDisabled();
  fireEvent.click(addButton);
  expect(onAdd).not.toHaveBeenCalled();
});

test('clears input after successful submit', async () => {
  renderAddTask();
  const input = screen.getByLabelText(/add a new task/i);
  const dateInput = screen.getByLabelText(/date/i);

  fireEvent.change(input, { target: { value: 'My new task' } });
  fireEvent.change(dateInput, { target: { value: '2025-06-02' } });

  const addButton = screen.getByRole('button', { name: /add/i });
  expect(addButton).not.toBeDisabled();
  fireEvent.click(addButton);

  await waitFor(() => {
    expect(input).toHaveValue('');
  });
});

test('shows error message when mutation fails', async () => {
  // Override the mock to simulate an error
  const errorMessage = 'Network Error';
  (api.addTask as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

  renderAddTask();
  const input = screen.getByLabelText(/add a new task/i);
  const dateInput = screen.getByLabelText(/date/i);
  fireEvent.change(input, { target: { value: 'My new task' } });
  fireEvent.change(dateInput, { target: { value: '2025-06-02' } });

  const addButton = screen.getByRole('button', { name: /add/i });
  fireEvent.click(addButton);

  // Wait for error message to appear
  expect(await screen.findByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
});

test('does not allow submitting whitespace-only task', () => {
  renderAddTask();
  const input = screen.getByLabelText(/add a new task/i);
  fireEvent.change(input, { target: { value: '   ' } });
  const addButton = screen.getByRole('button', { name: /add/i });
  expect(addButton).toBeDisabled();
});

test('date input defaults to today', () => {
  renderAddTask();
  const dateInput = screen.getByLabelText(/date/i);
  const today = new Date().toISOString().slice(0, 10);
  expect(dateInput).toHaveValue(today);
});

test('resets date to today after successful submit', async () => {
  renderAddTask();
  const input = screen.getByLabelText(/add a new task/i);
  const dateInput = screen.getByLabelText(/date/i);

  fireEvent.change(input, { target: { value: 'My new task' } });
  fireEvent.change(dateInput, { target: { value: '2025-06-02' } });

  const addButton = screen.getByRole('button', { name: /add/i });
  fireEvent.click(addButton);

  await waitFor(() => {
    expect(input).toHaveValue('');
    expect(dateInput).toHaveValue(new Date().toISOString().slice(0, 10));
  });
});

test('does not allow submitting if date is empty', () => {
  renderAddTask();
  const input = screen.getByLabelText(/add a new task/i);
  const dateInput = screen.getByLabelText(/date/i);

  fireEvent.change(input, { target: { value: 'My new task' } });
  fireEvent.change(dateInput, { target: { value: '' } });

  const addButton = screen.getByRole('button', { name: /add/i });
  expect(addButton).toBeDisabled();
});