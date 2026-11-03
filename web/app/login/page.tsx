'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  // Rate-limit countdown timer
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
        router.push('/dashboard');
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
            router.push('/dashboard');
          }, 350);
        } else {
          setError(res.error || 'Authentication failed. Please verify credentials.');
          if (res.locked && res.retry_after) {
            setLockoutSec(res.retry_after);
          }
        }
      } else {
        const res = await authClient.signup(email, password);
        if (res.success) {
          setSuccessMsg('Account registered. Launching Chrono Cockpit...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 350);
        } else {
          setError(res.error || 'Registration failed.');
        }
      }
    } catch {
      setError('An unexpected connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemoAccess = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg('Operator session authenticated. Launching Cockpit...');
    try {
      await authClient.loginAsDemoOperator();
      setTimeout(() => {
        router.push('/dashboard');
      }, 300);
    } catch {
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      backgroundColor: '#f8fafc',
      backgroundImage: `
        linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
      `,
      backgroundSize: '32px 32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden'
      }}>
        {/* Top Accent Bar */}
        <div style={{
          height: '4px',
          width: '100%',
          background: 'linear-gradient(90deg, #1a7f37, #0969da, #8250df)'
        }} />

        <div style={{ padding: '32px 28px' }}>
          {/* Logo & Product Heading */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.12em', color: '#0f172a' }}>
                CHRONO
              </span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#1a7f37', backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>
                FDR-2026
              </span>
            </div>

            <h1 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0'
            }}>
              Flight Recorder Cockpit
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Operator Authentication Gateway
            </p>
          </div>

          {/* Instant Operator Demo Access Pill Button */}
          <div style={{
            marginBottom: '20px',
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                Evaluation Access
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#1a7f37',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1a7f37' }} />
                Ready
              </span>
            </div>

            <button
              type="button"
              onClick={handleInstantDemoAccess}
              disabled={isLoading}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'opacity 0.15s ease'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Enter as Operator (Instant Access)</span>
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '18px 0',
            gap: '12px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              OR SIGN IN WITH WORK CREDENTIALS
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              marginBottom: '16px',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '12px',
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
                <span style={{ fontWeight: 600 }}>{lockoutSec ? 'Rate Limit Lockout: ' : 'Authentication Notice: '}</span>
                {error}
                {lockoutSec && lockoutSec > 0 && (
                  <div style={{ marginTop: '4px', fontWeight: 600, color: '#b91c1c' }}>
                    Retry in: {lockoutSec}s
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div style={{
              marginBottom: '16px',
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

          {/* Sign In / Sign Up Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '5px'
              }}>
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@company.com"
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '5px'
              }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                  Password
                </label>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security credential"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 38px 0 12px',
                    borderRadius: '6px',
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
                    padding: '4px'
                  }}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (lockoutSec !== null && lockoutSec > 0)}
              style={{
                width: '100%',
                height: '38px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (lockoutSec && lockoutSec > 0 || isLoading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px'
              }}
            >
              {isLoading ? 'Authenticating...' : (mode === 'login' ? 'Sign In to Cockpit' : 'Register Operator')}
            </button>
          </form>

          {/* Mode switch & Home link */}
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <div>
              {mode === 'login' ? "Don't have an operator credential? " : "Already registered? "}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0969da',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {mode === 'login' ? 'Register here' : 'Sign in here'}
              </button>
            </div>

            <div style={{ marginTop: '4px' }}>
              <Link
                href="/home"
                style={{
                  color: '#64748b',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 500
                }}
              >
                <span>← Back to Chrono Home Page</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
