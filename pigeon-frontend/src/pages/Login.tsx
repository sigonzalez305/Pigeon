import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { PicoSprite } from '../components/pigeon/PicoSprite';
import { DEMO_MODE } from '../config';

const DEMO_ACCOUNTS = [
  { name: 'Alice', city: 'Washington, DC', phone: '+12025550111' },
  { name: 'Bob', city: 'Miami, FL', phone: '+13055550178' },
  { name: 'Charlie', city: 'San Francisco, CA', phone: '+14155550142' },
];

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuthStore();

  const quickLogin = async (demoPhone: string) => {
    setError('');
    setLoading(true);
    try {
      await login(demoPhone, 'password');
      navigate('/home');
    } catch {
      setError('That demo account could not be opened.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(phone, password, displayName);
      } else {
        await login(phone, password);
      }
      navigate('/home');
    } catch (err: any) {
      const data = err.response?.data;
      setError(typeof data === 'string' ? data : data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, var(--slate-dusk), var(--coop-char) 60%, var(--slate-dusk))' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <PicoSprite animation="idle" size={132} className="mx-auto" />
          <h1 className="text-4xl font-semibold mb-2" style={{ color: 'var(--wheat)' }}>Pigeon</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Messages worth the journey</p>
        </div>

        <div className="panel">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 202 555 0111"
                className="field"
                required
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="field"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-sm hover:underline" style={{ color: 'var(--petrol)' }}
            >
              {isRegister
                ? 'Already have an account? Login'
                : "Don't have an account? Register"}
            </button>
          </div>

          {!isRegister && (
            <div className="mt-6 p-4 rounded-lg text-sm" style={{ background: 'var(--surface-soft)', border: '1px solid var(--border-subtle)' }}>
              <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                {DEMO_MODE ? 'Demo accounts. Tap one to sign in.' : 'Demo accounts (password: password)'}
              </p>
              <div className="grid gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.phone}
                    type="button"
                    disabled={loading}
                    onClick={() => quickLogin(account.phone)}
                    className="flex min-h-[44px] items-center justify-between rounded-lg border px-3 text-left"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--wheat)' }}
                  >
                    <span className="font-medium">{account.name}</span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{account.city}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
