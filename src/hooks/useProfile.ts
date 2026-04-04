// hooks/useProfile.ts
import { useState } from 'react';
import { profileApi } from '../services/api';
import type { UserProfileResponse, UpdateProfileRequest, ApiError } from '../types';
import { useAuth } from '../context/AuthContext';

export const useProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: UpdateProfileRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await profileApi.updateProfile(data);
      
      if (response.result) {
        await refreshUser();
        return response.result;
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async (userId?: string): Promise<UserProfileResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = userId 
        ? await profileApi.getProfile(userId)
        : await profileApi.getCurrentProfile();
      
      if (response.result) {
        return response.result;
      }
      
      return null;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to get profile');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    updateProfile,
    getProfile,
  };
};