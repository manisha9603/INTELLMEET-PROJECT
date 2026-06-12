import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/room/alpha-v8');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server se connect nahi ho pa raha!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-3xl p-8 shadow-2xl relative z-10">
        <h2 className="text-3xl font-black text-zinc-950 mb-2 text-center tracking-tight">Welcome Back</h2>
        <p className="text-zinc-500 mb-8 flex justify-center text-center">Sign in to IntellMeet to continue</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-accent shadow-sm"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-accent shadow-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white font-bold rounded-xl px-4 py-3 mt-4 hover:bg-accent/90 transition-colors shadow-md shadow-accent/20"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-500 text-sm font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-zinc-900 hover:text-accent font-bold transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}