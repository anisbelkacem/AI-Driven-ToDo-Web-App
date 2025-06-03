import axios from 'axios';
import { signup, login } from './auth';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('auth service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('signup posts user data and returns response', async () => {
    const userData = {
      password: 'pass',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      dateOfBirth: '2000-01-01'
    };
    const mockResponse = { data: { id: 1, ...userData } };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await signup(
      userData.password,
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.dateOfBirth
    );
    expect(result).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/auth/signup',
      userData
    );
  });

  it('login posts credentials and returns response', async () => {
    const email = 'john@example.com';
    const password = 'pass';
    const mockResponse = { data: { token: 'abc123' } };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await login(email, password);
    expect(result).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/auth/login',
      { email, password }
    );
  });
});