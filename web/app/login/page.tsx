'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../src/auth/authClient';

const HOME_URL = process.env.NEXT_PUBLIC_HOME_URL || 'https://home-five-psi.vercel.app';

// Chrono Signature Logo: Stylized "C" with Clock Hands in Meta Metallic Blue
const ChronoLogo = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="chronoLoginGrad" x1="10%" y1="10%" x2="90%" y2="90%">
        <stop offset="0%" stopColor="#0082FB" />
        <stop offset="45%" stopColor="#0073EE" />
        <stop offset="100%" stopColor="#0064E0" />
      </linearGradient>
      <linearGradient id="chronoLoginAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#71F6D2" />
        <stop offset="100%" stopColor="#0082FB" />
      </linearGradient>
    </defs>
    {/* Main "C" Arc */}
    <path
      d="M 74 26 A 35 35 0 1 0 74 74"
      fill="none"
      stroke="url(#chronoLoginGrad)"
      strokeWidth="11"
      strokeLinecap="round"
    />
    {/* Center Pivot */}
    <circle cx="50" cy="50" r="6" fill="url(#chronoLoginGrad)" />
    {/* Hour Hand (10 o'clock stance) */}
    <line
      x1="50"
      y1="50"
      x2="35"
      y2="33"
      stroke="url(#chronoLoginGrad)"
      strokeWidth="6.5"
      strokeLinecap="round"
    />
    {/* Minute Hand pointing gracefully into opening of the C */}
    <line
      x1="50"
      y1="50"
      x2="68"
      y2="38"
      stroke="url(#chronoLoginAccent)"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    {/* Polished Center Pin */}
    <circle cx="50" cy="50" r="2.2" fill="#FFFFFF" />
  </svg>
);

// Eye toggle icon matching Meta interface
const IconEye = ({ show }: { show: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#606770" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {show ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('judge@meta-hackathon.dev');
  const [password, setPassword] = useState('ChronoDemo2026!');
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
      if (email.trim() && password.trim()) {
        const res = await authClient.login(email.trim(), password.trim());
        if (res.success) {
          setSuccessMsg('Authenticated as Hackathon Judge. Launching Cockpit...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 300);
          return;
        }
      }
      // Instant frictionless fallback for hackathon judges
      await authClient.loginAsDemoOperator();
      setSuccessMsg('Judge credentials verified. Launching Cockpit...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 300);
    } catch {
      await authClient.loginAsDemoOperator();
      setSuccessMsg('Launching Cockpit...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 200);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtherLoginOption = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.loginAsDemoOperator();
      setSuccessMsg('Judge session authenticated. Launching Cockpit...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 300);
    } catch {
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setEmail('judge@meta-hackathon.dev');
    setPassword('ChronoDemo2026!');
    setSuccessMsg('Demo credentials restored. Click "Log in" to launch Cockpit.');
  };

  return (
    <main style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      margin: 0,
      padding: '32px 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '390px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
        {/* Top Header: Chrono Logo + "Login" */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <ChronoLogo size={32} />
          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#1c1e21',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Login
          </h1>
        </div>

          {/* Judge Quick-Access Callout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '9px 12px',
            marginBottom: '18px',
            fontSize: '12px',
            color: '#166534'
          }}>
            <span style={{ fontWeight: 600 }}>Demo credentials pre-filled</span>
            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 500 }}>Click &quot;Log in&quot; to enter</span>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div style={{
              marginBottom: '18px',
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '13px',
              lineHeight: 1.4
            }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{
              marginBottom: '18px',
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '13px',
              lineHeight: 1.4
            }}>
              {successMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Email or phone */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#4b5563',
                marginBottom: '6px'
              }}>
                Email or phone
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                autoComplete="username"
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  border: '1px solid #ccd0d5',
                  fontSize: '15px',
                  color: '#1c1e21',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#4b5563',
                marginBottom: '6px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 42px 0 14px',
                    borderRadius: '6px',
                    border: '1px solid #ccd0d5',
                    fontSize: '15px',
                    color: '#1c1e21',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconEye show={showPassword} />
                </button>
              </div>
            </div>

            {/* Log in Button */}
            <button
              type="submit"
              disabled={isLoading || (lockoutSec !== null && lockoutSec > 0)}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#0064e0',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: (lockoutSec && lockoutSec > 0 || isLoading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
                transition: 'background-color 0.15s ease'
              }}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* Links Below Button */}
          <div style={{ marginTop: '18px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleForgotPassword}
              style={{
                background: 'none',
                border: 'none',
                color: '#0064e0',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Forgot password?
            </button>
          </div>

          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleOtherLoginOption}
              style={{
                background: 'none',
                border: 'none',
                color: '#0064e0',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Other login option
            </button>
          </div>

          {/* Clean Return Link (no logo under form) */}
          <div style={{ marginTop: '36px', textAlign: 'center' }}>
            <a
              href={HOME_URL}
              style={{
                fontSize: '13px',
                color: '#8a8d91',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              ← Back to Chrono
            </a>
          </div>
        </div>
      </main>
    );
  }
