import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuthStore();

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
      setError(err.response?.data || 'Authentication failed');
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
          <div className="text-6xl mb-4">🕊️</div>
          <h1 className="text-4xl font-semibold mb-2" style={{ color: 'var(--wheat)' }}>Pigeon</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Messenger that flies</p>
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
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Demo accounts:</p>
              <code className="text-xs" style={{ color: 'var(--petrol)' }}>+12025550111 / password</code>
              <br />
              <code className="text-xs" style={{ color: 'var(--petrol)' }}>+13055550178 / password</code>
              <br />
              <code className="text-xs" style={{ color: 'var(--petrol)' }}>+14155550142 / password</code>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
