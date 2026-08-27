import React, { useState } from 'react';
import { Database, Key, Globe, Check, AlertCircle, HelpCircle } from 'lucide-react';
import { SupabaseConfig } from '../types';
import { getStoredSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onConfigSaved: () => void;
  required?: boolean;
}

export function SupabaseConfigModal({ isOpen, onConfigSaved, required = false }: Props) {
  const current = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(current.supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(current.supabaseAnonKey);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUrl = supabaseUrl.trim();
    const trimmedKey = supabaseAnonKey.trim();

    if (!trimmedUrl || !trimmedKey) {
      setError('Supabase URL과 Anon Key를 모두 입력해주세요.');
      return;
    }

    try {
      const parsed = new URL(trimmedUrl);
      if (!parsed.protocol.startsWith('http')) {
        setError('올바른 URL 형식이어야 합니다 (https://...).');
        return;
      }
    } catch {
      setError('유효하지 않은 Supabase URL 형식입니다.');
      return;
    }

    saveSupabaseConfig({
      supabaseUrl: trimmedUrl,
      supabaseAnonKey: trimmedKey,
    });

    onConfigSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-[#0A0A0A] rounded-2xl shadow-2xl border border-[#262626] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#EDEDED]">
        <div className="bg-[#111111] text-[#EDEDED] px-6 py-5 flex items-center justify-between border-b border-[#262626]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#3ECF8E]/20 text-[#3ECF8E] rounded-xl border border-[#3ECF8E]/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Supabase 연결 설정</h2>
              <p className="text-xs text-[#A1A1A1]">로그인 및 데이터 저장을 위한 Supabase 파라미터 입력</p>
            </div>
          </div>
          {!required && (
            <button
              onClick={onConfigSaved}
              className="text-[#A1A1A1] hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-[#1A1A1A] transition-colors"
            >
              닫기
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-400 text-sm rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1A1]">
              Supabase Project URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717171]">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full pl-10 pr-4 py-3 bg-[#111111] border border-[#262626] rounded-xl text-[#3ECF8E] text-sm focus:outline-none focus:border-[#3ECF8E] focus:bg-[#050505] transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1A1]">
              Supabase Anon / Public API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717171]">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full pl-10 pr-4 py-3 bg-[#111111] border border-[#262626] rounded-xl text-[#EDEDED] text-sm focus:outline-none focus:border-[#3ECF8E] focus:bg-[#050505] transition-all font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs text-[#A1A1A1] hover:text-[#3ECF8E] flex items-center space-x-1 font-medium transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Supabase Key는 어디서 찾을 수 있나요?</span>
            </button>

            {showHelp && (
              <div className="mt-2 p-3 bg-[#111111] border border-[#262626] rounded-xl text-xs text-[#A1A1A1] space-y-1.5 leading-relaxed">
                <p>1. Supabase 대시보드(supabase.com)에 로그인합니다.</p>
                <p>2. 프로젝트 설정(Project Settings) &gt; API 메뉴로 이동합니다.</p>
                <p>3. <strong>Project URL</strong>과 <strong>anon public</strong> 키를 복사하여 위 입력란에 붙여넣습니다.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#1A1A1A] flex items-center justify-end space-x-3">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-white text-black hover:bg-[#3ECF8E] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Supabase 연결 저장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
