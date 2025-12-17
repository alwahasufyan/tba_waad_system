import { useState, useEffect, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import * as Yup from 'yup';
import { useFormikContext } from 'formik';
import { DataTable, CrudDrawer, RBACGuard } from 'components/tba';
import { reviewersService } from 'services/api';
import { useSnackbar } from 'notistack';

export default function ReviewerCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await reviewersService.getAll();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      enqueueSnackbar('Failed to load reviewer companies', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const columns = useMemo(() => [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Medical Director', accessorKey: 'medicalDirector' },
    { header: 'Phone', accessorKey: 'phone' },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Status',
      accessorKey: 'active',
      cell: ({ getValue }) => (
        <Chip label={getValue() ? 'Active' : 'Inactive'} color={getValue() ? 'success' : 'default'} size="small" />
      )
    }
  ], []);

  const validationSchema = Yup.object({
    name: Yup.string().required('Company name is required').max(255),
    medicalDirector: Yup.string().max(255),
    phone: Yup.string().max(20),
    email: Yup.string().email('Invalid email').max(255),
    address: Yup.string().max(500)
  });

  const handleSubmit = async (values) => {
    try {
      if (selected) {
        await reviewersService.update(selected.id, values);
        enqueueSnackbar('Reviewer company updated successfully', { variant: 'success' });
      } else {
        await reviewersService.create(values);
        enqueueSnackbar('Reviewer company created successfully', { variant: 'success' });
      }
      loadData();
    } catch (error) {
      enqueueSnackbar('Failed to save reviewer company', { variant: 'error' });
      throw error;
    }
  };

  const confirmDelete = async () => {
    try {
      await reviewersService.remove(toDelete.id);
      enqueueSnackbar('Reviewer company deleted successfully', { variant: 'success' });
      loadData();
    } catch (error) {
      enqueueSnackbar('Failed to delete reviewer company', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setToDelete(null);
    }
  };

  const initialValues = selected || { name: '', medicalDirector: '', phone: '', email: '', address: '', active: true };

  return (
    <>
      <RBACGuard requiredPermissions={['READ_REVIEWER']}>
        <DataTable
          title="Reviewer Companies (TPA)"
          data={companies}
          columns={columns}
          loading={loading}
          onAdd={() => { setSelected(null); setDrawerOpen(true); }}
          onEdit={(row) => { setSelected(row); setDrawerOpen(true); }}
          onDelete={(row) => { setToDelete(row); setDeleteDialogOpen(true); }}
          addButtonLabel="Add Reviewer Company"
        />
      </RBACGuard>

      <CrudDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ? 'Edit Reviewer Company' : 'Add Reviewer Company'}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        width={500}
      >
        <ReviewerForm />
      </CrudDrawer>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete "{toDelete?.name}"?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function ReviewerForm() {
  const { values, errors, touched, handleChange, handleBlur } = useFormikContext();
  return (
    <>
      <div><InputLabel>Company Name *</InputLabel><TextField fullWidth name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} error={touched.name && Boolean(errors.name)} helperText={touched.name && errors.name} /></div>
      <div><InputLabel>Medical Director</InputLabel><TextField fullWidth name="medicalDirector" value={values.medicalDirector} onChange={handleChange} onBlur={handleBlur} error={touched.medicalDirector && Boolean(errors.medicalDirector)} helperText={touched.medicalDirector && errors.medicalDirector} /></div>
      <div><InputLabel>Phone</InputLabel><TextField fullWidth name="phone" value={values.phone} onChange={handleChange} onBlur={handleBlur} error={touched.phone && Boolean(errors.phone)} helperText={touched.phone && errors.phone} /></div>
      <div><InputLabel>Email</InputLabel><TextField fullWidth type="email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} error={touched.email && Boolean(errors.email)} helperText={touched.email && errors.email} /></div>
      <div><InputLabel>Address</InputLabel><TextField fullWidth multiline rows={3} name="address" value={values.address} onChange={handleChange} onBlur={handleBlur} error={touched.address && Boolean(errors.address)} helperText={touched.address && errors.address} /></div>
    </>
  );
}
