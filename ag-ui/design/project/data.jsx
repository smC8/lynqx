// Sample data for the Lynqx console — believable but sparse.

const SAMPLE_DATA = {
  org: {
    name: 'Indus Treasury',
    slug: 'indus-treasury',
    plan: 'Growth',
    region: 'APAC · India',
  },
  user: {
    name: 'Aarti Khanna',
    role: 'Treasury operations',
    email: 'aarti@indus.co',
    initials: 'AK',
  },
  workspaces: [
    { id: 'exec', label: 'Indus Treasury',  sub: 'Corporate · Executive',     icon: 'Building', color: '#9FE870' },
    { id: 'bank', label: 'HDFC · Lynqx Hub', sub: 'Bank · Customer console',  icon: 'Bank',     color: '#C0C8FF' },
    { id: 'dev',  label: 'Lattice Pay',      sub: 'Developer · Sandbox',      icon: 'Code',     color: '#D0D0F8' },
  ],
  // ─────────── EXECUTIVE: marketplace, account-link, settings ──────────────
  marketplace: {
    categories: ['All', 'Banking', 'ERP', 'Treasury', 'Analytics', 'Compliance'],
    featured: [
      { id: 'hdfc',   name: 'HDFC Bank',    cat: 'Banking', desc: 'Direct host-to-host integration. Statements, payments, virtual accounts.', logo: 'H', color: '#004C8F', status: 'connected', region: 'India',   accounts: 4, since: '2024-09' },
      { id: 'sap',    name: 'SAP S/4HANA',  cat: 'ERP',     desc: 'Bidirectional sync — payments, postings, BAI/MT940 statements.',          logo: 'S', color: '#0FAAFF', status: 'connected', region: 'Global',  accounts: 1, since: '2024-08' },
      { id: 'citi',   name: 'Citi',         cat: 'Banking', desc: 'Cross-border SWIFT, FX, and account verification across 12 markets.',     logo: 'C', color: '#003DA5', status: 'available', region: 'Global',  accounts: 0 },
      { id: 'kyriba', name: 'Kyriba',       cat: 'Treasury',desc: 'Cash positioning, payment factory, in-house bank.',                       logo: 'K', color: '#1F8A5B', status: 'connected', region: 'Global',  accounts: 1, since: '2025-01' },
      { id: 'icici',  name: 'ICICI Bank',   cat: 'Banking', desc: 'Real-time balances, IMPS/NEFT/RTGS, virtual collections.',                logo: 'I', color: '#B02A30', status: 'pending',   region: 'India',   accounts: 0 },
      { id: 'dbs',    name: 'DBS Bank',     cat: 'Banking', desc: 'IDEAL Connect APIs across 6 ASEAN markets.',                              logo: 'D', color: '#E3001A', status: 'available', region: 'ASEAN',   accounts: 0 },
      { id: 'oracle', name: 'Oracle Fusion',cat: 'ERP',     desc: 'Payments-out, statement reconciliation, supplier verification.',          logo: 'O', color: '#C74634', status: 'available', region: 'Global',  accounts: 0 },
      { id: 'sbi',    name: 'State Bank',   cat: 'Banking', desc: 'High-volume corporate channels, statement feeds, host-to-host.',          logo: 'S', color: '#22409A', status: 'available', region: 'India',   accounts: 0 },
      { id: 'netsuite', name: 'NetSuite',   cat: 'ERP',     desc: 'Bank feeds, AP automation, multi-entity consolidation.',                  logo: 'N', color: '#125B96', status: 'available', region: 'Global',  accounts: 0 },
    ],
  },
  bankFlow: {
    catalogue: [
      { id: 'hdfc',  name: 'HDFC Bank',     country: 'IN', products: ['Statements','Payments','Virtual accounts'] },
      { id: 'icici', name: 'ICICI Bank',    country: 'IN', products: ['Statements','Payments'] },
      { id: 'axis',  name: 'Axis Bank',     country: 'IN', products: ['Statements','Payments','Collections'] },
      { id: 'sbi',   name: 'State Bank',    country: 'IN', products: ['Statements','Payments'] },
      { id: 'citi',  name: 'Citi',          country: 'GL', products: ['Statements','SWIFT','FX'] },
      { id: 'dbs',   name: 'DBS',           country: 'SG', products: ['Statements','Payments','Virtual accounts'] },
      { id: 'kotak', name: 'Kotak',         country: 'IN', products: ['Statements','Payments'] },
      { id: 'yes',   name: 'Yes Bank',      country: 'IN', products: ['Statements','Payments'] },
    ],
  },
  // ─────────── BANK: customer usage ────────────────────────────────────────
  bank: {
    name: 'HDFC Bank',
    customers: [
      { id: 'c1', name: 'Indus Treasury',    accounts: 4, calls: 184_502, vol: '$24.6M', err: 0.04, plan: 'Growth',     status: 'active'  },
      { id: 'c2', name: 'Voltaire Logistics',accounts: 7, calls:  94_280, vol: '$12.1M', err: 0.18, plan: 'Scale',      status: 'active'  },
      { id: 'c3', name: 'Norden Pharma',     accounts: 3, calls:  56_120, vol: '$ 8.4M', err: 0.07, plan: 'Growth',     status: 'active'  },
      { id: 'c4', name: 'Bharat Foods',      accounts: 2, calls:  21_944, vol: '$ 3.0M', err: 0.61, plan: 'Starter',    status: 'warn'    },
      { id: 'c5', name: 'Lattice Pay',       accounts: 9, calls: 312_088, vol: '$48.2M', err: 0.02, plan: 'Enterprise', status: 'active'  },
      { id: 'c6', name: 'Saffron Capital',   accounts: 1, calls:   4_211, vol: '$0.4M',  err: 0.00, plan: 'Starter',    status: 'idle'    },
    ],
  },
  // ─────────── DEV: api keys, logs ─────────────────────────────────────────
  dev: {
    apiKeys: [
      { id: 'k1', label: 'production',   prefix: 'sk_live_AfX2',  masked: '••••••••••••', created: '2024-08-12', lastUsed: '4 min ago',  scope: ['payments','statements','accounts'] },
      { id: 'k2', label: 'staging',      prefix: 'sk_test_Tq07',  masked: '••••••••••••', created: '2024-08-12', lastUsed: '2 hours ago',scope: ['payments','statements','accounts','sandbox'] },
      { id: 'k3', label: 'analytics-bot',prefix: 'sk_live_Bn4L',  masked: '••••••••••••', created: '2025-02-04', lastUsed: '1 day ago',  scope: ['statements'] },
    ],
    webhooks: [
      { url: 'https://api.lattice.pay/lynqx/events', events: 12, status: 'healthy',   p95: '142ms' },
      { url: 'https://ops.lattice.pay/recon',         events:  4, status: 'degraded',  p95: '892ms' },
    ],
    logs: [
      { time: '14:02:11', method: 'POST', path: '/v1/payments',                status: 200, ms:  87, env: 'live' },
      { time: '14:02:08', method: 'GET',  path: '/v1/accounts/acc_8821/balance',status: 200, ms:  44, env: 'live' },
      { time: '14:01:59', method: 'POST', path: '/v1/statements/fetch',         status: 202, ms: 121, env: 'live' },
      { time: '14:01:53', method: 'POST', path: '/v1/payments',                status: 422, ms:  19, env: 'test' },
      { time: '14:01:47', method: 'GET',  path: '/v1/accounts/acc_5510/txns',   status: 200, ms:  62, env: 'live' },
      { time: '14:01:42', method: 'GET',  path: '/v1/banks',                    status: 200, ms:  18, env: 'live' },
      { time: '14:01:37', method: 'POST', path: '/v1/payments/p_77a/cancel',    status: 200, ms:  91, env: 'live' },
      { time: '14:01:30', method: 'GET',  path: '/v1/accounts/acc_8821/balance',status: 200, ms:  41, env: 'live' },
      { time: '14:01:24', method: 'POST', path: '/v1/statements/fetch',         status: 200, ms: 156, env: 'live' },
      { time: '14:01:18', method: 'GET',  path: '/v1/webhooks/health',          status: 200, ms:   9, env: 'live' },
    ],
  },
  // ─────────── Activity feed (universal) ───────────────────────────────────
  activity: [
    { id:1, mono: 'SAP → HDFC',                   text: 'Payment file accepted',   tag: 'live', time: '2m', value: '₹84,20,000' },
    { id:2, mono: 'HDFC ← Lynqx',                 text: 'Statement MT940 fetched', tag: 'ok',   time: '7m', value: '128 lines' },
    { id:3, mono: 'Webhook · payments.settled',   text: 'Delivered to Lattice Pay',tag: 'ok',   time: '11m',value: 'p_77a8' },
    { id:4, mono: 'Citi · acct verification',     text: 'API quota at 78%',        tag: 'warn', time: '1h', value: '7,820 / 10k' },
    { id:5, mono: 'Kyriba ↔ Lynqx',               text: 'Cash position sync',      tag: 'ok',   time: '2h', value: '12 entities' },
  ],
  // KPI sparkline data (small)
  spark: {
    apiCalls:  [12, 14, 13, 18, 22, 19, 24, 21, 28, 32, 29, 36, 41, 39, 44],
    volume:    [ 8, 12,  9, 14, 18, 16, 22, 25, 23, 28, 30, 27, 33, 34, 38],
    errors:    [ 4,  3,  5,  3,  2,  4,  3,  2,  3,  2,  2,  1,  2,  1,  2],
    uptime:    Array.from({length: 30}, (_,i) => 99 + Math.sin(i/3)*0.4),
  }
};

