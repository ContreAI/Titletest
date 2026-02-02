import { useState } from 'react';
import { Box, Paper, Collapse } from '@mui/material';
import type { Transaction } from 'modules/transactions';
import type { TransactionReport } from 'modules/transaction-reports';
import { DealDetailsHeader, DealDetailsContent } from './components';

interface DealDetailsSectionProps {
  transaction: Transaction | null;
  report: TransactionReport | null;
}

const DealDetailsSection = ({ transaction, report }: DealDetailsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box component="section">
      {/* Centered max-width container */}
      <Box sx={{ mx: 'auto', }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark' ? '0 1px 1px rgba(0,0,0,0.2)' : '0 1px 1px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          {/* Header row (always visible) - clickable */}
          <DealDetailsHeader isOpen={isOpen} onToggle={() => setIsOpen((prev) => !prev)} />

          {/* Body (collapsible) */}
          <Collapse in={isOpen}>
            <DealDetailsContent transaction={transaction} report={report} />
          </Collapse>
        </Paper>
      </Box>
    </Box>
  );
};

export default DealDetailsSection;
