import { useState, useMemo } from 'react';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconifyIcon from 'components/base/IconifyIcon';
import DocsTrainingHeader from '../components/header/DocsTrainingHeader';
import CategoryCard from '../components/category-card/CategoryCard';
import { TrainTemplateDialog } from '../components/upload-dialog';
import { useOcrTemplatesControllerGetCompletedTrainingJobs } from '@contreai/api-client';
import {
  contractsCategories,
  stateLegalCategories,
  companyDocsCategories,
  DocumentCategory,
} from '../data/categoriesData';

// Training job from API (camelCase from TrainingStatusDto)
interface CompletedTrainingJob {
  jobId: string;
  status: 'completed' | 'pending' | 'processing' | 'error';
  fileName: string;
  category?: string;
  documentType?: string;
  templateId?: string;
  templateName?: string;
  isExisting?: boolean;
  fieldCount?: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

// Adapter to convert training job to template-like format for CategoryCard
interface TrainedTemplate {
  id: string;
  name: string;
  fieldCount: number;
}

const DocsTraining = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);

  // Fetch completed training jobs from MongoDB
  const { data: completedJobs, mutate: refreshJobs } = useOcrTemplatesControllerGetCompletedTrainingJobs();

  // Group completed jobs by category
  const jobsByCategory = useMemo(() => {
    const grouped: Record<string, CompletedTrainingJob[]> = {};
    // Response is GetCompletedTrainingJobsResponseDto with data array
    const jobs = (completedJobs?.data || []) as CompletedTrainingJob[];
    jobs.forEach((job) => {
      const category = job.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(job);
    });
    return grouped;
  }, [completedJobs]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCategoryClick = (category: DocumentCategory) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleTrainingSuccess = () => {
    // Refresh training jobs list after successful training
    refreshJobs();
  };

  const getCurrentCategories = () => {
    switch (activeTab) {
      case 0:
        return contractsCategories;
      case 1:
        return stateLegalCategories;
      case 2:
        return companyDocsCategories;
      default:
        return contractsCategories;
    }
  };

  const getDocumentType = (): string => {
    switch (activeTab) {
      case 0:
        return 'contracts';
      case 1:
        return 'state-legal';
      case 2:
        return 'company-docs';
      default:
        return 'contracts';
    }
  };

  // Get all known category IDs
  const getAllKnownCategoryIds = (): string[] => {
    const allCategories = [...contractsCategories, ...stateLegalCategories, ...companyDocsCategories];
    return allCategories.map(c => c.id).filter(id => id !== 'other');
  };

  // Convert training jobs to template-like format for CategoryCard
  const getTemplatesForCategory = (category: DocumentCategory): TrainedTemplate[] => {
    // Try matching by category id first
    if (jobsByCategory[category.id]) {
      return jobsByCategory[category.id].map(job => ({
        id: job.jobId,
        name: job.templateName || job.fileName,
        fieldCount: job.fieldCount || 0,
      }));
    }
    // For "other" category, return all jobs that don't match any known category
    if (category.id === 'other') {
      const knownIds = getAllKnownCategoryIds();
      const otherJobs: CompletedTrainingJob[] = [];
      for (const [key, jobs] of Object.entries(jobsByCategory)) {
        if (!knownIds.includes(key)) {
          otherJobs.push(...jobs);
        }
      }
      return otherJobs.map(job => ({
        id: job.jobId,
        name: job.templateName || job.fileName,
        fieldCount: job.fieldCount || 0,
      }));
    }
    return [];
  };

  return (
    <Box>
      <Stack spacing={3} direction={"column"}>
        {/* Header */}
        <DocsTrainingHeader />

        {/* Tabs */}
        <Box px={4}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              minHeight: 48,
            },
          }}
        >
          <Tab
            icon={<IconifyIcon icon="custom:docs-contracts" sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Contracts"
            sx={{
              color: activeTab === 0 ? 'primary.secondary' : 'text.tertiary',
            }}
          />
          <Tab
            icon={<IconifyIcon icon="custom:docs-state-legal" sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="State/Legal Docs"
            sx={{
              color: activeTab === 1 ? 'primary.secondary' : 'text.tertiary',
            }}
          />
          <Tab
            icon={<IconifyIcon icon="custom:docs-company" sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Company Docs"
            sx={{
              color: activeTab === 2 ? 'primary.secondary' : 'text.tertiary',
            }}
          />
        </Tabs>

        {/* Category Grid */}
        <Grid container spacing={3} py={3}>
          {getCurrentCategories().map((category) => (
            <Grid key={category.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <CategoryCard
                category={category}
                templates={getTemplatesForCategory(category)}
                onClick={handleCategoryClick}
              />
            </Grid>
          ))}
        </Grid>
        </Box>
      </Stack>

      {/* Training Dialog */}
      <TrainTemplateDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        category={selectedCategory}
        documentType={getDocumentType()}
        onSuccess={handleTrainingSuccess}
      />
    </Box>
  );
};

export default DocsTraining;
