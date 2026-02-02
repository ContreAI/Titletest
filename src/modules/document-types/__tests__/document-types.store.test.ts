import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useDocumentTypesStore } from '../store/document-types.store';

// Mock the generated API client
vi.mock('@contreai/api-client', () => ({
  documentTypeControllerGetAllTypes: vi.fn(),
}));

describe('Document Types Store', () => {
  const mockDocumentTypes = [
    { id: 'dt-1', docTypeName: 'Purchase Agreement', category: 'contracts' },
    { id: 'dt-2', docTypeName: 'Inspection Report', category: 'reports' },
    { id: 'dt-3', docTypeName: 'Title Insurance', category: 'insurance' },
  ];

  beforeEach(() => {
    // Reset store state
    useDocumentTypesStore.setState({
      documentTypes: [],
      isLoading: false,
      error: null,
      lastFetched: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useDocumentTypesStore.getState();
      expect(state.documentTypes).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastFetched).toBeNull();
    });
  });

  describe('fetchDocumentTypes', () => {
    it('should fetch and store document types', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.documentTypeControllerGetAllTypes).mockResolvedValueOnce(
        mockDocumentTypes as any
      );

      await useDocumentTypesStore.getState().fetchDocumentTypes();

      expect(apiClient.documentTypeControllerGetAllTypes).toHaveBeenCalled();
      expect(useDocumentTypesStore.getState().documentTypes).toHaveLength(3);
      expect(useDocumentTypesStore.getState().isLoading).toBe(false);
      expect(useDocumentTypesStore.getState().lastFetched).not.toBeNull();
    });

    it('should set loading state during fetch', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.documentTypeControllerGetAllTypes).mockReturnValueOnce(promise as any);

      const fetchPromise = useDocumentTypesStore.getState().fetchDocumentTypes();
      expect(useDocumentTypesStore.getState().isLoading).toBe(true);

      resolvePromise!(mockDocumentTypes);
      await fetchPromise;
      expect(useDocumentTypesStore.getState().isLoading).toBe(false);
    });

    it('should skip fetch if already loading', async () => {
      const apiClient = await import('@contreai/api-client');
      useDocumentTypesStore.setState({ isLoading: true });

      await useDocumentTypesStore.getState().fetchDocumentTypes();

      expect(apiClient.documentTypeControllerGetAllTypes).not.toHaveBeenCalled();
    });

    it('should use cached data if fresh', async () => {
      const apiClient = await import('@contreai/api-client');
      const recentTimestamp = Date.now() - 60000; // 1 minute ago
      useDocumentTypesStore.setState({
        documentTypes: mockDocumentTypes as any,
        lastFetched: recentTimestamp,
      });

      await useDocumentTypesStore.getState().fetchDocumentTypes();

      expect(apiClient.documentTypeControllerGetAllTypes).not.toHaveBeenCalled();
    });

    it('should refetch if cache is stale', async () => {
      const apiClient = await import('@contreai/api-client');
      const staleTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago
      useDocumentTypesStore.setState({
        documentTypes: mockDocumentTypes as any,
        lastFetched: staleTimestamp,
      });
      vi.mocked(apiClient.documentTypeControllerGetAllTypes).mockResolvedValueOnce(
        mockDocumentTypes as any
      );

      await useDocumentTypesStore.getState().fetchDocumentTypes();

      expect(apiClient.documentTypeControllerGetAllTypes).toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.documentTypeControllerGetAllTypes).mockRejectedValueOnce({
        response: { data: { message: 'Fetch failed' } },
      });

      await useDocumentTypesStore.getState().fetchDocumentTypes();

      expect(useDocumentTypesStore.getState().error).toBe('Fetch failed');
      expect(useDocumentTypesStore.getState().isLoading).toBe(false);
    });
  });

  describe('getDocumentTypeById', () => {
    it('should return document type by id', () => {
      useDocumentTypesStore.setState({ documentTypes: mockDocumentTypes as any });

      const result = useDocumentTypesStore.getState().getDocumentTypeById('dt-2');

      expect(result).toEqual(mockDocumentTypes[1]);
    });

    it('should return undefined for non-existent id', () => {
      useDocumentTypesStore.setState({ documentTypes: mockDocumentTypes as any });

      const result = useDocumentTypesStore.getState().getDocumentTypeById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('getDocumentTypeByName', () => {
    it('should return document type by name', () => {
      useDocumentTypesStore.setState({ documentTypes: mockDocumentTypes as any });

      const result = useDocumentTypesStore.getState().getDocumentTypeByName('Inspection Report');

      expect(result).toEqual(mockDocumentTypes[1]);
    });

    it('should return undefined for non-existent name', () => {
      useDocumentTypesStore.setState({ documentTypes: mockDocumentTypes as any });

      const result = useDocumentTypesStore.getState().getDocumentTypeByName('Unknown Type');

      expect(result).toBeUndefined();
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useDocumentTypesStore.setState({ error: 'Some error' });
      useDocumentTypesStore.getState().clearError();
      expect(useDocumentTypesStore.getState().error).toBeNull();
    });
  });
});
