import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

interface LoginForm {
  username: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get return URL from location state or default to home
  const from = location.state?.from?.pathname || '/';

  const { control, handleSubmit, formState: { isValid } } = useForm<LoginForm>({
    defaultValues: {
      username: '',
      password: ''
    },
    mode: 'onChange' // Enable real-time validation
  });

  // If already authenticated, redirect to return URL or home
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(''); // Clear any previous errors
    
    try {
      await login(data.username, data.password);
      toast.success('Login successful');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Sign in
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2, 
              width: '100%',
              '& .MuiAlert-message': { width: '100%' }
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Paper
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          elevation={3}
          sx={{
            mt: error ? 2 : 3,
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Controller
            name="username"
            control={control}
            rules={{ 
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters'
              }
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Username"
                fullWidth
                autoComplete="username"
                autoFocus
                error={!!error}
                helperText={error?.message}
                disabled={loading}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ 
              required: 'Password is required',
              minLength: {
                value: 4,
                message: 'Password must be at least 4 characters'
              }
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                fullWidth
                autoComplete="current-password"
                error={!!error}
                helperText={error?.message}
                disabled={loading}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !isValid}
            sx={{ 
              mt: 2,
              py: 1.5,
              position: 'relative'
            }}
          >
            {loading ? (
              <CircularProgress 
                size={24} 
                color="inherit" 
                sx={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px'
                }}
              />
            ) : (
              'Sign In'
            )}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 