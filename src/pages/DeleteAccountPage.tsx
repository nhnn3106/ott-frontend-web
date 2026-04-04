// pages/DeleteAccountPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Key, Lock, CheckCircle } from 'lucide-react';
import { accountApi } from '../services/api/account.api';
import { useAccount } from '../hooks/useAccount';
import { useAuth } from '../context/AuthContext';

const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { deleteAccount } = useAccount();

  const [step, setStep] = useState<'warning' | 'confirm' | 'otp'>('warning');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmText, setConfirmText] = useState('');

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
      const response = await accountApi.requestDeleteAccount({});
      if (response.result) {
        setSuccess('Mã OTP đã được gửi đến email của bạn');
        setStep('otp');
        startCountdown();
      }
    } catch (err: any) {
      setError(err.message || 'Không thể gửi mã OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await deleteAccount({
        otp,
        password: user?.hasPassword ? password : undefined,
      });

      if (result) {
        setSuccess('Tài khoản đã được xóa thành công');
        setTimeout(async () => {
          await logout();
          navigate('/');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể xóa tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setError('');
    setLoading(true);

    try {
      const response = await accountApi.requestDeleteAccount({});
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Xóa tài khoản
            </h1>
            <p className="text-gray-600">
              Hành động này không thể hoàn tác
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
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Warning */}
          {step === 'warning' && (
            <div className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-3">
                  Khi xóa tài khoản, những dữ liệu sau sẽ bị mất vĩnh viễn:
                </p>
                <ul className="text-sm text-red-700 space-y-2 list-disc list-inside">
                  <li>Thông tin cá nhân và hồ sơ</li>
                  <li>Lịch sử hoạt động</li>
                  <li>Dữ liệu và nội dung đã lưu</li>
                  <li>Tất cả các kết nối và liên kết</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  Lưu ý quan trọng:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Tài khoản sẽ bị xóa vĩnh viễn và không thể khôi phục</li>
                  <li>Bạn có thể tạo tài khoản mới với cùng số điện thoại/email</li>
                  <li>Mọi dữ liệu sẽ bị mất hoàn toàn</li>
                </ul>
              </div>

              <button
                onClick={() => setStep('confirm')}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Tôi hiểu và muốn tiếp tục
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 'confirm' && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  Để xác nhận, vui lòng nhập: <span className="font-mono bg-red-100 px-2 py-1 rounded">XOA TAI KHOAN</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận xóa tài khoản
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Nhập: XOA TAI KHOAN"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {user?.hasPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu của bạn"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  confirmText !== 'XOA TAI KHOAN' ||
                  (user?.hasPassword && !password)
                }
                className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Đang xử lý...' : 'Gửi mã xác thực'}
              </button>

              <button
                type="button"
                onClick={() => setStep('warning')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Quay lại
              </button>
            </form>
          )}

          {/* Step 3: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleDeleteAccount} className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Mã xác thực đã được gửi đến email <span className="font-medium">{user?.email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã xác thực OTP
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Nhập mã 6 chữ số"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest font-semibold"
                    required
                    maxLength={6}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Đang xóa tài khoản...' : 'Xác nhận xóa tài khoản'}
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
                onClick={() => setStep('confirm')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Quay lại
              </button>
            </form>
          )}

          {/* Additional Info */}
          {step !== 'otp' && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                Bạn cần hỗ trợ? Liên hệ với chúng tôi qua support@example.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;