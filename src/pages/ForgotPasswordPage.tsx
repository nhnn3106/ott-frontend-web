import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useForgotPassword } from '../hooks/useForgotPassword';

interface Step1Props {
  onNext: (phone: string, email: string) => void;
  loading: boolean;
  error: string | null;
}

const Step1Request: React.FC<Step1Props> = ({ onNext, loading, error }) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validatePhone = () => {
    if (!phone.trim()) { setPhoneError('Vui lòng nhập số điện thoại'); return false; }
    if (!/^(0|\+84)[0-9]{9,10}$/.test(phone)) { setPhoneError('Số điện thoại không hợp lệ'); return false; }
    setPhoneError(''); return true;
  };

  const validateEmail = () => {
    if (!email.trim()) { setEmailError('Vui lòng nhập email'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Email không hợp lệ'); return false; }
    setEmailError(''); return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePhone() && validateEmail()) onNext(phone, email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={validatePhone}
            placeholder="0123456789"
            className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${phoneError ? 'border-red-300' : 'border-gray-200'}`}
          />
        </div>
        {phoneError && <p className="mt-1.5 text-sm text-red-600">{phoneError}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateEmail}
            placeholder="email@example.com"
            className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${emailError ? 'border-red-300' : 'border-gray-200'}`}
          />
        </div>
        {emailError && <p className="mt-1.5 text-sm text-red-600">{emailError}</p>}
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs text-blue-700">
          <strong>Lưu ý:</strong> Nhập đúng số điện thoại và email đã đăng ký. Mã OTP sẽ được gửi đến email của bạn.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
      </button>

      <button
        type="button"
        onClick={() => window.location.href = '/login'}
        className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại đăng nhập
      </button>
    </form>
  );
};

// ─── Bước 2: Nhập OTP ────────────────────────────────────────────────────────
interface Step2Props {
  phone: string;
  email: string;
  onNext: (otp: string) => void;
  onBack: () => void;
  onResend: () => void;
  loading: boolean;
  error: string | null;
  countdown: number;
}

const Step2VerifyOtp: React.FC<Step2Props> = ({
  phone, email, onNext, onBack, onResend, loading, error, countdown,
}) => {
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setLocalError('Vui lòng nhập mã OTP 6 số'); return; }
    setLocalError('');
    onNext(otp);
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {displayError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{displayError}</p>
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
        <p className="text-sm text-blue-700">
          <strong>SĐT:</strong> {phone.replace(/(\d{3})\d+(\d{3})/, '$1****$2')}
        </p>
        <p className="text-sm text-blue-700">
          <strong>Email:</strong> {email.replace(/(.{3}).*(@.*)/, '$1***$2')}
        </p>
        <p className="text-xs text-blue-600 mt-1">Mã OTP đã được gửi đến email của bạn</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mã OTP (6 số) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setLocalError(''); }}
          placeholder="000000"
          maxLength={6}
          autoFocus
          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-3xl tracking-[0.5em] font-mono"
        />
        <p className="mt-2 text-xs text-gray-500 text-center">
          OTP có hiệu lực trong 5 phút
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
      </button>

      <button
        type="button"
        onClick={onResend}
        disabled={loading || countdown > 0}
        className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {countdown > 0 ? `Gửi lại mã OTP (${countdown}s)` : 'Gửi lại mã OTP'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </button>
    </form>
  );
};

// ─── Bước 3: Nhập mật khẩu mới ──────────────────────────────────────────────
interface Step3Props {
  onSubmit: (newPassword: string, confirmPassword: string) => void;
  loading: boolean;
  error: string | null;
}

