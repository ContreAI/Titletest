import { useMemo } from 'react';
import { Stack, Typography, Button, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Controller, useFormContext } from 'react-hook-form';
import IconifyIcon from 'components/base/IconifyIcon';
import type { TransactionFormData } from 'modules/transactions';
import { useTransactionPropertyTypes } from 'modules/transaction-property-types';

// Icon mapping for property types
const getPropertyTypeIcon = (propertyType: string): string => {
  const iconMap: Record<string, string> = {
    'Single Family': 'mdi:home-outline',
    'Condo/Townhouse': 'mdi:office-building-outline',
    'Land': 'mdi:terrain',
    'Commercial': 'mdi:office-building-marker-outline',
    'Other': 'mdi:dots-horizontal',
  };
  return iconMap[propertyType] || 'mdi:home-outline';
};

const PropertyTypeSelector = () => {
  const { control } = useFormContext<TransactionFormData>();
  const { propertyTypes, isLoading } = useTransactionPropertyTypes();

  // Reorder property types: Commercial before Single Family
  const orderedPropertyTypes = useMemo(() => {
    const commercialIndex = propertyTypes.findIndex(pt => pt.propertyType === 'Commercial');
    const singleFamilyIndex = propertyTypes.findIndex(pt => pt.propertyType === 'Single Family');
    
    if (commercialIndex === -1 || singleFamilyIndex === -1) {
      return propertyTypes;
    }
    
    const reordered = [...propertyTypes];
    // Swap positions: move Commercial to Single Family's position, and Single Family to Commercial's position
    [reordered[commercialIndex], reordered[singleFamilyIndex]] = [reordered[singleFamilyIndex], reordered[commercialIndex]];
    
    return reordered;
  }, [propertyTypes]);

  return (
    <Stack spacing={1} direction="column">
      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
        Transaction Type
      </Typography>
      
      {isLoading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={32} />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading property types...
          </Typography>
        </Stack>
      ) : (
        <Controller
          name="propertyType"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <Grid container spacing={1.5}>
                {orderedPropertyTypes.map((propertyType) => (
                  <Grid key={propertyType.id} size={{ xs: 6, sm: 4 }}>
                    <Button
                      onClick={() => field.onChange(propertyType.propertyType)}
                      sx={{
                        width: '100%',
                        flexDirection: 'column',
                        gap: 1,
                        p: 2,
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: field.value === propertyType.propertyType ? 'primary.main' : 'divider',
                        bgcolor: field.value === propertyType.propertyType ? 'primary.lighter' : 'background.paper',
                        minHeight: 100,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: field.value === propertyType.propertyType ? 'primary.lighter' : 'action.hover',
                        },
                      }}
                    >
                      <IconifyIcon
                        icon={getPropertyTypeIcon(propertyType.propertyType)}
                        sx={{
                          fontSize: 28,
                          color: field.value === propertyType.propertyType ? 'primary.main' : 'text.secondary',
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: field.value === propertyType.propertyType ? 'primary.main' : 'text.primary',
                          textAlign: 'center',
                          fontSize: '0.8125rem',
                        }}
                      >
                        {propertyType.propertyType}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
              
              {error && (
                <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5 }}>
                  {error.message}
                </Typography>
              )}
            </>
          )}
        />
      )}
    </Stack>
  );
};

export default PropertyTypeSelector;
