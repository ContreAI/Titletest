import { Stack, Typography, Box, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Controller, useFormContext } from 'react-hook-form';
import IconifyIcon from 'components/base/IconifyIcon';
import type { TransactionFormData } from 'modules/transactions';
import { representationOptions } from '../data/formOptions';

const RepresentationSelector = () => {
  const { control } = useFormContext<TransactionFormData>();

  return (
    <Stack spacing={1} direction="column">
      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
        I'm Representing <Box component="span" sx={{ color: 'error.main' }}>*</Box>
      </Typography>
      
      <Controller
        name="representing"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <Grid container spacing={1.5}>
              {representationOptions.map((option) => (
                <Grid key={option.value} size={4}>
                  <Button
                    onClick={() => field.onChange(option.value)}
                    sx={{
                      width: '100%',
                      flexDirection: 'column',
                      gap: 1,
                      p: 2,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: field.value === option.value ? 'primary.main' : 'divider',
                      bgcolor: field.value === option.value ? 'primary.lighter' : 'background.paper',
                      minHeight: 100,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: field.value === option.value ? 'primary.lighter' : 'action.hover',
                      },
                    }}
                  >
                    <IconifyIcon
                      icon={option.icon}
                      sx={{
                        fontSize: 32,
                        color: field.value === option.value ? 'primary.main' : 'text.secondary',
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: field.value === option.value ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {option.label}
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
    </Stack>
  );
};

export default RepresentationSelector;
