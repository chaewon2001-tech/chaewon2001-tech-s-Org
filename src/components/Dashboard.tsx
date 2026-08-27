import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, ShieldCheck, Plus, Trash2, Calendar, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';
import { SecureNote } from '../types';

interface Props {
  user: any;
  onLogout: () => void;
  onOpenConfig: () => void;
}

export function Dashboard({ user, onLogout, onOpenConfig }: Props) {
  const [notes, setNotes] = useState<SecureNote[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setFetching(true);
    try {
      // Try fetching from secure_notes table if it exists
      const { data, error: fetchError } = await supabase
        .from('secure_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        // If table doesn't exist yet, we can fallback to localStorage or show instructions
        console.warn('Note table might not exist in Supabase yet:', fetchError.message);
        // Fallback to local storage for user notes
        const local = localStorage.getItem(`secure_notes_${user.id}`);
        if (local) {
          setNotes(JSON.parse(local));
        }
      } else {
        setNotes(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching notes:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    const newNote = {
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error: insertError } = await supabase
        .from('secure_notes')
        .insert([newNote])
        .select();

      if (insertError) {
        // If supabase table insertion fails (e.g. table not created), save locally and inform
        console.warn('Supabase insert failed, saving locally:', insertError.message);
        const fallbackNote: SecureNote = {
          id: Math.random().toString(36).substring(2, 9),
          ...newNote,
        };
        const updated = [fallbackNote, ...notes];
        setNotes(updated);
        localStorage.setItem(`secure_notes_${user.id}`, JSON.stringify(updated));
        setError('Supabase에 secure_notes 테이블이 생성되지 않아 임시 로컬에 저장되었습니다. Supabase 대시보드에서 secure_notes 테이블을 생성해주세요.');
      } else if (data) {
        setNotes([...data, ...notes]);
      }

      setTitle('');
      setContent('');
    } catch (err: any) {
      setError(err.message || '노트 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error: deleteError } = await supabase
        .from('secure_notes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Fallback local delete
        const updated = notes.filter((n) => n.id !== id);
        setNotes(updated);
        localStorage.setItem(`secure_notes_${user.id}`, JSON.stringify(updated));
      } else {
        setNotes(notes.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#EDEDED] flex flex-col">
      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-[#1A1A1A] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/30 rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#EDEDED]">보안 대시보드</h1>
              <p className="text-xs text-[#3ECF8E]">Supabase 인증 세션 활성화됨</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenConfig}
              className="flex items-center space-x-1.5 text-xs font-medium text-[#A1A1A1] bg-[#111111] hover:bg-[#1A1A1A] hover:text-white border border-[#262626] px-3.5 py-2 rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Supabase 설정</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 text-xs font-medium text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 px-3.5 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* User Profile Card */}
        <div className="bg-[#0A0A0A] rounded-2xl border border-[#262626] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-[#111111] border border-[#262626] text-[#3ECF8E] rounded-2xl flex items-center justify-center text-xl font-bold shadow-md">
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-[#EDEDED]">{user.email}</h2>
                <span className="px-2.5 py-0.5 bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/30 text-xs font-medium rounded-full">
                  인증됨
                </span>
              </div>
              <p className="text-xs text-[#A1A1A1] mt-0.5">사용자 ID: <span className="font-mono text-[#717171]">{user.id}</span></p>
            </div>
          </div>
          <div className="text-xs text-[#A1A1A1] bg-[#111111] px-4 py-3 rounded-xl border border-[#262626] flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#3ECF8E]" />
            <span>마지막 로그인: {new Date(user.last_sign_in_at || Date.now()).toLocaleString()}</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-amber-950/40 border border-amber-800/60 text-amber-400 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Secure Notes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Note Form */}
          <div className="bg-[#0A0A0A] rounded-2xl border border-[#262626] p-6 shadow-xs h-fit space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#3ECF8E]" />
              <h3 className="font-bold text-[#EDEDED] text-base">보안 노트 작성</h3>
            </div>
            <p className="text-xs text-[#A1A1A1] leading-relaxed">
              로그인한 사용자만 접근 및 저장할 수 있는 Supabase 연동 보안 노트입니다.
            </p>

            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1A1]">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="노트 제목을 입력하세요"
                  className="w-full px-3.5 py-3 bg-[#111111] border border-[#262626] rounded-xl text-[#EDEDED] text-sm focus:outline-none focus:border-[#3ECF8E] focus:bg-[#050505] transition-all placeholder:text-[#444]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1A1]">
                  내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="중요한 메모나 데이터를 기록하세요..."
                  rows={4}
                  className="w-full px-3.5 py-3 bg-[#111111] border border-[#262626] rounded-xl text-[#EDEDED] text-sm focus:outline-none focus:border-[#3ECF8E] focus:bg-[#050505] transition-all resize-none placeholder:text-[#444]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-white text-black hover:bg-[#3ECF8E] disabled:bg-[#333] disabled:text-[#717171] font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>노트 저장하기</span>
              </button>
            </form>
          </div>

          {/* Notes List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#3ECF8E]" />
                <h3 className="font-bold text-[#EDEDED] text-base">내 보안 노트 목록</h3>
              </div>
              <span className="text-xs bg-[#111111] border border-[#262626] text-[#A1A1A1] px-3 py-1 rounded-full font-medium">
                총 {notes.length}개
              </span>
            </div>

            {fetching ? (
              <div className="p-12 text-center text-[#717171] text-sm">노트 불러오는 중...</div>
            ) : notes.length === 0 ? (
              <div className="bg-[#0A0A0A] rounded-2xl border border-dashed border-[#262626] p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-[#111111] border border-[#262626] text-[#717171] rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-[#EDEDED]">작성된 보안 노트가 없습니다.</p>
                <p className="text-xs text-[#717171]">좌측 폼을 이용해 첫 번째 노트를 작성해보세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-[#0A0A0A] rounded-2xl border border-[#262626] p-5 shadow-xs hover:border-[#3ECF8E]/50 transition-all flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-semibold text-[#EDEDED] text-base">{note.title}</h4>
                      <p className="text-xs text-[#A1A1A1] whitespace-pre-wrap leading-relaxed">{note.content}</p>
                      <p className="text-[11px] text-[#717171] pt-1">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-[#717171] hover:text-red-400 p-2 rounded-xl hover:bg-red-950/40 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
