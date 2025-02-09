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
  MenuItem,
  Select,
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { AppraisalForm, POINT_REASONS } from '../../types';
import { updatePoints } from '../../utils/api';
import { toast } from 'react-toastify';
import Header from '../../components/Header';

const Appraisal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const defaultAction = location.state?.defaultAction || 'add';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { control, handleSubmit, formState: { isValid } } = useForm<AppraisalForm>({
    defaultValues: {
      action: defaultAction,
      points: 1,
      reason: '',
      comment: ''
    },
    mode: 'onChange'
  });

  const onSubmit = async (data: AppraisalForm) => {
    if (!id) {
      toast.error('No student ID provided');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Submitting points update:', {
        ...data,
        points: data.action === 'subtract' ? -data.points : data.points
      });
      
      await updatePoints(id, {
        points: data.action === 'subtract' ? -data.points : data.points,
        reason: data.reason,
        comment: data.comment
      });
      
      toast.success('Points updated successfully');
      navigate(`/dashboard/${id}`);
    } catch (err: any) {
      console.error('Error updating points:', err);
      const errorMsg = err.response?.data?.error || 'Failed to update points';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Header title={`${defaultAction === 'add' ? 'Add' : 'Remove'} Points`} showBack />
      <Container maxWidth="sm">
        <Paper sx={{ mt: 4, p: 4, borderRadius: 2 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="action"
              control={control}
              rules={{ required: 'Please select an action' }}
              render={({ field, fieldState: { error } }) => (
                <Select
                  {...field}
                  fullWidth
                  sx={{ mb: 3 }}
                  error={!!error}
                >
                  <MenuItem value="add">Add Points</MenuItem>
                  <MenuItem value="subtract">Remove Points</MenuItem>
                </Select>
              )}
            />

            <Controller
              name="points"
              control={control}
              rules={{ 
                required: 'Points are required',
                min: { value: 1, message: 'Points must be at least 1' }
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Points"
                  inputProps={{ min: 1 }}
                  sx={{ mb: 3 }}
                  error={!!error}
                  helperText={error?.message}
                  disabled={loading}
                />
              )}
            />

            <Controller
              name="reason"
              control={control}
              rules={{ required: 'Please select a reason' }}
              render={({ field, fieldState: { error } }) => (
                <Select
                  {...field}
                  fullWidth
                  sx={{ mb: 3 }}
                  error={!!error}
                >
                  <MenuItem disabled value="">
                    <em>Select Reason</em>
                  </MenuItem>
                  {POINT_REASONS.map((reason) => (
                    <MenuItem key={reason} value={reason}>
                      {reason}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              name="comment"
              control={control}
              rules={{ required: 'Please provide a comment' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Comment"
                  multiline
                  rows={4}
                  sx={{ mb: 3 }}
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
              color={defaultAction === 'add' ? 'success' : 'error'}
              sx={{ 
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
                'Confirm'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default Appraisal; 