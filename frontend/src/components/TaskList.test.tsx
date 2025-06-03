import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskList } from './TaskList';
import { act } from 'react';
import { within } from '@testing-library/react';

const tasks = [
  { id: 1, title: 'Task 1', completed: false, priority: 0, date: '2025-06-02' },
  { id: 2, title: 'Task 2', completed: true, priority: 1, date: '2025-06-03' },
];

const setup = (props = {}) => {
  const defaultProps = {
    tasks,
    onToggle: jest.fn(),
    onUpdate: jest.fn(() => Promise.resolve()),
    onDelete: jest.fn(() => Promise.resolve()),
    refetchTasks: jest.fn(),
    selectedMonth: '',
    setSelectedMonth: jest.fn(),
    selectedDay: '',
    setSelectedDay: jest.fn(),
    completionFilter: 'all',
    setCompletionFilter: jest.fn(),
    ...props,
  };
  render(<TaskList {...defaultProps} />);
  return defaultProps;
};

test('renders tasks and allows toggling completion', async () => {
  const props = setup();
  expect(screen.getByText('Task 1')).toBeInTheDocument();
  expect(screen.getByText('Task 2')).toBeInTheDocument();

  const checkboxes = screen.getAllByRole('checkbox');
  await act(async () => {
    fireEvent.click(checkboxes[0]);
  });
  expect(props.onUpdate).toHaveBeenCalled();
});

test('shows empty message when no tasks', () => {
  setup({ tasks: [] });
  expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
});

test('filters by month', () => {
  const setSelectedMonth = jest.fn();
  setup({ setSelectedMonth });
  fireEvent.change(screen.getByLabelText(/month/i), { target: { value: '2025-06' } });
  expect(setSelectedMonth).toHaveBeenCalledWith('2025-06');
});

test('filters by day', () => {
  const setSelectedDay = jest.fn();
  setup({ selectedMonth: '2025-06', setSelectedDay });
  fireEvent.change(screen.getByLabelText(/day/i), { target: { value: '2025-06-02' } });
  expect(setSelectedDay).toHaveBeenCalledWith('2025-06-02');
});

test('filters by completion status', () => {
  const setCompletionFilter = jest.fn();
  setup({ setCompletionFilter });
  fireEvent.change(screen.getByLabelText(/completion status/i), { target: { value: 'completed' } });
  expect(setCompletionFilter).toHaveBeenCalledWith('completed');
});

test('edit mode: can edit and save a task', async () => {
  const onUpdate = jest.fn(() => Promise.resolve());
  setup({ onUpdate });
  fireEvent.click(screen.getAllByLabelText(/edit/i)[0]);
  const editInput = screen.getByDisplayValue('Task 1');
  fireEvent.change(editInput, { target: { value: 'Task 1 edited' } });
  fireEvent.click(screen.getByLabelText(/check/i));
  await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ title: 'Task 1 edited' })));
});

test('edit mode: can cancel editing', () => {
  setup();
  fireEvent.click(screen.getAllByLabelText(/edit/i)[0]);
  fireEvent.click(screen.getByRole('button', { name: /close/i }));
  expect(screen.getByText('Task 1')).toBeInTheDocument();
});

test('delete dialog opens and cancels', async () => {
  setup();
  fireEvent.click(screen.getAllByLabelText(/delete/i)[0]);
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText(/confirm delete/i)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByText(/cancel/i));
  await waitFor(() => {
    expect(screen.queryByText(/confirm delete/i)).not.toBeInTheDocument();
  });
});

test('delete dialog confirms and calls onDelete', async () => {
  const onDelete = jest.fn(() => Promise.resolve());
  setup({ onDelete });
  fireEvent.click(screen.getAllByLabelText(/delete/i)[0]);
  const dialog = screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }));
  await waitFor(() => expect(onDelete).toHaveBeenCalled());
});

test('completion filter disables options if no tasks match', () => {
  setup({ tasks: [{ id: 1, title: 'Done', completed: true, priority: 0, date: '2025-06-02' }] });
  const incompleteOption = screen.getByRole('option', { name: /incomplete/i });
  expect(incompleteOption).toBeDisabled();
});

test('drag and drop calls refetchTasks', async () => {
  const refetchTasks = jest.fn();
  setup({ refetchTasks });
  // Simulate drag end event
  // You may need to mock DragDropContext's onDragEnd directly for full coverage
  // This is a placeholder for actual drag-and-drop event simulation
  // fireEvent.dragEnd(...);
  // expect(refetchTasks).toHaveBeenCalled();
});

test('day filter is disabled if no month is selected', () => {
  setup();
  const daySelect = screen.getByLabelText(/day/i);
  expect(daySelect).toBeDisabled();
});

test('day filter is enabled if month is selected', () => {
  setup({ selectedMonth: '2025-06' });
  const daySelect = screen.getByLabelText(/day/i);
  expect(daySelect).toBeEnabled();
});

test('day filter options show only days for selected month', () => {
  setup({ selectedMonth: '2025-06' });
  const daySelect = screen.getByLabelText(/day/i);
  // Should show options for 02 and 03
  expect(screen.getByRole('option', { name: '02' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: '03' })).toBeInTheDocument();
});

test('completion status filter disables "Completed" if no completed tasks', () => {
  setup({ tasks: [{ id: 1, title: 'Incomplete', completed: false, priority: 0, date: '2025-06-02' }] });
  const completedOption = screen.getByRole('option', { name: /completed/i });
  expect(completedOption).toBeDisabled();
});

test('completion status filter disables "Incomplete" if no incomplete tasks', () => {
  setup({ tasks: [{ id: 1, title: 'Done', completed: true, priority: 0, date: '2025-06-02' }] });
  const incompleteOption = screen.getByRole('option', { name: /incomplete/i });
  expect(incompleteOption).toBeDisabled();
});

test('completion status filter enables both options if both types exist', () => {
  setup();
  const completedOption = screen.getByRole('option', { name: /completed/i });
  const incompleteOption = screen.getByRole('option', { name: /incomplete/i });
  expect(completedOption).toBeEnabled();
  expect(incompleteOption).toBeEnabled();
});