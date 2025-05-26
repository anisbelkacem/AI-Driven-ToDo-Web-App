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
}

export const TaskList = ({ tasks, onUpdate, onDelete, refetchTasks }: TaskListProps) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

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
      <Paper elevation={2} sx={{ p: 0, borderRadius: 2, mt: 2 }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="task-list">
            {(provided) => (
              <List ref={provided.innerRef} {...provided.droppableProps}>
                {sortedTasks.map((task, idx) => (
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
                              <Box>
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


