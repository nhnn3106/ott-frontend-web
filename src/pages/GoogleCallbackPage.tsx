// pages/GoogleCallbackPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { MessageCircle, AlertCircle } from 'lucide-react';

export const GoogleCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback, error } = useGoogleLogin();
  const [isProcessing, setIsProcessing] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // ✅ Prevent double processing
    if (hasProcessedRef.current) {
      console.log('Already processed, skipping...');
      return;
    }

    const processCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      console.log('Google OAuth callback:', { 
        hasCode: !!code, 
        codePreview: code?.substring(0, 20),
        error: errorParam 
      });

      // ✅ Handle OAuth errors from Google
      if (errorParam) {
        console.error('Google OAuth error:', errorParam);
        const errorMessage = errorParam === 'access_denied' 
          ? 'Bạn đã từ chối quyền truy cập. Vui lòng thử lại.'
          : 'Đăng nhập Google thất bại. Vui lòng thử lại.';
        
        setLocalError(errorMessage);
        setIsProcessing(false);
        
        setTimeout(() => {
          navigate('/login', { 
            state: { error: errorMessage },
            replace: true
          });
        }, 2000);
        return;
      }

      // ✅ No code means invalid callback
      if (!code) {
        console.error('No authorization code in callback');
        setLocalError('Không tìm thấy mã xác thực');
        setIsProcessing(false);
        
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
        return;
      }

      // ✅ Mark as processed BEFORE async call
      hasProcessedRef.current = true;

      try {
        console.log('Processing authorization code...');
        const success = await handleGoogleCallback(code);
        
        if (!success) {
          console.error('Google callback returned false');
          setIsProcessing(false);
          // Error will be handled by useGoogleLogin hook
        }
        
      } catch (err: any) {
        console.error('Unexpected callback error:', err);
        setLocalError(err.message || 'Đã xảy ra lỗi không mong muốn');
        setIsProcessing(false);
        
        setTimeout(() => {
          navigate('/login', { 
            state: { error: 'Đã xảy ra lỗi. Vui lòng thử lại.' },
            replace: true
          });
        }, 2000);
      }
    };

    processCallback();
  }, []); // ✅ Empty deps - only run once

  // ✅ Show error state
  if (error || localError) {
    const displayError = error || localError;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Đăng nhập thất bại
          </h2>
          <p className="text-red-600 mb-6">{displayError}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // ✅ Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
            <MessageCircle className="w-9 h-9 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-2 justify-center mb-4">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-gray-600 font-medium">Đang xử lý đăng nhập...</p>
        {isProcessing && (
          <p className="text-sm text-gray-400 mt-2">Vui lòng đợi trong giây lát</p>
        )}
      </div>
    </div>
  );
};

export default GoogleCallbackPage;