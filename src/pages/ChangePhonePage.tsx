// pages/ChangePhonePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { accountApi } from '../services/api/account.api';
import { useAuth } from '../context/AuthContext';
import { useAccount } from '../hooks/useAccount';

const ChangePhonePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { changePhone } = useAccount();
  
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [newPhone, setNewPhone] = useState('');
  const [otp, setOtp] = useState('');

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await accountApi.requestChangePhone({ newPhone });
      if (response.result) {
        setSuccess('Mã OTP đã được gửi đến số điện thoại mới');
        setStep('verify');
        startCountdown();
      }
    } catch (err: any) {
      setError(err.message || 'Không thể gửi mã OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await changePhone({ newPhone, otp });
      if (result) {
        setSuccess(`Đổi số điện thoại thành công! ${result.sessionsRevoked} phiên đăng nhập khác đã bị hủy.`);
        await refreshUser();
        setTimeout(() => navigate('/profile'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setError('');
    setLoading(true);

    try {
      const response = await accountApi.requestChangePhone({ newPhone });
      if (response.result) {
        setSuccess('Đã gửi lại mã OTP');
        startCountdown();
      }
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại mã OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Đổi số điện thoại
            </h1>
            <p className="text-gray-600">
              Số điện thoại hiện tại: <span className="font-medium">{user?.phone}</span>
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Request OTP */}
          {step === 'request' && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại mới
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Nhập số điện thoại mới"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                  pattern="[0-9]{10,11}"
                  maxLength={11}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nhập số điện thoại 10-11 chữ số
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !newPhone || newPhone.length < 10}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'verify' && (
            <form onSubmit={handleChangePhone} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã xác thực OTP
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Nhập mã 6 chữ số"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest font-semibold"
                    required
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Mã OTP đã được gửi đến số điện thoại {newPhone}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Đang xác thực...' : 'Xác nhận đổi số điện thoại'}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-600">
                    Gửi lại mã sau <span className="font-semibold text-blue-600">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 transition-colors"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('request');
                  setOtp('');
                  setError('');
                  setSuccess('');
                }}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Thay đổi số điện thoại
              </button>
            </form>
          )}

          {/* Warning */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tất cả phiên đăng nhập khác sẽ bị hủy</li>
                  <li>Bạn sẽ cần đăng nhập lại trên các thiết bị khác</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePhonePage;