import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { SummaryData } from '../../types';
import { getStudentSummary } from '../../utils/api';
import { toast } from 'react-toastify';
import Header from '../../components/Header';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Summary = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummaryData = async () => {
      if (!id) {
        const errorMsg = 'No student ID provided';
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching summary data for student:', id);
        const response = await getStudentSummary(id);
        console.log('Summary data received:', response.data);
        setSummaryData(response.data);
        setError('');
      } catch (err: any) {
        console.error('Error fetching summary:', err);
        const errorMsg = err.response?.data?.error || 'Failed to load summary data';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [id]);

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
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  if (!summaryData) {
    return (
      <>
        <Header title="Not Found" showBack />
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            No summary data available
          </Alert>
        </Container>
      </>
    );
  }

  const pieData: ChartData<'pie'> = {
    labels: summaryData.distribution.map(d => d.reason),
    datasets: [{
      data: summaryData.distribution.map(d => d.total),
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ],
      borderWidth: 1,
    }]
  };

  const lineData: ChartData<'line'> = {
    labels: summaryData.history.map(h => new Date(h.created_at).toLocaleDateString()),
    datasets: [{
      label: 'Points Change',
      data: summaryData.history.map(h => h.points_change),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.4,
      fill: false,
    }]
  };

  const pieChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Points Distribution by Reason'
      }
    },
  } as ChartOptions<'pie'>;

  const lineChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Points History Over Time'
      }
    }
  } as ChartOptions<'line'>;

  return (
    <>
      <Header title={`${summaryData.student.name}'s Summary`} showBack />
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Class: {summaryData.student.class_name || 'Not Assigned'}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Total Points: {summaryData.student.points}
            </Typography>
          </Box>

          <Box sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h6" gutterBottom>
              Points Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie data={pieData} options={pieChartOptions} />
            </Box>
          </Box>

          <Box sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h6" gutterBottom>
              Points History
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={lineData} options={lineChartOptions} />
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {summaryData.history.map((item, index) => (
                <React.Fragment key={`history-${index}`}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {item.points_change > 0 ? '+' : ''}{item.points_change} points - {item.reason}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(item.created_at).toLocaleString()}
                          </Typography>
                          {item.comment && (
                            <Typography variant="body2" color="text.secondary">
                              Comment: {item.comment}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {index < summaryData.history.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default Summary; 