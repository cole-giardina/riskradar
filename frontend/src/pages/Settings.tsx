import { useState, useEffect, type MouseEvent } from 'react';
import { profile, reminders } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  User,
  Bell,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const setSpotlight = (e: MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
};
const clearSpotlight = (e: MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.removeProperty('--spot-x');
  e.currentTarget.style.removeProperty('--spot-y');
};

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      onMouseMove={setSpotlight}
      onMouseLeave={clearSpotlight}
      className={`group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#161b22]/60 backdrop-blur-sm transition duration-500 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(300px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(0,255,204,0.08), transparent 70%)',
        }}
      />
      {children}
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [twoFAStep, setTwoFAStep] = useState<'idle' | 'qr' | 'verify'>('idle');
  const [qrCode, setQrCode] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [publicUsername, setPublicUsername] = useState(user?.public_username || '');
  const [publicEnabled, setPublicEnabled] = useState(user?.public_profile_enabled || false);
  const [reminderList, setReminderList] = useState<{ id: number; type: string; due_date: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');

  const setSuccess = (text: string) => { setMessageTone('success'); setMessage(text); };
  const setError = (text: string) => { setMessageTone('error'); setMessage(text); };

  useEffect(() => {
    reminders.get().then((r) => setReminderList(r.reminders))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load reminders'));
  }, []);

  const handleSetup2FA = async () => {
    setLoading(true); setMessage('');
    try { const res = await profile.setup2FA(); setQrCode(res.qr_code); setTwoFAStep('qr'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage('');
    try { await profile.verify2FASetup(twoFACode); setTwoFAStep('idle'); setSuccess('2FA enabled successfully'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Invalid code'); }
    finally { setLoading(false); }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage('');
    try { await profile.disable2FA(disableCode); setSuccess('2FA disabled'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Invalid code'); }
    finally { setLoading(false); }
  };

  const handlePublicUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage('');
    try { await profile.updatePublic(publicEnabled ? publicUsername || null : null, publicEnabled); setSuccess('Profile updated'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  };

  const handleAddReminder = async (type: string) => {
    setLoading(true);
    try {
      const res = await reminders.create(type, 7);
      setReminderList((prev) => [...prev, { id: res.id, type: res.type, due_date: res.due_date }]);
      setSuccess('Reminder added');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not add reminder'); }
    finally { setLoading(false); }
  };

  const handleDeleteReminder = async (id: number) => {
    try { await reminders.delete(id); setReminderList((prev) => prev.filter((r) => r.id !== id)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not remove reminder'); }
  };

  const inputClass =
    'w-full max-w-sm rounded-xl border border-white/[0.08] bg-[#0d1117]/60 px-4 py-3 text-sm text-white placeholder-[#8b949e]/60 backdrop-blur-sm transition focus:border-[#00ffcc]/40 focus:outline-none focus:ring-1 focus:ring-[#00ffcc]/20';
  const btnPrimary =
    'inline-flex items-center gap-2 rounded-full bg-[#00ffcc] px-5 py-2.5 text-sm font-semibold text-[#0d1117] transition-all hover:bg-[#00e6b8] hover:shadow-lg hover:shadow-[#00ffcc]/20 disabled:opacity-50';
  const btnDanger =
    'inline-flex items-center gap-2 rounded-full border border-[#ff3366]/20 bg-[#ff3366]/5 px-5 py-2.5 text-sm font-medium text-[#ff3366] transition hover:bg-[#ff3366]/10 disabled:opacity-50';

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#00ffcc]">
          Settings
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Account & Security
        </h1>
      </div>

      {/* Toast */}
      {message && (
        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
          messageTone === 'error'
            ? 'border-[#ff3366]/20 bg-[#ff3366]/5 text-[#ff8899]'
            : 'border-[#00ff88]/20 bg-[#00ff88]/5 text-[#00ff88]'
        }`} role="alert">
          {messageTone === 'error'
            ? <AlertTriangle className="h-4 w-4 shrink-0" />
            : <CheckCircle2 className="h-4 w-4 shrink-0" />
          }
          {message}
        </div>
      )}

      {/* 2FA Card */}
      <Card>
        <div className="p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00ffcc]/10">
              <Shield className="h-4 w-4 text-[#00ffcc]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">
                Two-Factor Auth
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">
                {user?.totp_enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>

          {user?.totp_enabled ? (
            <form onSubmit={handleDisable2FA} className="space-y-4">
              <div className="flex items-center gap-2 rounded-2xl border border-[#00ff88]/20 bg-[#00ff88]/5 px-4 py-3 text-sm text-[#00ff88]">
                <CheckCircle2 className="h-4 w-4" /> 2FA is currently enabled
              </div>
              <input
                type="text" value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code to disable"
                className={inputClass}
              />
              <button type="submit" disabled={loading} className={btnDanger}>Disable 2FA</button>
            </form>
          ) : twoFAStep === 'qr' ? (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <p className="text-sm text-[#8b949e]">Scan with your authenticator app:</p>
              <div className="inline-block rounded-2xl border border-white/[0.08] bg-white p-3">
                <img src={qrCode} alt="QR Code" className="h-44 w-44" />
              </div>
              <input
                type="text" value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className={inputClass}
              />
              <div className="flex gap-3">
                <button type="submit" disabled={loading || twoFACode.length !== 6} className={btnPrimary}>Verify & Enable</button>
                <button type="button" onClick={() => setTwoFAStep('idle')} className="rounded-full border border-white/[0.08] px-5 py-2.5 text-sm text-[#8b949e] hover:bg-white/[0.04]">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={handleSetup2FA} disabled={loading} className={btnPrimary}>Enable 2FA</button>
          )}
        </div>
      </Card>

      {/* Public Profile Card */}
      <Card>
        <div className="p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00ffcc]/10">
              <User className="h-4 w-4 text-[#00ffcc]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">
                Public Profile
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">
                Share your security score
              </p>
            </div>
          </div>
          <form onSubmit={handlePublicUpdate} className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3">
              <div className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${publicEnabled ? 'bg-[#00ffcc]' : 'bg-white/10'}`}>
                <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${publicEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" checked={publicEnabled} onChange={(e) => setPublicEnabled(e.target.checked)} className="sr-only" />
              <span className="text-sm">Enable public profile</span>
            </label>
            {publicEnabled && (
              <div>
                <p className="mb-2 text-xs text-[#8b949e]">Profile URL: /score/{publicUsername || 'username'}</p>
                <input
                  type="text" value={publicUsername}
                  onChange={(e) => setPublicUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                  placeholder="username"
                  className={inputClass}
                />
              </div>
            )}
            <button type="submit" disabled={loading} className={btnPrimary}>Save</button>
          </form>
        </div>
      </Card>

      {/* Reminders Card */}
      <Card>
        <div className="p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00ffcc]/10">
              <Bell className="h-4 w-4 text-[#00ffcc]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">
                Reminders
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">
                Stay on top of security checks
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <button onClick={() => handleAddReminder('breach_check')} disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-[#e6edf3] transition hover:border-[#00ffcc]/30 hover:bg-[#00ffcc]/5">
              <Plus className="h-3.5 w-3.5 text-[#00ffcc]" /> Breach check (7 days)
            </button>
            <button onClick={() => handleAddReminder('password_rotate')} disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-[#e6edf3] transition hover:border-[#00ffcc]/30 hover:bg-[#00ffcc]/5">
              <Plus className="h-3.5 w-3.5 text-[#00ffcc]" /> Password rotation
            </button>
          </div>

          {reminderList.length === 0 ? (
            <p className="text-sm text-[#8b949e]">No reminders set</p>
          ) : (
            <ul className="space-y-2">
              {reminderList.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-2xl border border-white/[0.06] px-4 py-3">
                  <div>
                    <span className="text-sm text-[#e6edf3]">{r.type.replace('_', ' ')}</span>
                    <span className="ml-2 text-xs text-[#8b949e]">due {new Date(r.due_date).toLocaleDateString()}</span>
                  </div>
                  <button onClick={() => handleDeleteReminder(r.id)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-[#ff3366] transition hover:bg-[#ff3366]/10">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
