import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

interface GenerateReportDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const GenerateReportDialog = ({ open, onClose, onConfirm, isLoading = false }: GenerateReportDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="report-dialog-title"
      aria-describedby="report-dialog-description"
    >
      <DialogTitle id="report-dialog-title">
        Generate Full Report
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="report-dialog-description">
          This will generate a comprehensive transaction report by analyzing and
          cross-referencing all uploaded documents. The process may take a few moments.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isLoading}>
          Cancel
        </Button>
        <LoadingButton
          onClick={onConfirm}
          color="primary"
          variant="contained"
          loading={isLoading}
        >
          Generate Report
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateReportDialog;

