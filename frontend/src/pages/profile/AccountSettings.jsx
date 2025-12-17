import { Card, CardContent, Typography, Grid, TextField, Button, Stack } from '@mui/material';
import { useContext } from 'react';
import MainCard from 'components/MainCard';
import { AuthContext } from 'contexts/AuthContext';

// ==============================|| ACCOUNT SETTINGS ||============================== //

export default function AccountSettings() {
  const { user } = useContext(AuthContext);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title="Account Settings">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                defaultValue={user?.name || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                defaultValue={user?.email || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                defaultValue=""
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role"
                defaultValue={user?.role || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" disabled>
                  Save Changes
                </Button>
                <Button variant="outlined" disabled>
                  Cancel
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Notification settings will be available here.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
