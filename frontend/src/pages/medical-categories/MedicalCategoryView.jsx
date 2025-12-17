import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  Divider,
  Alert,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { useMedicalCategoryDetails } from 'hooks/useMedicalCategories';

/**
 * Medical Category View Page
 * Displays detailed read-only view of a medical category
 */
const MedicalCategoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: category, loading, error } = useMedicalCategoryDetails(id);

  // Loading skeleton
  if (loading) {
    return (
      <Box>
        <ModernPageHeader
          title="عرض التصنيف الطبي"
          subtitle="تفاصيل التصنيف الطبي"
          icon={CategoryIcon}
          breadcrumbs={[
            { label: 'الرئيسية', path: '/' },
            { label: 'التصنيفات الطبية', path: '/medical-categories' },
            { label: 'عرض' }
          ]}
        />
        <MainCard>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={80} />
            <Skeleton variant="rectangular" height={80} />
            <Skeleton variant="rectangular" height={80} />
          </Stack>
        </MainCard>
      </Box>
    );
  }

  // Error state
  if (error || !category) {
    return (
      <Box>
        <ModernPageHeader
          title="عرض التصنيف الطبي"
          subtitle="تفاصيل التصنيف الطبي"
          icon={CategoryIcon}
          breadcrumbs={[
            { label: 'الرئيسية', path: '/' },
            { label: 'التصنيفات الطبية', path: '/medical-categories' },
            { label: 'عرض' }
          ]}
        />
        <MainCard>
          <Alert severity="error">
            {error?.message || 'فشل تحميل بيانات التصنيف'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/medical-categories')}
            sx={{ mt: 2 }}
          >
            رجوع للقائمة
          </Button>
        </MainCard>
      </Box>
    );
  }

  return (
    <Box>
      <ModernPageHeader
        title="عرض التصنيف الطبي"
        subtitle={category.nameAr}
        icon={CategoryIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/' },
          { label: 'التصنيفات الطبية', path: '/medical-categories' },
          { label: category.code }
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/medical-categories')}
            >
              رجوع
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/medical-categories/edit/${id}`)}
            >
              تعديل
            </Button>
          </Stack>
        }
      />

      <MainCard>
        <Grid container spacing={3}>
          {/* Basic Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              المعلومات الأساسية
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Code */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                الرمز
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {category.code}
              </Typography>
            </Paper>
          </Grid>

          {/* Sort Order */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                ترتيب العرض
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {category.sortOrder || 0}
              </Typography>
            </Paper>
          </Grid>

          {/* Name Arabic */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                الاسم (عربي)
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {category.nameAr}
              </Typography>
            </Paper>
          </Grid>

          {/* Name English */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                الاسم (إنجليزي)
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {category.nameEn}
              </Typography>
            </Paper>
          </Grid>

          {/* Icon Name */}
          {category.iconName && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  اسم الأيقونة
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {category.iconName}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Status */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                الحالة
              </Typography>
              <Chip
                label={category.active ? 'نشط' : 'غير نشط'}
                color={category.active ? 'success' : 'default'}
                size="medium"
              />
            </Paper>
          </Grid>

          {/* Description */}
          {category.description && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  الوصف
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {category.description}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Metadata Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              معلومات النظام
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Created At */}
          {category.createdAt && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  تاريخ الإنشاء
                </Typography>
                <Typography variant="body1">
                  {new Date(category.createdAt).toLocaleString('ar-LY')}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Updated At */}
          {category.updatedAt && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  آخر تحديث
                </Typography>
                <Typography variant="body1">
                  {new Date(category.updatedAt).toLocaleString('ar-LY')}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Created By */}
          {category.createdBy && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  أنشئ بواسطة
                </Typography>
                <Typography variant="body1">
                  {category.createdBy}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Updated By */}
          {category.updatedBy && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  آخر تحديث بواسطة
                </Typography>
                <Typography variant="body1">
                  {category.updatedBy}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </MainCard>
    </Box>
  );
};

export default MedicalCategoryView;
