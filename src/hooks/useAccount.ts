// hooks/useAccount.ts
import { useState } from 'react';
import { accountApi } from '../services/api';
import type {
  SetPasswordRequest,
  ChangePasswordRequest,
  ChangeEmailRequest,
  ChangePhoneRequest,
  DeleteAccountRequest,
  ApiError
} from '../types';
import { useAuth } from '../context/AuthContext';

export const useAccount = () => {
  const { refreshUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPassword = async (data: SetPasswordRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await accountApi.setPassword(data);
      await refreshUser();
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to set password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await accountApi.changePassword(data);
      if (response.result) {
        // Password changed successfully, sessions revoked
        // User needs to login again
        await logout();
      }
      return response.result;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to change password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changeEmail = async (data: ChangeEmailRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await accountApi.changeEmail(data);
      if (response.result) {
        await refreshUser();
      }
      return response.result;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to change email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changePhone = async (data: ChangePhoneRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await accountApi.changePhone(data);
      if (response.result) {
        await refreshUser();
      }
      return response.result;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to change phone';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (data: DeleteAccountRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await accountApi.deleteAccount(data);
      if (response.result) {
        // Account deleted, logout
        await logout();
      }
      return response.result;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to delete account';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    setPassword,
    changePassword,
    changeEmail,
    changePhone,
    deleteAccount,
  };
};