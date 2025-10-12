import React from 'react';
import { Skeleton, Box, ThemeProvider, createTheme } from '@mui/material';

const EmployeeCardSkeleton = () => {
  // Criar tema customizado baseado no tema atual
  const theme = createTheme({
    palette: {
      mode: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
      background: {
        default: 'var(--color-bg-secondary)',
        paper: 'var(--color-bg-secondary)',
      },
    },
    components: {
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--color-border)',
            '&::after': {
              background: 'linear-gradient(90deg, transparent, var(--color-bg-input), transparent)',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          background: 'var(--color-bg-secondary)',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            {/* Nome */}
            <Skeleton 
              variant="text" 
              width="70%" 
              height={24} 
              sx={{ mb: 1 }}
            />
            {/* Badge do cargo */}
            <Skeleton 
              variant="rounded" 
              width={100} 
              height={28} 
              sx={{ borderRadius: '12px' }}
            />
          </Box>
          
          {/* Botões de ação */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rounded" width={36} height={36} />
            <Skeleton variant="rounded" width={36} height={36} />
          </Box>
        </Box>
        
        {/* Detalhes */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* CPF */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" width="60%" height={16} />
          </Box>
          
          {/* Telefone */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" width="50%" height={16} />
          </Box>
          
          {/* Email */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" width="80%" height={16} />
          </Box>
          
          {/* Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" width="30%" height={16} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EmployeeCardSkeleton; 