const Step3NewPassword: React.FC<Step3Props> = ({ onSubmit, loading, error }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { setLocalError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    if (newPassword !== confirmPassword) { setLocalError('Mật khẩu xác nhận không khớp'); return; }
    setLocalError('');
    onSubmit(newPassword, confirmPassword);
  };

  const displayError = localError || error;
  const passwordsMatch = confirmPassword && newPassword === confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {displayError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{displayError}</p>
        </div>
      )}

      <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
        <p className="text-xs text-green-700 font-medium">✓ OTP đã xác thực thành công. Hãy tạo mật khẩu mới.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mật khẩu mới <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setLocalError(''); }}
            placeholder="Nhập mật khẩu mới"
            autoFocus
            className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">Tối thiểu 6 ký tự</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Xác nhận mật khẩu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(''); }}
            placeholder="Nhập lại mật khẩu mới"
            className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${confirmPassword
                ? passwordsMatch ? 'border-green-400' : 'border-red-300'
                : 'border-gray-200'
              }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {confirmPassword && !passwordsMatch && (
          <p className="mt-1.5 text-xs text-red-600">Mật khẩu không khớp</p>
        )}
        {passwordsMatch && (
          <p className="mt-1.5 text-xs text-green-600">✓ Mật khẩu khớp</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
      </button>
    </form>
  );
};

export const ForgotPasswordPage = () => {
  const { loading, error, requestPasswordReset, verifyPasswordReset, resetState } = useForgotPassword();

  type Step = 'request' | 'verify-otp' | 'new-password' | 'success';
  const [step, setStep] = useState<Step>('request');

  // Lưu data qua các bước
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Bước 1 → 2
  const handleRequestOtp = async (p: string, em: string) => {
    resetState();
    try {
      await requestPasswordReset(p, em);
      setPhone(p);
      setEmail(em);
      startCountdown(60);
      setStep('verify-otp');
    } catch { /* error từ hook */ }
  };

  // Bước 2 → 3 (chỉ validate format, submit thật ở bước 3)
  const handleVerifyOtp = (enteredOtp: string) => {
    setOtp(enteredOtp);
    setStep('new-password');
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    resetState();
    try {
      await requestPasswordReset(phone, email);
      startCountdown(60);
    } catch { /* error từ hook */ }
  };

  // Bước 3 → success (API call thật, nếu OTP sai sẽ trả về error)
  const handleResetPassword = async (newPassword: string, confirmPassword: string) => {
    resetState();
    try {
      await verifyPasswordReset(phone, email, otp, newPassword, confirmPassword);
      setStep('success');
    } catch { /* error từ hook — OTP sai sẽ hiện lỗi tại đây */ }
  };

  const stepMeta: Record<Step, { title: string; subtitle: string; step: number }> = {
    'request': { title: 'Quên mật khẩu', subtitle: 'Nhập số điện thoại và email đã đăng ký', step: 1 },
    'verify-otp': { title: 'Nhập mã OTP', subtitle: 'Kiểm tra email và nhập mã xác thực', step: 2 },
    'new-password': { title: 'Mật khẩu mới', subtitle: 'Tạo mật khẩu mới cho tài khoản của bạn', step: 3 },
    'success': { title: 'Hoàn tất', subtitle: 'Mật khẩu đã được đặt lại thành công', step: 3 },
  };

  const meta = stepMeta[step];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-6">
            <MessageCircle className="w-9 h-9 text-white" />
          </div>

          {/* Step indicator — chỉ hiện khi chưa success */}
          {step !== 'success' && (
            <div className="flex items-center justify-center gap-2 mb-5">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${meta.step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                    }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-10 h-0.5 transition-all ${meta.step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-800 mb-1">{meta.title}</h1>
          <p className="text-sm text-gray-500">{meta.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'request' && (
            <Step1Request
              onNext={handleRequestOtp}
              loading={loading}
              error={error}
            />
          )}

          {step === 'verify-otp' && (
            <Step2VerifyOtp
              phone={phone}
              email={email}
              onNext={handleVerifyOtp}
              onBack={() => { setStep('request'); resetState(); }}
              onResend={handleResendOtp}
              loading={loading}
              error={error}
              countdown={countdown}
            />
          )}

          {step === 'new-password' && (
            <Step3NewPassword
              onSubmit={handleResetPassword}
              loading={loading}
              error={error}
            />
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu thành công!</h3>
                <p className="text-gray-500 text-sm">
                  Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại với mật khẩu mới.
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Bạn đã nhớ mật khẩu?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Đăng nhập</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;