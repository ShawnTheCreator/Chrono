'use client';

import React, { useEffect, useState } from 'react';
import LoginPage from './login/page';
import CockpitDashboard from './dashboard/page';
import { authClient } from '../src/auth/authClient';

export default function RootApp() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    authClient.checkSession().then((res) => {
      setIsAuthenticated(res.authenticated);
    });
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: '"JetBrains Mono", monospace',
        color: '#64748b',
        fontSize: '12px',
        gap: '8px'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a7f37', display: 'inline-block' }} />
        <span>Initializing Chrono Operator Gateway...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <CockpitDashboard />;
  }

  return <LoginPage />;
}
