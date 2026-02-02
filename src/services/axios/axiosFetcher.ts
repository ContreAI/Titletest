import { getAxiosInstance } from '@contreai/api-client';

// Type definition for axios request config (minimal interface for SWR fetcher)
interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
}

const axiosFetcher = async (
  args:
    | string
    | [string, RequestConfig]
    | [
        string,
        RequestConfig,
        {
          disableThrowError?: boolean;
          disableErrorToast?: boolean;
        },
      ],
  extraArg?: {
    arg: unknown;
  },
): Promise<unknown> => {
  const [url, config, extraConfig] = Array.isArray(args) ? args : [args];
  const axiosInstance = getAxiosInstance();
  let interceptors: null | number = null;

  interceptors = axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (extraConfig?.disableThrowError) {
        return Promise.resolve(null);
      }
      throw error;
    },
  );

  const res = await axiosInstance({
    url,
    method: config?.method || 'get',
    data: extraArg?.arg,
    ...config,
  }).finally(() => {
    if (interceptors) {
      axiosInstance.interceptors.response.eject(interceptors);
      interceptors = null;
    }
  });

  return res;
};

export default axiosFetcher;
