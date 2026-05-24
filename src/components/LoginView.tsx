import React, { useState } from 'react';
import { UsersRound, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { AdminRole } from '../data/mockData';

interface LoginViewProps {
  adminRoles: AdminRole[];
  onLogin: (role: AdminRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ adminRoles, onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate loading
    setTimeout(() => {
      const role = adminRoles.find(r => r.id.toLowerCase() === userId.toLowerCase().trim());
      
      if (!role) {
        setError('User ID tidak ditemukan. Silakan periksa kembali.');
        setIsLoading(false);
        return;
      }

      if (role.status !== 'Active') {
        setError('User ID ini tidak aktif. Hubungi administrator.');
        setIsLoading(false);
        return;
      }

      if (role.password !== password) {
        setError('Password salah. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }

      // Login successful
      onLogin(role);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* Login Card */}
      <div className="relative w-full bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <UsersRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">CareerHub</h1>
          <p className="text-indigo-100 text-sm mt-1">Sistem Manajemen Rekrutmen Internal</p>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* User ID Input */}
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700">User ID <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Contoh: ROLE-001"
                autoComplete="username"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Masukkan password role"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !userId.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
