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
import { insuranceService } from 'services/api';
import { useSnackbar } from 'notistack';

export default function InsuranceCompaniesPage() {
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
      const data = await insuranceService.getAll();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      enqueueSnackbar('Failed to load insurance companies', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const columns = useMemo(() => [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Code', accessorKey: 'code' },
    { header: 'Contact Person', accessorKey: 'contactPerson' },
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
    code: Yup.string().required('Company code is required').max(50),
    phone: Yup.string().max(20),
    email: Yup.string().email('Invalid email').max(255),
    contactPerson: Yup.string().max(255),
    address: Yup.string().max(500)
  });

  const handleSubmit = async (values) => {
    try {
      if (selected) {
        await insuranceService.update(selected.id, values);
        enqueueSnackbar('Insurance company updated successfully', { variant: 'success' });
      } else {
        await insuranceService.create(values);
        enqueueSnackbar('Insurance company created successfully', { variant: 'success' });
      }
      loadData();
    } catch (error) {
      enqueueSnackbar('Failed to save insurance company', { variant: 'error' });
      throw error;
    }
  };

  const confirmDelete = async () => {
    try {
      await insuranceService.remove(toDelete.id);
      enqueueSnackbar('Insurance company deleted successfully', { variant: 'success' });
      loadData();
    } catch (error) {
      enqueueSnackbar('Failed to delete insurance company', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setToDelete(null);
    }
  };

  const initialValues = selected || { name: '', code: '', contactPerson: '', phone: '', email: '', address: '', active: true };

  return (
    <>
      <RBACGuard requiredPermissions={['READ_INSURANCE']}>
        <DataTable
          title="Insurance Companies"
          data={companies}
          columns={columns}
          loading={loading}
          onAdd={() => { setSelected(null); setDrawerOpen(true); }}
          onEdit={(row) => { setSelected(row); setDrawerOpen(true); }}
          onDelete={(row) => { setToDelete(row); setDeleteDialogOpen(true); }}
          addButtonLabel="Add Insurance Company"
        />
      </RBACGuard>

      <CrudDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ? 'Edit Insurance Company' : 'Add Insurance Company'}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        width={500}
      >
        <InsuranceForm />
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

function InsuranceForm() {
  const { values, errors, touched, handleChange, handleBlur } = useFormikContext();
  return (
    <>
      <div><InputLabel>Company Name *</InputLabel><TextField fullWidth name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} error={touched.name && Boolean(errors.name)} helperText={touched.name && errors.name} /></div>
      <div><InputLabel>Company Code *</InputLabel><TextField fullWidth name="code" value={values.code} onChange={handleChange} onBlur={handleBlur} error={touched.code && Boolean(errors.code)} helperText={touched.code && errors.code} /></div>
      <div><InputLabel>Contact Person</InputLabel><TextField fullWidth name="contactPerson" value={values.contactPerson} onChange={handleChange} onBlur={handleBlur} error={touched.contactPerson && Boolean(errors.contactPerson)} helperText={touched.contactPerson && errors.contactPerson} /></div>
      <div><InputLabel>Phone</InputLabel><TextField fullWidth name="phone" value={values.phone} onChange={handleChange} onBlur={handleBlur} error={touched.phone && Boolean(errors.phone)} helperText={touched.phone && errors.phone} /></div>
      <div><InputLabel>Email</InputLabel><TextField fullWidth type="email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} error={touched.email && Boolean(errors.email)} helperText={touched.email && errors.email} /></div>
      <div><InputLabel>Address</InputLabel><TextField fullWidth multiline rows={3} name="address" value={values.address} onChange={handleChange} onBlur={handleBlur} error={touched.address && Boolean(errors.address)} helperText={touched.address && errors.address} /></div>
    </>
  );
}