window.SAMPLE_DATA = SAMPLE_DATA;

// ── Marketplace integration metadata (shared by detail drawer) ───────────
const _DEFAULT_META = {
  vendor: 'Lynqx Integrations',
  long: 'Direct, certified connection. Statements, payments, and balances flow live; tokens are scoped per environment and rotated on a 90-day policy.',
  setup: '~5 minutes (sandbox) · 1–2 days (live, after bank review)',
  auth: 'OAuth 2.0 + mTLS · token vault held by partner',
  residency: 'Region-pinned · APAC keys never leave Mumbai',
  compliance: ['SOC 2', 'ISO 27001'],
  highlights: [
    'Statements polled every 15 min; pushed to your ERP via webhook',
    'Idempotent payment APIs with sub-200ms p95 in production',
    'Full audit trail — every call signed and replayable',
  ],
  capabilities: [
    { name: 'Real-time balances',  supported: true,  note: 'Sub-second freshness' },
    { name: 'Payments out',         supported: true,  note: 'NEFT, RTGS, IMPS, ACH, SWIFT' },
    { name: 'Statement import',     supported: true,  note: 'MT940, BAI2, camt.053' },
    { name: 'Virtual accounts',     supported: true,  note: 'Per-payer reconciliation' },
    { name: 'FX conversion',        supported: false, note: 'Roadmap · Q3 2025' },
    { name: 'Cheque issuance',      supported: false, note: 'Not exposed by partner' },
  ],
  requirements: [
    { title: 'Active corporate banking agreement', note: 'Lynqx connects on top of your existing relationship — no new contract.' },
    { title: 'Mutual NDA on file',                 note: 'One-time. Lynqx legal will share template.' },
    { title: 'Production allow-list',              note: 'Add Lynqx egress IPs to your bank firewall.' },
    { title: 'Designated approver',                note: 'A treasury admin who can co-sign payments above threshold.' },
  ],
  security: 'End-to-end TLS · keys at rest in HSM · ISO 27001 audited annually.',
  price: 'Included',
  priceNote: 'in your Growth plan · no per-call fee',
  sla: [
    { label: 'Uptime',         value: '99.95%' },
    { label: 'p95 latency',    value: '< 200ms' },
    { label: 'Support',        value: '24×7 · 1h response' },
    { label: 'Incident report',value: 'Within 24h, post-mortem in 5d' },
  ],
};

