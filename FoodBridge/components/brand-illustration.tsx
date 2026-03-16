export function BrandIllustration() {
  return (
    <svg viewBox="0 0 640 520" className="h-full w-full">
      <defs>
        <linearGradient id="card" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#f2f8f3" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#4fb36b" />
          <stop offset="100%" stopColor="#ff922b" />
        </linearGradient>
      </defs>
      <rect x="88" y="74" width="464" height="320" rx="38" fill="url(#card)" />
      <rect x="118" y="104" width="196" height="102" rx="28" fill="#ecfdf3" />
      <rect x="326" y="104" width="194" height="152" rx="28" fill="#fff7ed" />
      <rect x="118" y="224" width="196" height="138" rx="28" fill="#f8fafc" />
      <rect x="326" y="274" width="194" height="88" rx="28" fill="#f0fdf4" />
      <path d="M219 159c20-42 63-42 82 0 14 29-12 73-41 94-29-21-55-65-41-94z" fill="url(#accent)" />
      <path d="M420 142c27 0 48 22 48 49 0 36-48 76-48 76s-48-40-48-76c0-27 22-49 48-49z" fill="#ff922b" fillOpacity="0.82" />
      <circle cx="420" cy="192" r="18" fill="#fff" />
      <path d="M168 289h102" stroke="#cbd5e1" strokeWidth="14" strokeLinecap="round" />
      <path d="M168 325h72" stroke="#cbd5e1" strokeWidth="14" strokeLinecap="round" />
      <path d="M370 316h106" stroke="#86efac" strokeWidth="14" strokeLinecap="round" />
      <path d="M370 346h66" stroke="#bbf7d0" strokeWidth="14" strokeLinecap="round" />
      <circle cx="105" cy="52" r="24" fill="#4fb36b" fillOpacity="0.22" />
      <circle cx="536" cy="448" r="34" fill="#ff922b" fillOpacity="0.18" />
      <path d="M553 89c22 20 38 48 38 77 0 60-57 108-127 108-30 0-58-9-80-24" fill="none" stroke="url(#accent)" strokeWidth="14" strokeLinecap="round" />
    </svg>
  );
}
