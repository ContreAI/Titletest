import * as yup from 'yup';

/**
 * Single invite form validation schema
 */
export const inviteSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  role: yup
    .string()
    .oneOf(['broker', 'agent', 'transactionCoordinator', 'admin'], 'Please select a valid role')
    .required('Role is required'),
  isMaster: yup.boolean().default(false),
});

export type InviteSchemaType = yup.InferType<typeof inviteSchema>;

/**
 * CSV row validation schema
 */
export const csvRowSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  role: yup
    .string()
    .oneOf(['broker', 'agent', 'transactionCoordinator', 'admin'], 'Invalid role (use: broker, agent, transactionCoordinator, admin)')
    .required('Role is required'),
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
});

export type CsvRowSchemaType = yup.InferType<typeof csvRowSchema>;

/**
 * Edit member role validation schema
 */
export const editMemberSchema = yup.object({
  role: yup
    .string()
    .oneOf(['broker', 'agent', 'transactionCoordinator', 'admin'], 'Please select a valid role')
    .required('Role is required'),
  isMaster: yup.boolean().default(false),
});

export type EditMemberSchemaType = yup.InferType<typeof editMemberSchema>;
