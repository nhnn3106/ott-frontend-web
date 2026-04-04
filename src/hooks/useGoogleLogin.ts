// hooks/useGoogleLogin.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { GOOGLE_CONFIG } from '../configuration/api';

export const useGoogleLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  const handleGoogleCallback = async (code: string): Promise<boolean> => {
    try {
      setError(null);
      console.log('Processing Google callback with code:', code.substring(0, 20));
      
      const response = await authApi.googleAuth({ 
        code,
        redirectUri: GOOGLE_CONFIG.REDIRECT_URI
      });

      // ✅ Check if response exists
      if (!response || !response.result) {
        console.error('Invalid response from backend:', response);
        setError('Phản hồi không hợp lệ từ server');
        navigate('/login', { 
          state: { error: 'Đăng nhập Google thất bại. Vui lòng thử lại.' },
          replace: true 
        });
        return false;
      }

      const result = response.result;

      // ✅ Case 1: Cần setup phone (user mới từ Google)
      if (result.requiresPhoneSetup && result.tempToken) {
        console.log('Redirecting to phone setup');
        navigate('/setup-phone', { 
          state: { 
            tempToken: result.tempToken,
            googleUserInfo: result.googleUserInfo
          },
          replace: true 
        });
        return true;
      }

      // ✅ Case 2: Cần 2FA
      if (result.requires2FA && result.tempToken) {
        console.log('Redirecting to 2FA verification');
        navigate('/verify-2fa', { 
          state: { tempToken: result.tempToken },
          replace: true 
        });
        return true;
      }

      // ✅ Case 3: Login thành công
      if (result.authenticated && result.token && result.refreshToken) {
        console.log('Login successful, storing tokens');
        
        try {
          // ✅ Store tokens and fetch user
          await loginWithToken(result.token, result.refreshToken);
          console.log('Tokens stored and user fetched successfully');
          
          // ✅ Navigate to home page
          console.log('Navigating to /home');
          navigate('/home', { replace: true });
          
          return true;
        } catch (loginError) {
          console.error('Error during login:', loginError);
          setError('Không thể lưu thông tin đăng nhập');
          navigate('/login', { 
            state: { error: 'Lỗi lưu thông tin. Vui lòng thử lại.' },
            replace: true 
          });
          return false;
        }
      }

      // ✅ Case 4: Unexpected state
      console.error('Unexpected authentication state:', result);
      setError('Trạng thái xác thực không hợp lệ');
      navigate('/login', { 
        state: { error: 'Đăng nhập Google thất bại. Vui lòng thử lại.' },
        replace: true 
      });
      return false;

    } catch (err: any) {
      console.error('Google callback error:', err);
      
      // ✅ Handle specific error cases
      let errorMessage = 'Đăng nhập Google thất bại';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // ✅ Special handling for "code already used" error
      if (errorMessage.includes('authorization code') || 
          errorMessage.includes('already used') ||
          errorMessage.includes('invalid_grant')) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      }

      setError(errorMessage);
      navigate('/login', { 
        state: { error: errorMessage },
        replace: true 
      });
      return false;
    }
  };

  const initiateGoogleLogin = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.CLIENT_ID,
      redirect_uri: GOOGLE_CONFIG.REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account', // ✅ Force account selection every time
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return { 
    handleGoogleCallback, 
    initiateGoogleLogin,
    error 
  };
};