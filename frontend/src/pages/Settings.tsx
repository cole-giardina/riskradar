import { useState, useEffect } from 'react';
import { profile, reminders } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

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

  useEffect(() => {
    reminders.get().then((r) => setReminderList(r.reminders));
  }, []);

  const handleSetup2FA = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await profile.setup2FA();
      setQrCode(res.qr_code);
      setTwoFAStep('qr');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await profile.verify2FASetup(twoFACode);
      setTwoFAStep('idle');
      setMessage('2FA enabled successfully');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await profile.disable2FA(disableCode);
      setMessage('2FA disabled');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handlePublicUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await profile.updatePublic(publicEnabled ? publicUsername || null : null, publicEnabled);
      setMessage('Profile updated');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (type: string) => {
    setLoading(true);
    try {
      const res = await reminders.create(type, 7);
      setReminderList((prev) => [...prev, { id: res.id, type: res.type, due_date: res.due_date }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReminder = async (id: number) => {
    await reminders.delete(id);
    setReminderList((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {message && (
        <div className="p-3 rounded bg-[#00ff88]/20 text-[#00ff88] text-sm">{message}</div>
      )}

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
        <h2 className="font-semibold mb-4">Two-Factor Authentication (2FA)</h2>
        {user?.totp_enabled ? (
          <form onSubmit={handleDisable2FA} className="space-y-4">
            <p className="text-[#00ff88] text-sm">2FA is enabled.</p>
            <input
              type="text"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code to disable"
              className="w-full max-w-xs px-4 py-2 rounded bg-[#0d1117] border border-[#30363d] text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-[#ff3366]/20 text-[#ff3366] hover:bg-[#ff3366]/30"
            >
              Disable 2FA
            </button>
          </form>
        ) : twoFAStep === 'qr' ? (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <p className="text-sm text-[#8b949e]">Scan with your authenticator app:</p>
            <img src={qrCode} alt="QR Code" className="w-48 h-48 bg-white rounded p-2" />
            <input
              type="text"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="w-full max-w-xs px-4 py-2 rounded bg-[#0d1117] border border-[#30363d] text-white"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={loading || twoFACode.length !== 6} className="px-4 py-2 rounded bg-[#00ffcc] text-[#0d1117]">
                Verify & Enable
              </button>
              <button type="button" onClick={() => setTwoFAStep('idle')} className="px-4 py-2 text-[#8b949e]">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button onClick={handleSetup2FA} disabled={loading} className="px-4 py-2 rounded bg-[#00ffcc] text-[#0d1117]">
            Enable 2FA
          </button>
        )}
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
        <h2 className="font-semibold mb-4">Public Profile</h2>
        <p className="text-sm text-[#8b949e] mb-4">
          Share your security score at /score/username
        </p>
        <form onSubmit={handlePublicUpdate} className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={publicEnabled}
              onChange={(e) => setPublicEnabled(e.target.checked)}
              className="accent-[#00ffcc]"
            />
            Enable public profile
          </label>
          {publicEnabled && (
            <input
              type="text"
              value={publicUsername}
              onChange={(e) => setPublicUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
              placeholder="username"
              className="w-full max-w-xs px-4 py-2 rounded bg-[#0d1117] border border-[#30363d] text-white"
            />
          )}
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-[#00ffcc] text-[#0d1117]">
            Save
          </button>
        </form>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
        <h2 className="font-semibold mb-4">Security Reminders</h2>
        <p className="text-sm text-[#8b949e] mb-4">
          Get reminded to run security checks
        </p>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleAddReminder('breach_check')}
            disabled={loading}
            className="px-4 py-2 rounded bg-[#00ffcc] text-[#0d1117] text-sm"
          >
            + Remind me to check breaches (7 days)
          </button>
          <button
            onClick={() => handleAddReminder('password_rotate')}
            disabled={loading}
            className="px-4 py-2 rounded bg-[#00ffcc] text-[#0d1117] text-sm"
          >
            + Remind me to rotate passwords
          </button>
        </div>
        <ul className="space-y-2">
          {reminderList.map((r) => (
            <li key={r.id} className="flex justify-between items-center text-sm">
              <span>{r.type.replace('_', ' ')} - due {new Date(r.due_date).toLocaleDateString()}</span>
              <button onClick={() => handleDeleteReminder(r.id)} className="text-[#ff3366] hover:underline">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
