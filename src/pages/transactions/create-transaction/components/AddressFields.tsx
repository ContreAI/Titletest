import { TextField, Stack, Typography, Autocomplete } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Controller, useFormContext } from 'react-hook-form';
import type { TransactionFormData } from 'modules/transactions';
import { usStates } from '../data/formOptions';

const AddressFields = () => {
  const { control } = useFormContext<TransactionFormData>();

  return (
    <Stack spacing={1} direction="column">
      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
        Property Address
      </Typography>
      
      <Stack spacing={2} direction="column">
        {/* Street Address */}
        <Controller
          name="propertyAddress.streetAddress"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              placeholder="Street address"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />

        {/* City, State, and Zip Code */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 5 }}>
            <Controller
              name="propertyAddress.city"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="City"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="propertyAddress.state"
              control={control}
              render={({ field, fieldState: { error } }) => (
              <Autocomplete
                options={usStates}
                value={field.value || null}
                onChange={(_event, newValue) => field.onChange(newValue || '')}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>
                    option.toLowerCase().includes(inputValue.toLowerCase())
                  )
                }
                sx={{
                  // Keep height/padding consistent with City/Zip text fields (8px top/bottom)
                  '& .MuiAutocomplete-inputRoot.MuiFilledInput-root': {
                    paddingTop: 1,
                    paddingBottom: 1,
                    paddingLeft: 1.5,
                    paddingRight: 1.5,
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="State"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    
                  />
                )}
              />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="propertyAddress.zipCode"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="Zip Code"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
};

export default AddressFields;
