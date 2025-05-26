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
  onAdd: (title: string) => Promise<void>;
}

const AddTask: React.FC<AddTaskProps> = ({ onAdd }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id'>) => {
      const result = await addTask(newTask);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTaskTitle('');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    mutation.mutate({
      title: taskTitle,
      completed: false,
      priority: 0
    });
  };

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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ fontWeight: 600, px: 3, py: 1.5, borderRadius: 2 }}
          disabled={!taskTitle.trim() || mutation.isPending}
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