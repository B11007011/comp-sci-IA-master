import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getClasses, createClass, updateClass, deleteClass, getClassDetails, createStudentsWithScores } from '../../utils/api';
import { Class, ClassDetails } from '../../types';
import { toast } from 'react-toastify';
import Header from '../../components/Header';
import AddStudentDialog from '../../components/AddStudentDialog';

const Home = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [className, setClassName] = useState('');
  const [showError, setShowError] = useState(false);
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [newClassId, setNewClassId] = useState<number | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      console.log('Fetching classes...');
      const response = await getClasses();
      console.log('Classes received:', response.data);
      setClasses(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching classes:', err);
      const errorMsg = err.response?.data?.error || 'Failed to load classes';
      setError(errorMsg);
      setShowError(true);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async (classId: number) => {
    setLoadingDetails(true);
    try {
      console.log('Fetching details for class:', classId);
      const response = await getClassDetails(classId.toString());
      console.log('Class details received:', response.data);
      setClassDetails(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching class details:', err);
      const errorMsg = err.response?.data?.error || 'Failed to load class details';
      setError(errorMsg);
      setShowError(true);
      toast.error(errorMsg);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenDialog = (classItem?: Class) => {
    if (classItem) {
      setSelectedClass(classItem);
      setClassName(classItem.name);
    } else {
      setSelectedClass(null);
      setClassName('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
    setClassName('');
  };

  const handleSubmit = async () => {
    if (!className.trim()) {
      const errorMsg = 'Class name is required';
      setError(errorMsg);
      setShowError(true);
      toast.error(errorMsg);
      return;
    }
    
    try {
      console.log('Submitting class:', { id: selectedClass?.id, name: className });
      if (selectedClass) {
        await updateClass(selectedClass.id.toString(), className.trim());
        toast.success('Class updated successfully');
        fetchClasses();
        handleCloseDialog();
      } else {
        const response = await createClass(className.trim());
        toast.success('Class created successfully');
        setNewClassId(response.data.id);
        handleCloseDialog();
        setOpenStudentDialog(true);
      }
      setError('');
    } catch (err: any) {
      console.error('Error submitting class:', err);
      const errorMsg = err.response?.data?.error || 'Operation failed';
      setError(errorMsg);
      setShowError(true);
      toast.error(errorMsg);
    }
  };

  const handleAddStudents = async (students: Array<{
    firstName: string;
    lastName: string;
    email: string;
    points: number;
  }>) => {
    if (!newClassId) return;

    try {
      await createStudentsWithScores(newClassId, students);
      toast.success('Students added successfully');
      fetchClasses();
      setOpenStudentDialog(false);
      setNewClassId(null);
    } catch (err: any) {
      console.error('Error adding students:', err);
      const errorMsg = err.response?.data?.error || 'Failed to add students';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        console.log('Deleting class:', id);
        await deleteClass(id.toString());
        toast.success('Class deleted successfully');
        fetchClasses();
        setSelectedClass(null);
        setClassDetails(null);
      } catch (err: any) {
        console.error('Error deleting class:', err);
        const errorMsg = err.response?.data?.error || 'Failed to delete class';
        toast.error(errorMsg);
      }
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleClassClick = (classItem: Class) => {
    setSelectedClass(classItem);
    fetchClassDetails(classItem.id);
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
      <Header title="Class Management" />
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, flex: 2 }}>
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button 
                variant="contained" 
                onClick={() => handleOpenDialog()}
                startIcon={<AddIcon />}
                sx={{ 
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#388e3c' }
                }}
              >
                Add New Class
              </Button>
              <Button 
                variant="contained"
                color="error"
                onClick={() => selectedClass && handleDelete(selectedClass.id)}
                disabled={!selectedClass}
              >
                Delete Class
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => selectedClass && handleOpenDialog(selectedClass)}
                disabled={!selectedClass}
              >
                Edit Class
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  if (selectedClass) {
                    setNewClassId(selectedClass.id);
                    setOpenStudentDialog(true);
                  }
                }}
                disabled={!selectedClass}
                startIcon={<AddIcon />}
              >
                Add Students
              </Button>
            </Box>

            {/* Classes Grid */}
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 3,
              maxHeight: 'calc(100vh - 250px)',
              overflowY: 'auto',
              pr: 2,
            }}>
              {classes.length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: 'center', gridColumn: '1/-1', color: '#666' }}>
                  No classes available. Click "Add New Class" to create one.
                </Typography>
              ) : (
                classes.map((classItem) => (
                  <Paper
                    key={classItem.id}
                    elevation={selectedClass?.id === classItem.id ? 8 : 1}
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      bgcolor: selectedClass?.id === classItem.id ? '#f5f5f5' : 'white',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => handleClassClick(classItem)}
                  >
                    <Typography variant="h6" gutterBottom>
                      {classItem.name}
                    </Typography>
                    {loadingDetails && selectedClass?.id === classItem.id ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <CircularProgress size={20} />
                      </Box>
                    ) : classDetails && selectedClass?.id === classItem.id ? (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Students: {classDetails.student_count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Average Points: {classDetails.average_points}
                        </Typography>
                        {classDetails.recent_students.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Recent Students:
                            </Typography>
                            <List dense>
                              {classDetails.recent_students.map((student) => (
                                <ListItem key={student.id} disablePadding>
                                  <ListItemButton onClick={() => navigate(`/dashboard/${student.id}`)}>
                                    <ListItemText 
                                      primary={student.name}
                                      secondary={`Points: ${student.points}`}
                                    />
                                  </ListItemButton>
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </>
                    ) : null}
                  </Paper>
                ))
              )}
            </Box>
          </Paper>
        </Box>

        {/* Add/Edit Class Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {selectedClass ? 'Edit Class' : 'Add New Class'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Class Name"
              type="text"
              fullWidth
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedClass ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Students Dialog */}
        <AddStudentDialog
          open={openStudentDialog}
          onClose={() => {
            setOpenStudentDialog(false);
            setNewClassId(null);
            fetchClasses();
          }}
          onSubmit={handleAddStudents}
          classId={newClassId || 0}
        />

        {/* Error Snackbar */}
        <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Home; 