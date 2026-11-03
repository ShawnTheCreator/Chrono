'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../src/auth/authClient';

const HOME_URL = process.env.NEXT_PUBLIC_HOME_URL || 'http://localhost:3000';

// Official Meta Infinity Vector Logo
const MetaLogo = ({ width = 24, height = 16 }: { width?: number; height?: number }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 256 170"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <defs>
      <linearGradient id="metaGradA" x1="54.315%" x2="54.315%" y1="82.782%" y2="39.307%">
        <stop offset="0%" stopColor="#0082FB" />
        <stop offset="100%" stopColor="#0064E0" />
      </linearGradient>
      <linearGradient id="metaGradB" x1="54.315%" x2="54.315%" y1="82.782%" y2="39.307%">
        <stop offset="0%" stopColor="#0082FB" />
        <stop offset="100%" stopColor="#0064E0" />
      </linearGradient>
    </defs>
    <path
      fill="#0081FB"
      d="M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z"
    />
    <path
      fill="url(#metaGradA)"
      d="M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z"
    />
    <path
      fill="url(#metaGradB)"
      d="M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z"
    />
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
      if (email.trim() && password.trim()) {
        const res = await authClient.login(email.trim(), password.trim());
        if (res.success) {
          setSuccessMsg('Authenticated. Logging in...');
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
        // Frictionless instant operator login when submitted
        await authClient.loginAsDemoOperator();
        setSuccessMsg('Operator session authenticated. Logging in...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 300);
      }
    } catch {
      await authClient.loginAsDemoOperator();
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtherLoginOption = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.loginAsDemoOperator();
      setSuccessMsg('Operator session authenticated. Logging in...');
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
    setError('Notice: You can click "Log in" directly to access the Cockpit without credentials.');
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
      padding: 0
    }}>
      <div style={{
        width: '100%',
        maxWidth: '390px',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '52px 28px 28px 28px',
        boxSizing: 'border-box'
      }}>
        {/* Top Header & Form Container */}
        <div>
          {/* Top Brand: Meta Infinity + Meta Business Suite */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '36px'
          }}>
            <MetaLogo width={24} height={16} />
            <span style={{
              fontSize: '17px',
              fontWeight: 600,
              color: '#1c1e21',
              letterSpacing: '-0.01em'
            }}>
              Meta Business Suite
            </span>
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
        </div>

        {/* Bottom Section: Huge Meta Infinity Logo & Chrono Return Link */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '48px',
          paddingBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <MetaLogo width={190} height={126} />

          <div style={{ marginTop: '24px' }}>
            <a
              href={HOME_URL}
              style={{
                fontSize: '12px',
                color: '#8a8d91',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              ← Back to Chrono
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
