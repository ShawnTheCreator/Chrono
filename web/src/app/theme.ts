export const theme = {
  bg: {
    base: '#f1f5f9',       // Clean outer canvas background
    window: '#ffffff',     // Floating app window
    rail: '#f8fafc',       // Far left icon dock
    sidebar: '#ffffff',    // Left file tree & channels sidebar
    surface: '#ffffff',    // Main cards & panels
    elevated: '#f8fafc',   // Elevated subtle boxes
    subtle: '#f1f5f9',     // Section dividers & headers
    activePill: '#eff6ff', // Active selection background (light blue tint)
    diffAdd: '#f0fdf4',    // Soft green addition
    diffDel: '#fef2f2'     // Soft red deletion
  },
  border: {
    subtle: '#e2e8f0',     // Standard panel separator
    hairline: '#f1f5f9',   // Very faint hairline
    focus: '#3b82f6',      // Blue focus outline
    active: '#bfdbfe',     // Light blue border
    card: '#e2e8f0'
  },
  text: {
    primary: '#0f172a',    // Crisp deep slate
    secondary: '#475569',  // Medium slate
    muted: '#94a3b8',      // Soft gray
    faint: '#cbd5e1',      // Inactive / placeholder
    inverse: '#ffffff'     // White text on blue buttons
  },
  accent: {
    blue: '#2563eb',       // Primary vibrant blue
    lightBlue: '#0ea5e9',  // Sky / light blue
    sky: '#38bdf8',        // Bright light blue
    blueTint: '#eff6ff',   // Very light blue pill background
    cyan: '#0284c7',       // Ocean cyan/blue
    emerald: '#10b981',    // Verified green
    amber: '#f59e0b',      // Warning / modifier amber
    ruby: '#ef4444',       // Error / stall red
    violet: '#6366f1'      // Causal reasoning purple/indigo
  },
  shadow: {
    window: '0 25px 50px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05)',
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    popover: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)'
  }
};
