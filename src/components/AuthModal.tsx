import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ShieldAlert } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickLogin = async (role: 'customer' | 'admin') => {
    setError('');
    setLoading(true);
    const testEmail = role === 'admin' ? 'admin@maxtech.com' : 'gabriel@maxtech.com';
    const testPassword = '12345678';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar login rápido');
      }
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password } 
      : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ocorreu um erro no servidor.');
      }
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-intelbras-dark-green px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-lg font-bold tracking-tight">
            {isLogin ? 'Acessar Conta MaxTech' : 'Criar Nova Conta'}
          </h2>
          <button 
            id="close-auth-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {error && (
            <div id="auth-error-alert" className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 border border-red-100">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Login Section */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Acesso Rápido para Testes:
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="quick-login-customer"
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-slate-200 hover:border-intelbras-green hover:text-intelbras-green text-sm font-medium rounded-lg shadow-2xs transition-all active:scale-95"
              >
                <UserIcon size={16} />
                <span>Cliente Teste</span>
              </button>
              <button
                id="quick-login-admin"
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-slate-200 hover:border-intelbras-green hover:text-intelbras-green text-sm font-medium rounded-lg shadow-2xs transition-all active:scale-95"
              >
                <Lock size={16} />
                <span>Admin Teste</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              * Clique em um dos botões para logar instantaneamente sem preencher nada.
            </p>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium uppercase">ou preencha</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserIcon size={16} />
                  </span>
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-intelbras-green/20 focus:border-intelbras-green transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="exemplo@maxtech.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-intelbras-green/20 focus:border-intelbras-green transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Senha (mínimo 8 caracteres)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-intelbras-green/20 focus:border-intelbras-green transition-all"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          {/* Toggle login vs register */}
          <div className="mt-6 text-center">
            <button
              id="toggle-auth-mode"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs font-semibold text-intelbras-green hover:text-intelbras-green-hover hover:underline transition-colors focus:outline-none"
            >
              {isLogin 
                ? 'Não tem uma conta? Cadastre-se aqui' 
                : 'Já possui uma conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
