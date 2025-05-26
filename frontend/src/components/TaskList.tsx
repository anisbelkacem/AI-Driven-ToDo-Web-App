import React, { useState } from 'react';
import { Task } from '../models/Task';
import {
  List,
  ListItem,
  Checkbox,
  IconButton,
  ListItemText,
  Paper,
  Typography,
  Box,
  Divider,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import axios from 'axios';

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => Promise<void>;
  onUpdate: (task: Task) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  refetchTasks: () => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  completionFilter: string;
  setCompletionFilter: (filter: string) => void;
}

export const TaskList = ({
  tasks,
  onUpdate,
  onDelete,
  refetchTasks,
  selectedMonth,
  setSelectedMonth,
  selectedDay,
  setSelectedDay,
  completionFilter,
  setCompletionFilter,
}: TaskListProps) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  const availableDates = Array.from(new Set(tasks.map(t => t.date).filter(Boolean))).sort();
  const availableMonths = Array.from(
    new Set(tasks.map(t => t.date && t.date.slice(0, 7)).filter(Boolean))
  ).sort();

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditedTitle(task.title);
  };

  const handleSaveEdit = async () => {
    if (editingTask) {
      setIsProcessing(true);
      try {
        await onUpdate({ ...editingTask, title: editedTitle });
        setEditingTask(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  // Open confirmation dialog
  const handleDeleteClick = (id: number) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (taskToDelete !== null) {
      setIsProcessing(true);
      await onDelete(taskToDelete);
      setIsProcessing(false);
      setTaskToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setTaskToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleToggleComplete = async (task: Task) => {
    setIsProcessing(true);
    try {
      await onUpdate({ ...task, completed: !task.completed });
    } finally {
      setIsProcessing(false);
    }
  };

  // Sort tasks by priority before rendering
  const sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority);

  // Filter tasks based on selected month and day
  let filteredTasks = sortedTasks;
  if (selectedMonth) {
    filteredTasks = filteredTasks.filter(t => t.date && t.date.startsWith(selectedMonth));
  }
  if (selectedDay) {
    filteredTasks = filteredTasks.filter(t => t.date === selectedDay);
  }

  // Filter tasks based on completion status
  if (completionFilter === 'completed') {
    filteredTasks = filteredTasks.filter(t => t.completed);
  } else if (completionFilter === 'incomplete') {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  }

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(sortedTasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    // Update priorities based on new order
    for (let i = 0; i < reordered.length; i++) {
      reordered[i].priority = i;
    }

    // Persist the new order in the backend
    await axios.post('/api/tasks/reorder', reordered);

    // Refresh the list
    await refetchTasks();
  };

  // Count completed and incomplete tasks
  const hasCompleted = sortedTasks.some(t => t.completed);
  const hasIncomplete = sortedTasks.some(t => !t.completed);

  if (!tasks.length) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 2 }}>
        <Typography color="text.secondary" align="center">
          No tasks yet. Add your first task!
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          select
          label="Month"
          value={selectedMonth}
          onChange={e => {
            setSelectedMonth(e.target.value);
            setSelectedDay('');
          }}
          sx={{ minWidth: 140 }}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }} // <-- Add this line
        >
          <option value="">All Months</option>
          {availableMonths.map(month => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </TextField>
        <TextField
          select
          label="Day"
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
          sx={{ minWidth: 140 }}
          SelectProps={{ native: true }}
          disabled={!selectedMonth}
          InputLabelProps={{ shrink: true }} // <-- Add this line
        >
          <option value="">All Days</option>
          {availableDates
            .filter(date => date && date.startsWith(selectedMonth))
            .map(date => (
              <option key={date} value={date}>
                {date.split('-')[2]}
              </option>
            ))}
        </TextField>
        <TextField
          select
          label="Completion Status"
          value={completionFilter}
          onChange={e => setCompletionFilter(e.target.value)}
          sx={{ minWidth: 140 }}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
        >
          <option value="all">All Tasks</option>
          <option value="completed" disabled={!hasCompleted}>
            Completed
          </option>
          <option value="incomplete" disabled={!hasIncomplete}>
            Incomplete
          </option>
        </TextField>
      </Box>
      <Paper elevation={2} sx={{ p: 0, borderRadius: 2, mt: 2 }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="task-list">
            {(provided) => (
              <List ref={provided.innerRef} {...provided.droppableProps}>
                {filteredTasks.map((task, idx) => (
                  <Draggable key={task.id} draggableId={task.id.toString()} index={idx}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        // Do NOT spread dragHandleProps here!
                      >
                        <ListItem
                          sx={{
                            bgcolor: task.completed ? '#f0f4ff' : '#fff',
                            borderRadius: 2,
                            mb: 1,
                            boxShadow: 0,
                            transition: 'background 0.2s',
                          }}
                          secondaryAction={
                            editingTask?.id === task.id ? null : (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {/* Show the date */}
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
                                  {task.date}
                                </Typography>
                                <Tooltip title="Edit">
                                  <IconButton edge="end" color="primary" onClick={() => handleEditClick(task)}>
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton edge="end" color="error" onClick={() => handleDeleteClick(task.id!)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )
                          }
                        >
                          {/* Drag handle icon */}
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', cursor: 'grab', mr: 1 }}
                            {...provided.dragHandleProps} // <-- Attach dragHandleProps here
                          >
                            <DragIndicatorIcon color="disabled" />
                          </Box>
                          <Checkbox
                            edge="start"
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task)}
                            color="primary"
                            disabled={isProcessing || editingTask?.id === task.id}
                          />
                          {editingTask?.id === task.id ? (
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <TextField
                                    variant="standard"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    disabled={isProcessing}
                                    fullWidth
                                  />
                                  <IconButton
                                    color="success"
                                    onClick={handleSaveEdit}
                                    disabled={isProcessing || !editedTitle.trim()}
                                    sx={{ ml: 1 }}
                                  >
                                    <CheckIcon />
                                  </IconButton>
                                  <IconButton
                                    color="error"
                                    onClick={handleCancelEdit}
                                    disabled={isProcessing}
                                  >
                                    <CloseIcon />
                                  </IconButton>
                                </Box>
                              }
                            />
                          ) : (
                            <ListItemText
                              primary={
                                <Typography
                                  sx={{
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    color: task.completed ? 'text.secondary' : 'text.primary',
                                    fontWeight: 'normal',
                                  }}
                                >
                                  {task.title}
                                </Typography>
                              }
                            />
                          )}
                        </ListItem>
                        {idx < sortedTasks.length - 1 && <Divider />} {/* Use sortedTasks here */}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </Paper>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-delete-title"
      >
        <DialogTitle id="confirm-delete-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={isProcessing}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};


