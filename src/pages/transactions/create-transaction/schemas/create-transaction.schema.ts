import * as yup from 'yup';
import type { TransactionFormData } from 'modules/transactions';

/**
 * Create Transaction Form Validation Schema
 * Using Yup for validation (consistent with auth pages)
 */
export const createTransactionSchema: yup.ObjectSchema<TransactionFormData> = yup.object({
  transactionName: yup
    .string()
    .required('Transaction name is required')
    .min(3, 'Transaction name must be at least 3 characters'),
  
  representing: yup
    .mixed<'buyer' | 'seller' | 'both'>()
    .oneOf(['buyer', 'seller', 'both'], 'Please select who you are representing')
    .required('Please select who you are representing'),
  
  propertyAddress: yup.object({
    streetAddress: yup.string().required('Street address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zipCode: yup.string().required('ZIP code is required'),
    country: yup.string().optional(),
  }).required('Property address is required'),
  
  propertyType: yup
    .string()
    .required('Property type is required')
    .min(1, 'Please select a property type'),
});

