import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface Props {
  message?: string;
}

const LoadingSpinner: React.FC<Props> = ({ message = 'Loading...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      p={3}
    >
      <CircularProgress size={40} />
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{ mt: 2 }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner; 