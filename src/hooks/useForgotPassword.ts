import { useState } from 'react';
import { accountApi } from '../services/api';

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  
  const requestPasswordReset = async (phone: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await accountApi.requestPasswordReset({ phone, email });

      if (response.result) {
        setSuccess(true);
        return response.result;
      }

      throw new Error(response.message || 'Không thể gửi mã OTP');
    } catch (err: any) {
      const errorMessage = err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyPasswordReset = async (
    phone: string,
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (newPassword !== confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }

      if (newPassword.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }

      await accountApi.verifyPasswordReset({
        phone,
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      setSuccess(true);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Đặt lại mật khẩu thất bại';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  return {
    loading,
    error,
    success,
    requestPasswordReset,
    verifyPasswordReset,
    resetState,
  };
};