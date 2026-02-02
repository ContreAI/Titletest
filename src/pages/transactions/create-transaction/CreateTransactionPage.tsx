import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { Box, Paper, Stepper, Step, StepLabel, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useTransactions } from 'modules/transactions';
import type { TransactionFormData } from 'modules/transactions';
import { useTransactionPropertyTypes } from 'modules/transaction-property-types';
import { useDocumentControllerUploadDocument } from '@contreai/api-client';
import { useDocuments } from 'modules/documents';
import { createTransactionSchema } from './schemas/create-transaction.schema';
import {
  CreateTransactionHeader,
  CreateTransactionForm,
  ReviewTransactionStep,
} from './components';
import { getPendingFile } from './pending-file-store';

const steps = ['Create Transaction', 'Review & Confirm'];

/**
 * Parse an address string into components
 * Handles formats like:
 * - "123 Main St, City, ST 12345"
 * - "123 Main St, City, State 12345"
 * - "123 Main St, City, CA, 91101"
 * - "123 Main St, Pasadena, CA 91101"
 */
const parseAddressString = (address: string): { streetAddress: string; city: string; state: string; zipCode: string } => {
  const result = { streetAddress: '', city: '', state: '', zipCode: '' };

  if (!address) return result;

  // Clean up the address - remove extra whitespace
  let cleanAddress = address.trim();

  // Try to extract zip code anywhere in the string (5 digits or 5+4 format)
  // Look for zip at end, or after state abbreviation, or as standalone
  const zipMatch = cleanAddress.match(/\b(\d{5}(?:-\d{4})?)\b/);
  if (zipMatch) {
    result.zipCode = zipMatch[1];
    // Remove the zip from the address for further parsing
    cleanAddress = cleanAddress.replace(zipMatch[0], '').trim();
    // Clean up any trailing comma or whitespace
    cleanAddress = cleanAddress.replace(/,\s*$/, '').trim();
  }

  // Split by comma
  const parts = cleanAddress.split(',').map(p => p.trim()).filter(Boolean);

  if (parts.length >= 3) {
    // Format: "123 Main St, City, State" or "123 Main St, City, ST"
    result.streetAddress = parts[0];
    result.city = parts[1];
    // State might be full name or abbreviation
    const statePart = parts[2].trim();
    const stateMatch = statePart.match(/^([A-Z]{2})\b/i);
    if (stateMatch) {
      result.state = stateMatch[1].toUpperCase();
    } else {
      // Could be full state name, take as-is
      result.state = statePart;
    }
  } else if (parts.length === 2) {
    // Format: "123 Main St, City State" or "123 Main St, City ST"
    result.streetAddress = parts[0];
    // Try to extract state abbreviation from the end of the second part
    const cityStateMatch = parts[1].match(/^(.+?)\s+([A-Z]{2})\s*$/i);
    if (cityStateMatch) {
      result.city = cityStateMatch[1].trim();
      result.state = cityStateMatch[2].toUpperCase();
    } else {
      result.city = parts[1];
    }
  } else if (parts.length === 1) {
    result.streetAddress = parts[0];
  }

  return result;
};

/**
 * Create Transaction Page
 * Multi-step form for creating a new real estate transaction
 * Step 1: Fill in transaction details
 * Step 2: Review and confirm
 */
const CreateTransactionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const { createTransaction, isCreating } = useTransactions();
  const { propertyTypes } = useTransactionPropertyTypes();
  const { trigger: uploadDocument } = useDocumentControllerUploadDocument();
  const { addDocument } = useDocuments();

  // Check for pre-filled address and pending file from Smart Upload
  const extractedAddress = location.state?.extractedAddress as string | undefined;
  const hasPendingFile = location.state?.hasPendingFile as boolean | undefined;
  const parsedAddress = useMemo(() => {
    if (extractedAddress) {
      return parseAddressString(extractedAddress);
    }
    return null;
  }, [extractedAddress]);

  const methods = useForm<TransactionFormData>({
    resolver: yupResolver(createTransactionSchema),
    defaultValues: {
      // Default transaction name to street address (synced by TransactionNameField component)
      transactionName: parsedAddress?.streetAddress || '',
      representing: 'buyer',
      propertyAddress: {
        streetAddress: parsedAddress?.streetAddress || '',
        city: parsedAddress?.city || '',
        state: parsedAddress?.state || '',
        zipCode: parsedAddress?.zipCode || '',
        country: 'United States',
      },
      propertyType: propertyTypes.length > 0 ? propertyTypes[0].propertyType : '',
    },
  });

  const { handleSubmit, getValues } = methods;

  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const onSubmit = async (values: TransactionFormData) => {
    try {
      const created = await createTransaction(values);
      enqueueSnackbar('Transaction created successfully!', { variant: 'success' });

      // If there's a pending file from smart upload, upload it to the new transaction
      if (hasPendingFile) {
        const pendingFile = getPendingFile();
        if (pendingFile) {
          try {
            const fileNameWithoutExt = pendingFile.name.replace(/\.[^/.]+$/, '');
            // UploadDocumentResponseDto is the document data directly (no wrapper)
            const docData = await uploadDocument({
              file: pendingFile,
              documentName: fileNameWithoutExt,
              documentType: 'Other', // Default type, user can change later
              transactionId: created.id,
            });

            // Add to local state for immediate UI update
            if (docData?.id) {
              addDocument({
                id: docData.id,
                transactionId: created.id,
                documentName: docData.documentName || fileNameWithoutExt,
                documentType: docData.documentType || 'Other',
                fileName: pendingFile.name,
                filePath: docData.filePath,
                fileUrl: docData.fileUrl,
                fileSize: docData.fileSize,
                mimeType: docData.mimeType,
                parsedStatus: 'pending',
                metadata: {},
                parsedData: {},
                uploadedBy: docData.userId,
                createdAt: docData.createdAt || new Date().toISOString(),
                updatedAt: docData.updatedAt || new Date().toISOString(),
              });
            }

            enqueueSnackbar('Document uploaded and processing started!', { variant: 'info' });
          } catch (uploadError) {
            console.error('Failed to upload pending file:', uploadError);
            enqueueSnackbar('Transaction created, but document upload failed. Please upload manually.', {
              variant: 'warning',
            });
          }
        }
      }

      navigate(`/transactions/${created.id}`);
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to create transaction', { variant: 'error' });
      console.error('Failed to create transaction:', error);
    }
  };

  const handleCancel = () => {
    navigate('/transactions');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {/* Header with Breadcrumb and Title */}
        <Grid size={12}>
          <CreateTransactionHeader />
        </Grid>

        {/* Form Content with Stepper */}
        <Grid size={12} display="flex" justifyContent="center" mb={2}>
          <Paper sx={{ bgcolor: 'background.paper', p: { xs: 2, sm: 3 }, borderRadius: 2, maxWidth: '720px', width: '100%' }}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Pre-filled address notification */}
            {extractedAddress && activeStep === 0 && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Address pre-filled from uploaded document. Please verify the details below.
              </Alert>
            )}

            {/* Form */}
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                {activeStep === 0 ? (
                  <CreateTransactionForm onCancel={handleCancel} onNext={handleNext} />
                ) : (
                  <ReviewTransactionStep
                    getValues={getValues}
                    onCancel={handleCancel}
                    onBack={handleBack}
                    onSubmit={handleSubmit(onSubmit)}
                    isCreating={isCreating}
                  />
                )}
              </form>
            </FormProvider>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateTransactionPage;

