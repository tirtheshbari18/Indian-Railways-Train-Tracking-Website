import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Train, Lock, Mail, User, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please fill all required fields", "warning");
      return;
    }
    setSubmitting(true);
    try {
      await register({ email, password, full_name: fullName });
      toast("Account registered successfully! Welcome to RailTrack.", "success");
      navigate('/profile');
    } catch (err: any) {
      toast(err.response?.data?.detail || "Registration failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-railway-navy to-blue-600 flex items-center justify-center text-white mx-auto shadow-md mb-4">
            <Train className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Passenger Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Save frequent train routes, monitor live platform updates, and manage favourites.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-railway-navy focus:outline-none"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

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
                placeholder="passenger@example.com"
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
                placeholder="Create a strong password"
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
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Already registered? </span>
          <Link to="/login" className="font-bold text-railway-navy hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
