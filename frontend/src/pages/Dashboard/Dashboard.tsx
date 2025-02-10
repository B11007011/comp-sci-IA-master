import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { 
  Add as AddIcon,
  Remove as RemoveIcon,
  MoreHoriz as MoreIcon,
  School as SchoolIcon,
  Cake as CakeIcon,
  EmojiEvents as PointsIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Student } from '../../types';
import { getStudent } from '../../utils/api';
import { toast } from 'react-toastify';
import Header from '../../components/Header';

const Dashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id) {
        setError('No student ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching student data for ID:', id);
        const response = await getStudent(id);
        console.log('Student data received:', response.data);
        setStudent(response.data);
        setError('');
      } catch (err: any) {
        console.error('Error fetching student:', err);
        const errorMsg = err.response?.data?.error || 'Failed to load student data';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  const handlePointsAction = (action: 'add' | 'remove') => {
    navigate(`/appraisal/${id}`, { state: { defaultAction: action === 'add' ? 'add' : 'subtract' } });
  };

  const getStudentInitials = (student: Student) => {
    if (student.first_name && student.last_name) {
      return `${student.first_name[0]}${student.last_name[0]}`;
    }
    return student.first_name?.[0] || student.last_name?.[0] || '?';
  };

  const getStudentFullName = (student: Student) => {
    if (student.first_name && student.last_name) {
      return `${student.first_name} ${student.last_name}`;
    }
    return student.first_name || student.last_name || 'Unknown Student';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Error" showBack />
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Grow in>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                '& .MuiAlert-message': {
                  fontSize: '1rem'
                }
              }}
            >
              {error}
            </Alert>
          </Grow>
        </Container>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <Header title="Not Found" showBack />
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Grow in>
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2,
                '& .MuiAlert-message': {
                  fontSize: '1rem'
                }
              }}
            >
              Student not found
            </Alert>
          </Grow>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header title={`${getStudentFullName(student)}'s Profile`} showBack />
      <Container maxWidth="md">
        <Fade in timeout={500}>
          <Card 
            elevation={3} 
            sx={{ 
              position: 'relative',
              overflow: 'visible',
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Student Info Section */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'center' : 'flex-start',
                  gap: 4,
                  mb: 4 
                }}
              >
                {/* Student Picture */}
                <Avatar
                  sx={{
                    width: 150,
                    height: 150,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    fontSize: '4rem',
                    boxShadow: 3,
                    border: '4px solid white',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  {getStudentInitials(student)}
                </Avatar>

                {/* Student Details */}
                <Box sx={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon color="primary" />
                      <Typography variant="body1">
                        Class: {student.class_name || 'Not Assigned'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CakeIcon color="primary" />
                      <Typography variant="body1">
                        DOB: {student.date_of_birth || 'Not available'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PointsIcon color="primary" />
                      <Typography variant="body1">
                        Points: {student.points || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Actions Section */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={() => handlePointsAction('add')}
                  sx={{ minWidth: 120 }}
                >
                  Add Points
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RemoveIcon />}
                  onClick={() => handlePointsAction('remove')}
                  sx={{ minWidth: 120 }}
                >
                  Remove Points
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<MoreIcon />}
                  onClick={() => navigate(`/summary/${id}`)}
                  sx={{ minWidth: 120 }}
                >
                  View Summary
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </>
  );
};

export default Dashboard; 