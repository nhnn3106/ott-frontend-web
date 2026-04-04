// pages/RegisterPage.tsx

import React, { useState } from 'react';
import { userApi } from '../services/api';
import { AlertCircle, CheckCircle } from 'lucide-react';

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

  const mapRegisterError = (code: number | undefined, fallback: string): string => {
    switch (code) {
      case 1300:
        return 'Số điện thoại không hợp lệ.';
      case 1301:
        return 'Email không hợp lệ.';
      case 1302:
        return 'Mật khẩu chưa đúng định dạng yêu cầu của hệ thống.';
      case 1303:
      case 1308:
        return 'Họ và tên không hợp lệ.';
      case 1400:
        return 'Số điện thoại đã được sử dụng.';
      case 1401:
        return 'Email đã được sử dụng.';
      case 1500:
      case 1501:
        return 'Mã OTP không tồn tại hoặc đã hết hạn.';
      case 1503:
        return 'Mã OTP không đúng.';
      case 1504:
      case 1506:
        return 'Bạn đã nhập sai OTP quá nhiều lần. Vui lòng yêu cầu mã mới.';
      case 1505:
        return 'Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau.';
      case 6099:
        return 'Tài khoản đã xóa gần đây và vẫn có thể khôi phục. Vui lòng đăng nhập để khôi phục.';
      default:
        return fallback;
    }
  };

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

    if (!/^0\d{9}$/.test(formData.phone.trim())) {
      setError('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0');
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
      setError(mapRegisterError(err.code, err.message || 'Không thể gửi OTP đăng ký'));
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
      await userApi.register({
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        otp: formData.otp,
      });
      
      setSuccess('Đăng ký thành công! Chuyển đến trang đăng nhập...');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err: any) {
      setError(mapRegisterError(err.code, err.message || 'Đăng ký thất bại'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-primary-100">
        <h2 className="text-3xl font-bold text-center mb-6 text-primary-800">Đăng ký</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-start gap-2">
            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-center">Mã gồm 6 chữ số</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
          <a href="/login" className="text-primary-700 hover:text-primary-800 font-semibold">
            Đã có tài khoản? Đăng nhập
          </a>
        </div>
      </div>
    </div>
  );
}