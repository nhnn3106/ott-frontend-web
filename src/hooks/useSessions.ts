// hooks/useSessions.ts
import { useState, useEffect } from 'react';
import { sessionApi } from '../services/api';
import type { UserSessionsResponse, ApiError } from '../types';

export const useSessions = () => {
  const [sessions, setSessions] = useState<UserSessionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sessionApi.getUserSessions();
      if (response.result) {
        setSessions(response.result);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await sessionApi.revokeSession(sessionId);
      await fetchSessions(); // Refresh sessions list
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to revoke session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const revokeAllOtherSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await sessionApi.revokeAllOtherSessions();
      await fetchSessions(); // Refresh sessions list
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to revoke sessions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const revokeAllSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await sessionApi.revokeAllSessions();
      // This will log out the user
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to revoke all sessions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    isLoading,
    error,
    fetchSessions,
    revokeSession,
    revokeAllOtherSessions,
    revokeAllSessions,
  };
};