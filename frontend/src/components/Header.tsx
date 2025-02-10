import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = false, onBackClick }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        {showBack && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBackClick || (() => navigate(-1))}
            sx={{ mr: 2 }}
          >
            <BackIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && (
              <Typography variant="body2" color="inherit">
                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
              </Typography>
            )}
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ textTransform: 'none' }}
            >
              {isMobile ? '' : 'Logout'}
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 