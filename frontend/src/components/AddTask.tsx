import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTask } from '../services/api';
import { Task } from '../models/Task';
import {
  TextField,
  Button,
  Box,
  Paper,
  CircularProgress,
  Typography,
  InputAdornment,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface AddTaskProps {
  onAdd: (title: string, date: string) => Promise<void>;
}

const AddTask: React.FC<AddTaskProps> = ({ onAdd }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(() => new Date().toISOString().slice(0, 10)); // default to today
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id'>) => {
      const result = await addTask(newTask);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTaskTitle('');
      setTaskDate(new Date().toISOString().slice(0, 10));
      // Remove onAdd call here
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    mutation.mutate({
      title: taskTitle,
      completed: false,
      priority: 0,
      date: taskDate, // use the selected date
    });
  };

  const isDisabled = !taskTitle.trim() || !taskDate || mutation.isPending;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        backgroundColor: '#f9f9f9',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        alignItems="center"
        gap={2}
      >
        <TextField
          label="Add a new task"
          variant="outlined"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          fullWidth
          disabled={mutation.isPending}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AddCircleOutlineIcon color="primary" />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: '#fff',
            borderRadius: 1,
          }}
        />
        <TextField
          label="Date"
          type="date"
          value={taskDate}
          onChange={(e) => setTaskDate(e.target.value)}
          sx={{ backgroundColor: '#fff', borderRadius: 1, minWidth: 140 }}
          InputLabelProps={{
            shrink: true,
          }}
          disabled={mutation.isPending}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ fontWeight: 600, px: 3, py: 1.5, borderRadius: 2 }}
          disabled={isDisabled}
        >
          {mutation.isPending ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Add'
          )}
        </Button>
      </Box>

      {mutation.isError && (
        <Typography color="error" mt={2}>
          Error adding task: {(mutation.error as Error).message}
        </Typography>
      )}
    </Paper>
  );
};

export default AddTask;