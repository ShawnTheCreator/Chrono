'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../src/auth/authClient';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lockoutSec, setLockoutSec] = useState<number | null>(null);

  // Countdown timer for OWASP rate-limit lockout
  useEffect(() => {
    if (lockoutSec === null || lockoutSec <= 0) return;
    const interval = setInterval(() => {
      setLockoutSec((prev) => {
        if (prev === null || prev <= 1) {
          setError(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSec]);

  // Pre-check if already authenticated
  useEffect(() => {
    authClient.checkSession().then((res) => {
      if (res.authenticated) {
        router.push('/');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSec && lockoutSec > 0) return;

    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await authClient.login(email, password);
        if (res.success) {
          setSuccessMsg('Authenticated. Launching Chrono Cockpit...');
          setTimeout(() => {
            router.push('/');
          }, 400);
        } else {
          setError(res.error || 'Authentication failed');
          if (res.locked && res.retry_after) {
            setLockoutSec(res.retry_after);
          }
        }
      } else {
        const res = await authClient.signup(email, password);
        if (res.success) {
          setSuccessMsg('Account securely registered. Launching Chrono Cockpit...');
          setTimeout(() => {
            router.push('/');
          }, 400);
        } else {
          setError(res.error || 'Sign up failed');
        }
      }
    } catch {
      setError('An unexpected security verification error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSO = async (provider: 'google' | 'apple' | 'binance' | 'wallet') => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authClient.loginWithSSO(provider);
      if (res.success) {
        setSuccessMsg(`Authenticated via ${provider}. Launching Chrono Cockpit...`);
        setTimeout(() => {
          router.push('/');
        }, 400);
      } else {
        setError(res.error || `SSO login with ${provider} failed`);
      }
    } catch {
      setError(`Cannot complete SSO authentication with ${provider}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofillDemo = () => {
    setEmail('admin@chrono.sec');
    setPassword('ChronoSecure2026!');
    setError(null);
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      backgroundColor: '#f8fafc',
      backgroundImage: `
        linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
      `,
      backgroundSize: '36px 36px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden'
      }}>
        {/* Main Card Body */}
        <div style={{ padding: '32px 32px 28px 32px' }}>
          
          {/* Segmented Mode Switcher: Login / Sign Up */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              background: '#f1f5f9',
              borderRadius: '8px',
              padding: '3px',
              gap: '2px'
            }}>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: mode === 'login' ? 600 : 500,
                  color: mode === 'login' ? '#0f172a' : '#64748b',
                  backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
                  boxShadow: mode === 'login' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Login Door Icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Login</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: mode === 'signup' ? 600 : 500,
                  color: mode === 'signup' ? '#0f172a' : '#64748b',
                  backgroundColor: mode === 'signup' ? '#ffffff' : 'transparent',
                  boxShadow: mode === 'signup' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Sign Up / User Plus Icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                <span>Sign Up</span>
              </button>
            </div>
          </div>

          {/* OWASP Security Notice / Error Banner */}
          {error && (
            <div style={{
              marginBottom: '18px',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '12px',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <span style={{ fontWeight: 600 }}>{lockoutSec ? 'OWASP Rate Limit Lockout' : 'Security Alert'}: </span>
                {error}
                {lockoutSec && lockoutSec > 0 && (
                  <div style={{ marginTop: '4px', fontWeight: 600, color: '#b91c1c' }}>
                    Throttled for: {lockoutSec}s remaining
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div style={{
              marginBottom: '18px',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Email Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#334155',
                marginBottom: '6px'
              }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#334155'
                }}>
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link dispatched to verified identity.')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#0f172a',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 40px 0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    /* Eye Off */
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    /* Eye */
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials Autofill Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#64748b',
              marginTop: '2px'
            }}>
              <span>Demo: <strong style={{ color: '#0f172a' }}>admin@chrono.sec</strong></span>
              <button
                type="button"
                onClick={handleAutofillDemo}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                Auto-fill
              </button>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (lockoutSec !== null && lockoutSec > 0)}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: (lockoutSec && lockoutSec > 0) ? '#94a3b8' : '#09090b',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: (lockoutSec && lockoutSec > 0 || isLoading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
                transition: 'background-color 0.15s ease'
              }}
            >
              {isLoading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Log In' : 'Sign Up'}</span>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '20px 0 16px 0',
            gap: '12px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase' }}>
              OR
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {/* SSO Provider Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            {/* 1. Continue with Google */}
            <button
              type="button"
              onClick={() => handleSSO('google')}
              disabled={isLoading}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              {/* Google G Logo */}
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.66-5.2 3.66-9.12z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.44 7.35 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.56 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* 2. Continue with Apple */}
            <button
              type="button"
              onClick={() => handleSSO('apple')}
              disabled={isLoading}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              {/* Apple Logo */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#000000">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.13.64-2.81 1.44-.61.7-1.14 1.83-1 2.95 1.07.08 2.16-.54 2.82-1.29z" />
              </svg>
              <span>Continue with Apple</span>
            </button>

            {/* 3. Continue with Binance */}
            <button
              type="button"
              onClick={() => handleSSO('binance')}
              disabled={isLoading}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              {/* Binance Yellow Diamond Icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#F3BA2F">
                <path d="M12 0l-3.35 3.35 7.6 7.6 3.35-3.35L12 0zm-7.6 7.6L1.05 10.95 4.4 14.3l3.35-3.35L4.4 7.6zm15.2 0l-3.35 3.35 3.35 3.35 3.35-3.35L19.6 7.6zM12 8.7L8.65 12.05 12 15.4l3.35-3.35L12 8.7zm-7.6 8.9l3.35 3.35L12 24l3.35-3.05-7.6-7.6-3.35 3.35z" />
              </svg>
              <span>Continue with Binance</span>
            </button>

            {/* 4. Continue with Wallet */}
            <button
              type="button"
              onClick={() => handleSSO('wallet')}
              disabled={isLoading}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              {/* Web3 Wallet Icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M7 15h.01" />
                <rect x="16" y="9" width="6" height="6" rx="1" />
              </svg>
              <span>Continue with Wallet</span>
            </button>

          </div>
        </div>

        {/* Card Footer: Toggle Link */}
        <div style={{
          backgroundColor: '#fafafa',
          borderTop: '1px solid #f1f5f9',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#64748b'
        }}>
          {mode === 'login' ? (
            <span>
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Log in
              </button>
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
