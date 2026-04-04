

import React, { useState } from 'react';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Mail } from 'lucide-react';

interface EmailOTPLoginFormProps {
  onSuccess: () => void;
}

export const EmailOTPLoginForm: React.FC<EmailOTPLoginFormProps> = ({ onSuccess }) => {
  const { loginWithToken } = useAuth();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authApi.requestEmailOtpLogin(email);
      setSuccess(response.result?.message || 'OTP đã được gửi đến email của bạn');
      setStep('otp');
    } catch (err: any) {
      if (err.code === 1005 || err.code === 1103) {
        setError('Tài khoản đã bị xóa vĩnh viễn (quá 30 ngày). Vui lòng đăng ký tài khoản mới.');
      } else if (err.code === 3001 || err.code === 3002 || err.code === 1400 || err.code === 1401) {
        setError('Không thể khôi phục tài khoản vì email đã được sử dụng cho tài khoản khác.');
      } else if (err.code === 4005 || err.code === 1505) {
        setError('Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau.');
      } 
      else {
        setError(err.message || 'Không thể gửi OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.verifyEmailOtpLogin({ email, otpCode });
      
      if (response.result?.token && response.result?.refreshToken) {
        await loginWithToken(response.result.token, response.result.refreshToken);
        onSuccess();
      }
    } catch (err: any) {

        setError(err.message || 'Mã OTP không hợp lệ');
      
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="text-center mb-4">
          <Mail className="w-12 h-12 text-primary-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Mã OTP đã được gửi đến
          </p>
          <p className="font-semibold text-gray-900">{email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
            Nhập mã OTP
          </label>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => {
              setOtpCode(e.target.value);
              setError('');
            }}
            placeholder="000000"
            maxLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Đang xác thực...</span>
            </>
          ) : (
            'Xác nhận'
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setStep('email');
            setOtpCode('');
            setError('');
          }}
          className="w-full text-gray-600 hover:text-gray-800 font-medium"
        >
          ← Quay lại
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestOtp} className="space-y-4">

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          placeholder="example@email.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Đang gửi...</span>
          </>
        ) : (
          'Gửi mã OTP'
        )}
      </button>
    </form>
  );
};