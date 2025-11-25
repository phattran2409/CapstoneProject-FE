import { useState, useCallback } from 'react';
import { AxiosRequestConfig } from 'axios';
import { api } from '../services';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: any;
}

export const useApi = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const request = useCallback(async <T = any>(
    method: HttpMethod,
    url: string,
    data: any = null,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResult<T>> => {
    setLoading(true);
    setError(null);

    try {
      let response: any;
      
      switch (method.toLowerCase()) {
        case 'get':
          response = await api.get<T>(url, config);
          break;
        case 'post':
          response = await api.post<T>(url, data, config);
          break;
        case 'put':
          response = await api.put<T>(url, data, config);
          break;
        case 'delete':
          response = await api.delete<T>(url, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setError(err);
      setLoading(false);
      return { success: false, error: err };
    }
  }, []);

  return {
    loading,
    error,
    request,
  };
};

