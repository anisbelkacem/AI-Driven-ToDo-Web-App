import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import { useTasks } from './hooks/useTasks';
import AddTask from './components/AddTask';
import { TaskList } from './components/TaskList';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios'; // For API calls
import { Task } from './models/Task';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null); // Username fetched from the database
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // For dropdown menu
  const { tasks, addTask, updateTask, toggleTask, deleteTask, isLoading, refetchTasks  } = useTasks();

  // Fetch user information after login
  useEffect(() => {
    if (isAuthenticated) {
      axios
        .get('/api/auth/user') // Make sure this matches your backend
        .then((response) => {
          console.log('User data:', response.data); // Debug
          setUserName(response.data.firstName + ' ' + response.data.lastName);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    }
  }, [isAuthenticated]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await axios.post('/api/auth/logout'); // Invalidate session on backend
    setIsAuthenticated(false);
    setUserName(null);
    setAnchorEl(null);
    refetchTasks();
  };

  const handleLogin = () => { 
    refetchTasks();
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onSignup={() => {}} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)' }}>
      {/* AppBar for the header */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            To-Do App
          </Typography>
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: '#1976d2' }}>{userName?.charAt(0)}</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1.5, borderRadius: 2, minWidth: 200 },
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 600 }}>
              Welcome, {userName}
            </Typography>
            <MenuItem onClick={handleMenuClose}>
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Your Tasks
        </Typography>
        <AddTask onAdd={async (title) => { await addTask({
          title, completed: false,
          priority: 0
        }); }} />
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : tasks?.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No tasks found. Add your first task!
          </Alert>
        ) : (
          <TaskList
            tasks={tasks || []}
            onToggle={async (task: Task) => { await toggleTask(task); }}
            onDelete={async (id: number) => { await deleteTask(id); }}
            onUpdate={async (task: Task) => { await updateTask(task); }}
            refetchTasks={refetchTasks}
          />
        )}
      </Box>
    </Box>
  );
};

export default App;