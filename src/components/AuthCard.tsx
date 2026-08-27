import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, CheckCircle2, Settings, ShieldCheck } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';

interface Props {
  onLoginSuccess: () => void;
  onOpenConfig: () => void;
}

export function AuthCard({ onLoginSuccess, onOpenConfig }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase가 설정되지 않았습니다. 우측 상단 설정 버튼을 눌러 Supabase 정보를 입력해주세요.');
      return;
    }

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          setMessage('회원가입 및 로그인이 완료되었습니다!');
          setTimeout(() => onLoginSuccess(), 800);
        } else {
          setMessage('회원가입 확인 메일이 발송되었거나 즉시 로그인되었습니다. 로그인해주세요.');
          setIsSignUp(false);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;

        setMessage('로그인 성공!');
        setTimeout(() => onLoginSuccess(), 500);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let errMsg = err.message || '인증 중 오류가 발생했습니다.';
      if (errMsg.includes('Invalid login credentials')) {
        errMsg = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (errMsg.includes('User already registered')) {
        errMsg = '이미 가입된 이메일 주소입니다. 로그인해주세요.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#EDEDED] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Top bar for config */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onOpenConfig}
            className="flex items-center space-x-1.5 text-xs font-medium text-[#A1A1A1] bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 rounded-xl shadow-xs hover:bg-[#111111] hover:text-white transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Supabase 설정 변경</span>
          </button>
        </div>

        <div className="bg-[#0A0A0A] rounded-3xl shadow-xl border border-[#262626] p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/30 rounded-2xl shadow-md mb-1">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">
              {isSignUp ? 'Supabase 회원가입' : 'Supabase 로그인'}
            </h1>
            <p className="text-xs text-[#A1A1A1] max-w-xs mx-auto">
              {isSignUp
                ? '새로운 계정을 생성하여 Supabase DB에 데이터를 안전하게 저장하세요.'
                : '등록된 계정으로 로그인하여 인증된 사용자 전용 대시보드에 입장하세요.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-800/60 text-red-400 text-xs rounded-xl flex items-center space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs rounded-xl flex items-center space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="leading-relaxed">{message}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1A1]">
                이메일 주소
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717171]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#111111] border border-[#262626] rounded-xl text-[#EDEDED] text-sm focus:outline-none focus:border-[#3ECF8E] focus:bg-[#050505] transition-all placeholder:text-[#444]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1A1]">
                비밀번호 (6자 이상)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717171]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#111111] border border-[#262626] rounded-xl text-[#EDEDED] text-sm focus:outline-none focus:border-[#3ECF8E] focus:bg-[#050505] transition-all placeholder:text-[#444]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white text-black hover:bg-[#3ECF8E] disabled:bg-[#333] disabled:text-[#717171] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>회원가입 완료하기</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>로그인하기</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#1A1A1A]">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-xs text-[#A1A1A1] hover:text-[#3ECF8E] font-medium transition-colors"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
