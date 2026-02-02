import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Box, Button, Divider, CircularProgress } from '@mui/material';
import { useAuthStore } from 'modules/auth';
import { getAxiosInstance } from '@contreai/api-client';
import {
  BrandLogo,
  PersonalInfo,
  SubscriptionPreview,
  BillingHistoryPreview,
} from './components';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  brandLogo: string | null;
}

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);

  // Parse full name into first and last name
  const parseName = (fullName: string | undefined) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    const lastName = parts.slice(-1)[0];
    const firstName = parts.slice(0, -1).join(' ');
    return { firstName, lastName };
  };

  const { firstName: defaultFirstName, lastName: defaultLastName } = parseName(user?.name);

  const methods = useForm<ProfileFormData>({
    defaultValues: {
      firstName: defaultFirstName || '',
      lastName: defaultLastName || '',
      email: user?.email || '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      brandLogo: user?.avatar || null,
    },
  });

  const { handleSubmit, formState: { isDirty }, setValue, watch, reset } = methods;
  const logoPreview = watch('brandLogo');

  const handleLogoChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setValue('brandLogo', reader.result as string, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = () => {
    setValue('brandLogo', null, { shouldDirty: true });
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        profileImage: data.brandLogo,
      };

      // Use getAxiosInstance() since generated userControllerUpdateProfile doesn't accept body parameters
      await getAxiosInstance().put('/api/v1/users/profile', payload);

      // Update local auth store with new user data
      updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`.trim(),
        avatar: data.brandLogo,
      });

      // Reset form state so isDirty becomes false after successful save
      reset(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.75 }}>
          <BrandLogo
            logoPreview={logoPreview}
            onLogoChange={handleLogoChange}
            onLogoRemove={handleLogoRemove}
          />

          <Divider />

          <PersonalInfo />

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!isDirty || isSaving}
              sx={{ textTransform: 'none', minWidth: 150 }}
            >
              {isSaving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
            </Button>
          </Box>

          <Divider />

          <SubscriptionPreview />

          <Divider />

          <BillingHistoryPreview />
        </Box>
      </form>
    </FormProvider>
  );
};

export default ProfilePage;

