import EmptyState from 'components/base/EmptyState';
import { EmptyDocumentsIllustration } from 'components/base/EmptyStateIllustrations';

interface DocumentsEmptyStateProps {
  onUploadClick?: () => void;
}

const DocumentsEmptyState = ({ onUploadClick }: DocumentsEmptyStateProps) => {
  return (
    <EmptyState
      icon={<EmptyDocumentsIllustration />}
      title="No documents yet"
      description="Upload documents to start tracking and analyzing your transaction files."
      action={
        onUploadClick
          ? {
              label: 'Upload Documents',
              onClick: onUploadClick,
            }
          : undefined
      }
    />
  );
};

export default DocumentsEmptyState;

