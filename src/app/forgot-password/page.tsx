'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [resetToken, setResetToken] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setResetLink('');
    setResetToken('');

    try {
      const response: any = await authService.forgotPassword({ email });
      setMessage(response.message);
      
      // Nếu có development token/link (khi email chưa được cấu hình)
      if (response.developmentLink || response.developmentToken) {
        setResetLink(response.developmentLink || '');
        setResetToken(response.developmentToken || '');
      } else {
        // Nếu email đã được gửi, chuyển về login sau 3 giây
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-800">{message}</div>
              {resetLink && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-yellow-800">
                    ⚠️ DEVELOPMENT MODE: Email chưa được cấu hình
                  </p>
                  <div className="rounded bg-yellow-50 p-3 border border-yellow-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Link đặt lại mật khẩu:</p>
                    <a
                      href={resetLink}
                      className="text-xs text-indigo-600 hover:text-indigo-800 break-all underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {resetLink}
                    </a>
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      ⏰ Link này sẽ hết hạn sau 1 giờ kể từ khi được tạo
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(resetLink);
                        alert('Đã copy link vào clipboard!');
                      }}
                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Copy link
                    </button>
                  </div>
                  {resetToken && (
                    <div className="rounded bg-gray-50 p-3 border border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-1">Token (để test):</p>
                      <code className="text-xs text-gray-600 break-all">{resetToken}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Nhập email của bạn"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
            </button>
          </div>

          <div className="text-center">
            <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
              Quay lại đăng nhập
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

