import { Button, Stack } from '@mui/material';
import {
  TransactionNameField,
  RepresentationSelector,
  AddressFields,
  PropertyTypeSelector,
} from './';

interface CreateTransactionFormProps {
  onCancel: () => void;
  onNext: () => void;
}

const CreateTransactionForm = ({ onCancel, onNext }: CreateTransactionFormProps) => {
  return (
    <Stack spacing={2.5} direction="column">
      {/* Form Fields */}
      <TransactionNameField />
      <RepresentationSelector />
      <AddressFields />
      <PropertyTypeSelector />

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onCancel}
          sx={{ textTransform: 'none', borderRadius: 1, px: 4, minWidth: 120 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onNext}
          sx={{ textTransform: 'none', borderRadius: 1, px: 4, minWidth: 120 }}
        >
          Continue
        </Button>
      </Stack>
    </Stack>
  );
};

export default CreateTransactionForm;

