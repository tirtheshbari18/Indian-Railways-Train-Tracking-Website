import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Train, Lock, Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please fill all fields", "warning");
      return;
    }
    setSubmitting(true);
    try {
      await login({ email, password });
      toast("Successfully signed in", "success");
      navigate('/profile');
    } catch (err: any) {
      toast(err.response?.data?.detail || "Invalid email or password", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@railtrack.gov.in');
      setPassword('admin123');
    } else {
      setEmail('passenger@railtrack.gov.in');
      setPassword('passenger123');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-railway-navy to-blue-600 flex items-center justify-center text-white mx-auto shadow-md mb-4">
            <Train className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to RailTrack
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access favourite trains, personalized alerts, and operational controls.
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
          <span className="font-bold text-slate-700 block mb-2 text-center text-[11px] uppercase tracking-wider">
            Quick Fill Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('user')}
              className="py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-slate-700 font-semibold text-[11px] transition-colors"
            >
              Passenger User
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="py-1.5 px-2.5 rounded-lg bg-railway-navy/10 border border-railway-navy/20 hover:border-railway-navy text-railway-navy font-bold text-[11px] transition-colors"
            >
              System Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@railtrack.gov.in"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-railway-navy focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-railway-navy focus:outline-none font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-railway-navy hover:bg-railway-blue text-white rounded-xl text-sm font-bold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In Securely</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-railway-navy hover:underline">
            Register for free
          </Link>
        </div>
      </div>
    </div>
  );
};
