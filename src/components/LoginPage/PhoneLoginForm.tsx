
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { Loader2, Eye, EyeOff } from 'lucide-react';


interface PhoneLoginFormProps {
  onSuccess: () => void;
}

export const PhoneLoginForm: React.FC<PhoneLoginFormProps> = ({ onSuccess }) => {
  const { login, verify2FA, request2FAOtp } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(phone, password);
      
      // ✅ CHECK: Có cần 2FA không?
      if (result.requires2FA && result.tempToken) {
        console.log('2FA required, showing OTP form');
        setRequires2FA(true);
        setTempToken(result.tempToken);
        setLoading(false);
        return;
      }
      
      // ✅ Login thành công (hoặc auto restore)
      if (result.authenticated) {
        console.log('Login successful');
        onSuccess();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.code === 'INVALID_CREDENTIALS') {
        setError('Số điện thoại hoặc mật khẩu không đúng');
      } else if (err.code === 'PASSWORD_NOT_SET') {
        setError('Tài khoản chưa có mật khẩu. Vui lòng đăng nhập bằng Google hoặc đặt mật khẩu.');
      } else {
        setError(err.message || 'Đăng nhập thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify 2FA OTP
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 số');
      return;
    }

    setError('');
    setOtpLoading(true);

    try {
      const result = await verify2FA(tempToken, otpCode);
      
      if (result.authenticated) {
        console.log('2FA verification successful');
        onSuccess();
      }
    } catch (err: any) {
      console.error('2FA verification error:', err);
      
      if (err.code === 'INVALID_OTP_CODE') {
        setError('Mã OTP không đúng. Vui lòng kiểm tra lại.');
      } else if (err.code === 'OTP_EXPIRED') {
        setError('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
      } else if (err.code === 'OTP_MAX_ATTEMPTS_EXCEEDED') {
        setError('Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới.');
      } else {
        setError(err.message || 'Xác thực thất bại');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // ✅ Request new OTP
  const handleResendOTP = async () => {
    setError('');
    setOtpLoading(true);

    try {
      await request2FAOtp(phone);
      alert('Mã OTP mới đã được gửi đến email của bạn');
      setOtpCode(''); // Clear input
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Không thể gửi lại OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // ✅ Back to login form
  const handleBackToLogin = () => {
    setRequires2FA(false);
    setTempToken('');
    setOtpCode('');
    setError('');
  };

  // ✅ Nếu đang ở bước 2FA
  if (requires2FA) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Xác thực 2 yếu tố</h3>
          <p className="text-sm text-gray-600 mt-1">
            Nhập mã OTP đã được gửi đến email của bạn
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify2FA} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã OTP
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtpCode(value);
                setError('');
              }}
              placeholder="123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
              maxLength={6}
              autoFocus
              required
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Nhập 6 chữ số
            </p>
          </div>

          <button
            type="submit"
            disabled={otpLoading || otpCode.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {otpLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Đang xác thực...</span>
              </>
            ) : (
              'Xác thực'
            )}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Quay lại
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={otpLoading}
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-medium"
            >
              Gửi lại OTP
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số điện thoại
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError('');
          }}
          placeholder="0123456789"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span className="text-gray-600">Ghi nhớ đăng nhập</span>
        </label>
        <a href="/forgot-password" className="text-blue-600 hover:text-blue-700">
          Quên mật khẩu?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          'Đăng nhập'
        )}
      </button>
    </form>
  );
};