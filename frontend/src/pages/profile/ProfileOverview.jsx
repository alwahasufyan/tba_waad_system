import { Card, CardContent, Typography, Grid, Avatar, Stack, Divider } from '@mui/material';
import { useContext } from 'react';
import MainCard from 'components/MainCard';
import { AuthContext } from 'contexts/AuthContext';

// ==============================|| PROFILE OVERVIEW ||============================== //

export default function ProfileOverview() {
  const { user } = useContext(AuthContext);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title="Profile Overview">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  fontSize: '3rem',
                  bgcolor: 'primary.main'
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Stack spacing={2}>
                <div>
                  <Typography variant="h5" gutterBottom>
                    {user?.name || 'User Name'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user?.email || 'user@example.com'}
                  </Typography>
                </div>
                
                <Divider />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Role
                    </Typography>
                    <Typography variant="body1">
                      {user?.role || 'User'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Status
                    </Typography>
                    <Typography variant="body1">
                      Active
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This is your profile overview page. You can view your basic information here.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
