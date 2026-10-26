export const theme = {
  bg: {
    base: '#f6f8fa',       // GitHub chrome / rail / header
    surface: '#ffffff',    // True crisp white content surface
    chrome: '#f6f8fa',     // Panel chrome & sidebars
    subtle: '#f6f8fa',     // Hover / subtle container
    active: '#eaeef2',     // Active row / item
    diffAdd: '#e6ffec',    // GitHub diff addition light green
    diffAddNum: '#ccffd8', // Gutter line number addition green
    diffDel: '#ffebe9',    // GitHub diff deletion light red
    diffDelNum: '#ffd7d5', // Gutter line number deletion red
    diffHunk: '#f6f8fa'    // Diff range hunk background
  },
  border: {
    default: '#d0d7de',    // Standard crisp 1px GitHub border
    subtle: '#e1e4e8',     // Hairline separator
    dark: '#8c959f',       // Hover / focused border
    diffAdd: '#b4f0c0',
    diffDel: '#ffd0cc'
  },
  text: {
    primary: '#1f2328',    // GitHub primary charcoal text
    secondary: '#59636e',  // Medium slate gray
    muted: '#656d76',      // Small letter-spaced labels
    faint: '#8c959f',
    green: '#1a7f37',      // GitHub diff green
    red: '#cf222e'         // Oxblood stall alert / deletion red
  },
  accent: {
    green: '#1a7f37',      // Primary serious accent: deep green
    red: '#cf222e',        // Oxblood stall / error red
    slate: '#24292f'       // Neutral deep slate
  }
};