window.INTEGRATION_META = {
  _default: _DEFAULT_META,
  hdfc:   { ..._DEFAULT_META, vendor: 'HDFC Bank · Corporate API',  setup: '~5 minutes (sandbox) · 1 day (live)', auth: 'mTLS + Customer ID/API key', residency: 'India · Mumbai',     compliance: ['RBI DPDP', 'SOC 2', 'ISO 27001'] },
  icici:  { ..._DEFAULT_META, vendor: 'ICICI Bank · Connected Banking', auth: 'OAuth 2.0 + mTLS', residency: 'India · Pune', compliance: ['RBI DPDP', 'SOC 2'] },
  citi:   { ..._DEFAULT_META, vendor: 'Citi · CitiConnect', residency: 'Global · per-region pinning', compliance: ['SOC 2', 'ISO 27001', 'PCI DSS'], price: 'Custom', priceNote: 'enterprise quote · contact us' },
  dbs:    { ..._DEFAULT_META, vendor: 'DBS · IDEAL Connect',  residency: 'ASEAN · Singapore', compliance: ['MAS TRM', 'SOC 2'] },
  sap:    { ..._DEFAULT_META, vendor: 'SAP S/4HANA · BTP partner add-on', auth: 'OAuth 2.0 (SAP IdP)', residency: 'Customer-controlled (BTP region)', long: 'Bidirectional connector. Lynqx pushes bank statements as F110 postings and pulls outbound payment proposals via DMEE.', capabilities: [
    { name: 'F110 statement posting', supported: true,  note: 'BAI2 / MT940 → BAPI_BANKACCT_POST' },
    { name: 'DMEE payment export',    supported: true,  note: 'Outbound to NEFT/RTGS/SWIFT' },
    { name: 'Vendor master sync',     supported: true,  note: 'BP role FLVN00' },
    { name: 'In-house cash',          supported: true,  note: 'IHC sub-ledger updates' },
    { name: 'Treasury Mgmt (TRM)',    supported: false, note: 'On roadmap · Q4 2025' },
  ]},
  oracle: { ..._DEFAULT_META, vendor: 'Oracle Fusion · Cash Mgmt',     auth: 'OAuth 2.0 (IDCS)', residency: 'OCI customer region' },
  netsuite:{ ..._DEFAULT_META, vendor: 'NetSuite · Bundle SDK',        auth: 'TBA tokens',       residency: 'Customer datacenter (NA / EU)' },
  kyriba: { ..._DEFAULT_META, vendor: 'Kyriba · Open API',             setup: '~10 minutes', residency: 'AWS · multi-region', long: 'Two-way cash positioning, payment factory, and in-house bank flows. Lynqx posts intraday balances and accepts payment runs.', highlights: [
    'Cash position refreshes every 60s across entities',
    'Payment factory submits via Kyriba Run, signs in Lynqx',
    'Bank confirmations route back as Kyriba notes',
  ]},
  sbi:    { ..._DEFAULT_META, vendor: 'State Bank · CINB Pro',         residency: 'India · Hyderabad', compliance: ['RBI DPDP', 'SOC 2'] },
};

window.INTEGRATION_ACCOUNTS = (item) => {
  const seed = item.id.charCodeAt(0);
  const labels = item.cat === 'ERP' ? ['Production tenant', 'Sandbox tenant'] : ['Operating', 'Payroll', 'Collections', 'Treasury'];
  return Array.from({ length: Math.min(item.accounts || 1, 4) }, (_, i) => ({
    label: labels[i % labels.length],
    num: '****' + ((seed * 41 + i * 137) % 9000 + 1000),
    products: item.cat === 'ERP' ? ['Payments out', 'Statements'] : ['Statements', 'Payments', 'Virtual accts'].slice(0, 1 + ((seed + i) % 3)),
  }));
};
