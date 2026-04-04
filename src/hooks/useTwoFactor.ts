import { useState, useEffect } from 'react';
import { twoFactorApi } from '../services/api';
import type {
  TwoFactorAuthStatus,
  Enable2FARequest,
  Disable2FARequest,
  ApiError
} from '../types';
import { useAuth } from '../context/AuthContext';

export const useTwoFactor = () => {
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<TwoFactorAuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await twoFactorApi.getStatus();
      if (response.result) {
        setStatus(response.result);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch 2FA status');
    } finally {
      setIsLoading(false);
    }
  };

  const requestEnableOtp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await twoFactorApi.requestEnable();
      return response.result;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to request OTP';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const enable = async (data: Enable2FARequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await twoFactorApi.enable(data);
      if (response.result) {
        await fetchStatus();
        await refreshUser();
      }
      return response.result;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to enable 2FA';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const requestDisableOtp = async (password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await twoFactorApi.requestDisable({ password });
      return response.result;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to request OTP';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const disable = async (data: Disable2FARequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await twoFactorApi.disable(data);
      await fetchStatus();
      await refreshUser();
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to disable 2FA';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    isLoading,
    error,
    fetchStatus,
    requestEnableOtp,
    enable,
    requestDisableOtp,
    disable,
  };
};