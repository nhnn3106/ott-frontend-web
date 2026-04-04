// pages/RegisterPage.tsx

import React, { useState, useEffect } from 'react';
import { userApi, authApi } from '../services/api';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    otp: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  
  const [restoreStatus, setRestoreStatus] = useState<{
    canRestore: boolean;
    message: string;
    daysRemaining?: number;
  } | null>(null);


  useEffect(() => {
    const checkRestore = async () => {
      if (formData.phone || formData.email) {
        try {
          let response;
          if (formData.phone && formData.phone.length >= 10) {
            response = await authApi.checkRestoreByPhone(formData.phone);
          } else if (formData.email && formData.email.includes('@')) {
            response = await authApi.checkRestoreByEmail(formData.email);
          }
          
          if (response?.result) {
            const { canRestore, accountDeleted, message, daysRemaining } = response.result;
            
            if (canRestore) {
              setRestoreStatus({
                canRestore: true,
                message,
                daysRemaining,
              });
            } else if (accountDeleted && !canRestore) {
              // Account đã xóa > 30 ngày HOẶC phone/email đã dùng cho account khác
              setRestoreStatus({
                canRestore: false,
                message,
              });
            } else {
              setRestoreStatus(null);
            }
          }
        } catch (err) {
          // Ignore error, chỉ là check thông tin thêm
          console.log('Check restore error (ignored):', err);
        }
      }
    };

    const debounce = setTimeout(checkRestore, 500);
    return () => clearTimeout(debounce);
  }, [formData.phone, formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.phone || !formData.email || !formData.password || !formData.fullName) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await userApi.requestRegisterOtp(
        formData.phone,
        formData.email,
        formData.fullName
      );
      
      setSuccess(response.result?.message || 'OTP đã được gửi về email của bạn');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 số');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await userApi.register({
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        otp: formData.otp,
      });
      
      setSuccess('Đăng ký thành công! Chuyển đến trang đăng nhập...');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">Đăng ký</h2>

        {/* ✅ Restore Status Banner */}
        {restoreStatus && (
          <div className={`mb-4 p-4 rounded-lg border ${
            restoreStatus.canRestore 
              ? 'bg-blue-50 border-blue-300' 
              : 'bg-amber-50 border-amber-300'
          }`}>
            <div className="flex items-start gap-3">
              {restoreStatus.canRestore ? (
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  restoreStatus.canRestore ? 'text-blue-800' : 'text-amber-800'
                }`}>
                  {restoreStatus.canRestore ? 'Tài khoản có thể khôi phục' : 'Thông báo'}
                </p>
                <p className={`text-sm mt-1 ${
                  restoreStatus.canRestore ? 'text-blue-700' : 'text-amber-700'
                }`}>
                  {restoreStatus.message}
                </p>
                {restoreStatus.canRestore && restoreStatus.daysRemaining && (
                  <p className="text-xs text-blue-600 mt-2">
                    Bạn có {restoreStatus.daysRemaining} ngày để khôi phục.{' '}
                    <a href="/login" className="font-semibold underline">
                      Đăng nhập để khôi phục
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-start gap-2">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0123456789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">Tối thiểu 8 ký tự</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <p className="text-center text-sm text-gray-600 mb-4">
              Mã OTP đã gửi đến: <strong>{formData.email}</strong>
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                Nhập mã OTP
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-center">Mã gồm 6 chữ số</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
            </button>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Quay lại
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Đã có tài khoản? Đăng nhập
          </a>
        </div>
      </div>
    </div>
  );
}