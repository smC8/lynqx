// Lynqx Console — icon set (monoline, 1.5px stroke, currentColor)
// Following the design-system rule: stroke="currentColor", round caps/joins.

const Ic = ({ children, size = 16, className = '', strokeWidth = 1.5, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

const Icon = {
  Home:        (p) => <Ic {...p}><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v10h14V10"/></Ic>,
  Grid:        (p) => <Ic {...p}><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/></Ic>,
  Bank:        (p) => <Ic {...p}><path d="M3 10L12 4l9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8"/><path d="M3 20h18"/></Ic>,
  Link:        (p) => <Ic {...p}><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></Ic>,
  Code:        (p) => <Ic {...p}><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></Ic>,
  Key:         (p) => <Ic {...p}><circle cx="8" cy="14" r="4"/><path d="M11 12l9-9M16 8l3 3"/></Ic>,
  Settings:    (p) => <Ic {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Ic>,
  Users:       (p) => <Ic {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ic>,
  User:        (p) => <Ic {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></Ic>,
  Activity:    (p) => <Ic {...p}><path d="M22 12h-4l-3 9-6-18-3 9H2"/></Ic>,
  Bell:        (p) => <Ic {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></Ic>,
  Search:      (p) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Ic>,
  Plus:        (p) => <Ic {...p}><path d="M12 5v14M5 12h14"/></Ic>,
  ArrowRight:  (p) => <Ic {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Ic>,
  ArrowUp:     (p) => <Ic {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Ic>,
  ArrowDown:   (p) => <Ic {...p}><path d="M12 5v14M5 12l7 7 7-7"/></Ic>,
  Chevron:     (p) => <Ic {...p}><path d="M9 6l6 6-6 6"/></Ic>,
  ChevronDown: (p) => <Ic {...p}><path d="M6 9l6 6 6-6"/></Ic>,
  Check:       (p) => <Ic {...p}><path d="M20 6L9 17l-5-5"/></Ic>,
  X:           (p) => <Ic {...p}><path d="M18 6L6 18M6 6l12 12"/></Ic>,
  Copy:        (p) => <Ic {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></Ic>,
  Eye:         (p) => <Ic {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Ic>,
  EyeOff:      (p) => <Ic {...p}><path d="M3 3l18 18"/><path d="M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a14 14 0 0 1-3.2 4"/><path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3.1-.3 4.4-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></Ic>,
  Refresh:     (p) => <Ic {...p}><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v6h-6"/></Ic>,
  Filter:      (p) => <Ic {...p}><path d="M3 5h18M6 12h12M10 19h4"/></Ic>,
  Download:    (p) => <Ic {...p}><path d="M12 4v12M6 14l6 6 6-6M4 22h16"/></Ic>,
  Upload:      (p) => <Ic {...p}><path d="M12 20V8M6 10l6-6 6 6M4 22h16"/></Ic>,
  Sparkle:     (p) => <Ic {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></Ic>,
  Layers:      (p) => <Ic {...p}><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 14l9 5 9-5"/></Ic>,
  Bolt:        (p) => <Ic {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></Ic>,
  Logs:        (p) => <Ic {...p}><path d="M4 5h16M4 12h16M4 19h10"/></Ic>,
  Globe:       (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></Ic>,
  Shield:      (p) => <Ic {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></Ic>,
  Doc:         (p) => <Ic {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 13h6M9 17h4"/></Ic>,
  Webhook:     (p) => <Ic {...p}><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="12" cy="6" r="3"/><path d="M8.5 16l3-7M15.5 16l-3-7"/></Ic>,
  Plug:        (p) => <Ic {...p}><path d="M9 2v6M15 2v6M5 8h14v3a7 7 0 0 1-14 0V8zM12 18v4"/></Ic>,
  Building:    (p) => <Ic {...p}><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/></Ic>,
  TrendUp:     (p) => <Ic {...p}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></Ic>,
  Calendar:    (p) => <Ic {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></Ic>,
  Clock:       (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ic>,
  Logo:        (p) => <Ic {...p}><rect x="11" y="3" width="3" height="18" fill="currentColor" stroke="none"/></Ic>,
  Help:        (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></Ic>,
  Send:        (p) => <Ic {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></Ic>,
  External:    (p) => <Ic {...p}><path d="M14 4h6v6M20 4l-10 10M10 6H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/></Ic>,
  Lock:        (p) => <Ic {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Ic>,
  Sun:         (p) => <Ic {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Ic>,
  Moon:        (p) => <Ic {...p}><path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/></Ic>,
  Database:    (p) => <Ic {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/></Ic>,
  Branch:      (p) => <Ic {...p}><circle cx="6" cy="3" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M6 5v11M6 16a8 8 0 0 0 8-8h2"/></Ic>,
  Chip:        (p) => <Ic {...p}><rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></Ic>,
  Wallet:      (p) => <Ic {...p}><path d="M3 7a2 2 0 0 1 2-2h13l3 4v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M3 11h18M16 15h2"/></Ic>,
  Bookmark:    (p) => <Ic {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></Ic>,
  Dot:         (p) => <Ic {...p}><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></Ic>,
  Wand:        (p) => <Ic {...p}><path d="M15 4V2M15 10V8M11 6h2M17 6h2M18 13l-2-2 6-6 2 2-6 6zM3 21l11-11"/></Ic>,
  Stop:        (p) => <Ic {...p}><rect x="6" y="6" width="12" height="12" rx="1.5"/></Ic>,
  Play:        (p) => <Ic {...p}><path d="M6 4l14 8-14 8V4z"/></Ic>,
  Diff:        (p) => <Ic {...p}><path d="M12 3v18M5 8h4M5 16h4M15 12h4"/></Ic>,
};

window.Icon = Icon;
