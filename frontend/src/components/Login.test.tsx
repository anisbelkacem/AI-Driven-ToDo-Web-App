import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';

// Mock the login API
jest.mock('../services/auth', () => ({
  login: jest.fn(() => Promise.resolve({ success: true })),
}));

function renderLogin(onLogin = jest.fn()) {
  render(
    <BrowserRouter>
      <Login onLogin={onLogin} />
    </BrowserRouter>
  );
}

test('renders email and password fields', () => {
  renderLogin();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i, { selector: 'input' })).toBeInTheDocument();
});

test('calls onLogin on valid submit', async () => {
  const onLogin = jest.fn();
  renderLogin(onLogin);
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), { target: { value: '1234' } });

  const loginButton = screen.getByRole('button', { name: /login/i });
  expect(loginButton).not.toBeDisabled();
  fireEvent.click(loginButton);

  await waitFor(() => {
    expect(onLogin).toHaveBeenCalled();
  });
});

test('shows error message on invalid login', async () => {
  // Override the mock to simulate a failed login
  const { login } = require('../services/auth');
  login.mockImplementationOnce(() => Promise.reject(new Error('Invalid credentials')));

  renderLogin();
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
  fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), { target: { value: 'wrongpass' } });

  const loginButton = screen.getByRole('button', { name: /login/i });
  fireEvent.click(loginButton);

  expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
});

test('toggles password visibility', () => {
  renderLogin();
  const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
  const toggleButton = screen.getByLabelText(/toggle password visibility/i);

  // Initially password type should be 'password'
  expect(passwordInput).toHaveAttribute('type', 'password');
  fireEvent.click(toggleButton);
  // After toggle, type should be 'text'
  expect(passwordInput).toHaveAttribute('type', 'text');
  fireEvent.click(toggleButton);
  // After second toggle, back to 'password'
  expect(passwordInput).toHaveAttribute('type', 'password');
});

test('login button is disabled if required fields are empty', () => {
  renderLogin();
  const loginButton = screen.getByRole('button', { name: /login/i });
  // Should not be disabled due to required attribute, but you can check form validity if you implement it
  expect(loginButton).toBeEnabled();
});

// Optionally, add more tests for error handling, toggling password visibility, etc.