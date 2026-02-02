import { useState, useEffect } from 'react';
import { TextField, Stack, Typography, Box, FormControlLabel, Checkbox } from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { TransactionFormData } from 'modules/transactions';

const TransactionNameField = () => {
  const { control, setValue } = useFormContext<TransactionFormData>();
  const [useCustomName, setUseCustomName] = useState(false);

  // Watch the street address to sync with transaction name
  const streetAddress = useWatch({ control, name: 'propertyAddress.streetAddress' });
  const transactionName = useWatch({ control, name: 'transactionName' });

  // Sync transaction name with street address when not using custom name
  useEffect(() => {
    if (!useCustomName && streetAddress !== undefined) {
      setValue('transactionName', streetAddress, { shouldValidate: streetAddress.length > 0 });
    }
  }, [streetAddress, useCustomName, setValue]);

  // Check if current transaction name differs from street address on mount
  // If so, enable custom name mode
  useEffect(() => {
    if (transactionName && streetAddress && transactionName !== streetAddress && transactionName.length > 0) {
      setUseCustomName(true);
    }
  }, []); // Only run on mount

  const handleCustomNameToggle = (checked: boolean) => {
    setUseCustomName(checked);
    if (!checked && streetAddress) {
      // When unchecking, sync back to street address
      setValue('transactionName', streetAddress, { shouldValidate: true });
    }
  };

  return (
    <Stack spacing={1} direction="column">
      <FormControlLabel
        control={
          <Checkbox
            checked={useCustomName}
            onChange={(e) => handleCustomNameToggle(e.target.checked)}
            size="small"
          />
        }
        label={
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Use custom transaction name
          </Typography>
        }
        sx={{ ml: 0 }}
      />
      {useCustomName && (
        <>
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Transaction Name <Box component="span" sx={{ color: 'error.main' }}>*</Box>
          </Typography>
          <Controller
            name="transactionName"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter transaction name"
                error={!!error}
                helperText={error?.message}
              />
            )}
          />
        </>
      )}
    </Stack>
  );
};

export default TransactionNameField;
