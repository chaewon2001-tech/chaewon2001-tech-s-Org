import React, { useState, useEffect } from 'react';
import { getSupabaseClient, getStoredSupabaseConfig } from './lib/supabase';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { AuthCard } from './components/AuthCard';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const checkAuthAndConfig = async () => {
    const config = getStoredSupabaseConfig();
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      setShowConfigModal(true);
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setShowConfigModal(true);
      setLoading(false);
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
      }
      setUser(session?.user || null);
    } catch (err) {
      console.error('Failed to get session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndConfig();

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const handleConfigSaved = () => {
    setShowConfigModal(false);
    setLoading(true);
    checkAuthAndConfig();
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#262626] border-t-[#3ECF8E] rounded-full animate-spin" />
      </div>
    );
  }

  const config = getStoredSupabaseConfig();
  const needsConfig = !config.supabaseUrl || !config.supabaseAnonKey;

  return (
    <>
      <SupabaseConfigModal
        isOpen={showConfigModal || needsConfig}
        onConfigSaved={handleConfigSaved}
        required={needsConfig}
      />

      {!user ? (
        <AuthCard
          onLoginSuccess={() => checkAuthAndConfig()}
          onOpenConfig={() => setShowConfigModal(true)}
        />
      ) : (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onOpenConfig={() => setShowConfigModal(true)}
        />
      )}
    </>
  );
}
