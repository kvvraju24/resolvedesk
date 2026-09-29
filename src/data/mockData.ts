import { Ticket, CorrectionItem, ModelBenchmark, CategoryMetric } from '../types';

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: '#RD-4891',
    subject: 'Customer unable to verify two-factor code after SIM swap',
    fullTranscript:
      'Hello, I carried out a carrier SIM swap earlier this afternoon because my old handset was damaged. Now whenever I attempt to authenticate into our organization\'s corporate portal, the OTP SMS code fails to arrive, and the prompt times out saying my device identifier is unrecognized. This is blocking our batch transfer approvals. Please assist immediately or verify our bypass phone.',
    predictedIntent: 'account_security',
    confidence: 0.742,
    status: 'review_needed',
    timeAgo: '4m ago',
    timestamp: 'Today at 14:28:11 UTC',
    customer: {
      name: 'Marcus Vance',
      role: 'FinTech Operations Lead',
      company: 'Acme Corp',
      email: 'marcus.vance@acmecorp.com',
      phone: '+1-555-014-8891',
      tier: 'ENT-TIER-2',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCAy5_IMqQ9YoB8AvU4xBCofCMLBhJ3cQXWYII7_Fe8UVg8YyKo_XMHNofT-stdiC-QoqtlrS__C4FDjlk_hd8r14sf589jf_-6YmH3OENVixltoWevgRuMtHONm_9hS_FrPoQqWDPiKFjURt61t-DkDO-LnPrvmA2IjjEFL2D5Mk7KTIukmvMEWtgVAjd6AiMl8xKrYo6ycJgVf3GJUx4S7U0jY4eQlY8j6MUlUmibF5SaUIJdm1rrjw',
    },
    assignedTeam: 'Tier 2 Auth Squad',
    entities: [
      { label: 'carrier', value: 'SIM Swap' },
      { label: 'channel', value: 'OTP SMS' },
      { label: 'impact', value: 'Blocked Approval' },
    ],
    predictions: [
      { intent: 'account_security', score: 0.742, isTop: true },
      { intent: 'login_troubleshoot', score: 0.185 },
      { intent: 'phone_verification', score: 0.051 },
    ],
    ngrams: [
      { ngram: 'sim swap', weight: 0.82 },
      { ngram: 'two-factor', weight: 0.64 },
      { ngram: 'verify code', weight: 0.49 },
    ],
  },
  {
    id: '#RD-4890',
    subject: 'What is the international wire transaction fee for EUR?',
    fullTranscript:
      'We are scheduling a cross-border liquidity transfer to our European subsidiary in Frankfurt denominated in EUR. Could you confirm whether the standard intermediary correspondent banking surcharge of €15 applies, or if enterprise accounts have waiver provisions?',
    predictedIntent: 'international_fees',
    confidence: 0.96,
    status: 'auto_routed',
    timeAgo: '12m ago',
    timestamp: 'Today at 14:20:04 UTC',
    customer: {
      name: 'Elena Rostova',
      role: 'Treasury Controller',
      company: 'Nordic Logistics AG',
      email: 'elena.rostova@nordiclogistics.de',
      phone: '+49-69-5050-890',
      tier: 'ENT-TIER-1',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAMwFqlZwQVLV34pPb_EQwO66ptI4ciOQhNzGqcDuiyIuBdqdaaNtIdDI-3JR14-UVSGScI6nQqgh41_7R4s6glVW7dw_cgPQSiQugXMgDdyl89ZGaFz8uesfKNA2ty_fgdksbMQ4ss6XvBLXI2Pb5nq3_ek2JypP_zAQV0lKkqKeCZlyZmLBXQjNqR0zsOpSrfF1zZlG8j_KbUe_S5Mb0bWSLdNrDA8ztZtdjbwHQ_EFTisaBDS1q2pQ',
    },
    assignedTeam: 'International Treasury Desk',
    entities: [
      { label: 'currency', value: 'EUR' },
      { label: 'transaction', value: 'Cross-border Wire' },
      { label: 'destination', value: 'Frankfurt' },
    ],
    predictions: [
      { intent: 'international_fees', score: 0.96, isTop: true },
      { intent: 'wire_transfer', score: 0.028 },
      { intent: 'exchange_rate', score: 0.012 },
    ],
    ngrams: [
      { ngram: 'wire transaction fee', weight: 0.91 },
      { ngram: 'international', weight: 0.77 },
      { ngram: 'eur transfer', weight: 0.62 },
    ],
  },
  {
    id: '#RD-4889',
    subject: 'Can you bake me a chocolate cake recipe?',
    fullTranscript:
      'I am looking for a moist chocolate sponge cake recipe with dark cocoa ganache and buttercream frosting. Please include oven temperatures and preparation steps.',
    predictedIntent: 'unsupported_intent',
    confidence: 0.98,
    status: 'ood_rejected',
    timeAgo: '18m ago',
    timestamp: 'Today at 14:14:22 UTC',
    customer: {
      name: 'Guest Inquirer',
      role: 'Public Web User',
      company: 'External Visitor',
      email: 'guest.inquiry@gmail.com',
      phone: '+1-555-019-4889',
      tier: 'PUBLIC-TIER',
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    },
    assignedTeam: 'Deflection / OOD Bot Queue',
    entities: [
      { label: 'domain', value: 'Culinary / Baking' },
      { label: 'detection', value: 'CLINC150 OOS Benchmark' },
    ],
    predictions: [
      { intent: 'unsupported_intent', score: 0.98, isTop: true },
      { intent: 'general_faq', score: 0.015 },
      { intent: 'greeting', score: 0.005 },
    ],
    ngrams: [
      { ngram: 'cake recipe', weight: 0.99 },
      { ngram: 'chocolate sponge', weight: 0.94 },
      { ngram: 'bake', weight: 0.88 },
    ],
  },
  {
    id: '#RD-4888',
    subject: 'Chargeback inquiry for duplicate subscription renewal',
    fullTranscript:
      'We noticed two identical invoices charged to our corporate credit card ending in 4108 for the August seat renewal. One transaction was processed on the 1st and the second appeared on the 3rd. We request immediate reversal or dispute filing before statement closing.',
    predictedIntent: 'billing_dispute',
    confidence: 0.81,
    status: 'review_needed',
    timeAgo: '25m ago',
    timestamp: 'Today at 14:07:55 UTC',
    customer: {
      name: 'Julianne Miller',
      role: 'Accounting Supervisor',
      company: 'Kinetix Media',
      email: 'j.miller@kinetixmedia.io',
      phone: '+1-555-014-4888',
      tier: 'ENT-TIER-2',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAMwFqlZwQVLV34pPb_EQwO66ptI4ciOQhNzGqcDuiyIuBdqdaaNtIdDI-3JR14-UVSGScI6nQqgh41_7R4s6glVW7dw_cgPQSiQugXMgDdyl89ZGaFz8uesfKNA2ty_fgdksbMQ4ss6XvBLXI2Pb5nq3_ek2JypP_zAQV0lKkqKeCZlyZmLBXQjNqR0zsOpSrfF1zZlG8j_KbUe_S5Mb0bWSLdNrDA8ztZtdjbwHQ_EFTisaBDS1q2pQ',
    },
    assignedTeam: 'Billing & Ledger Investigation',
    entities: [
      { label: 'card_last4', value: '4108' },
      { label: 'dispute_type', value: 'Duplicate Charge' },
      { label: 'amount_est', value: '$890.00' },
    ],
    predictions: [
      { intent: 'billing_dispute', score: 0.81, isTop: true },
      { intent: 'refund_request', score: 0.142 },
      { intent: 'payment_method', score: 0.048 },
    ],
    ngrams: [
      { ngram: 'duplicate subscription', weight: 0.79 },
      { ngram: 'chargeback inquiry', weight: 0.74 },
      { ngram: 'identical invoices', weight: 0.58 },
    ],
  },
  {
    id: '#RD-4887',
    subject: 'Replace stolen debit card and expedite delivery',
    fullTranscript:
      'My business debit card was compromised at an airport terminal kiosk in Zurich yesterday. Please deactivate card number **********9921 immediately and courier an expedited metal replacement card to our Geneva satellite headquarters.',
    predictedIntent: 'card_replacement',
    confidence: 0.94,
    status: 'auto_routed',
    timeAgo: '31m ago',
    timestamp: 'Today at 14:01:40 UTC',
    customer: {
      name: 'Tariq Al-Mansoor',
      role: 'Managing Partner',
      company: 'Al-Mansoor Capital Ltd',
      email: 'tariq@almansoor-cap.ch',
      phone: '+41-22-819-4887',
      tier: 'VIP-CONCIERGE',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCAy5_IMqQ9YoB8AvU4xBCofCMLBhJ3cQXWYII7_Fe8UVg8YyKo_XMHNofT-stdiC-QoqtlrS__C4FDjlk_hd8r14sf589jf_-6YmH3OENVixltoWevgRuMtHONm_9hS_FrPoQqWDPiKFjURt61t-DkDO-LnPrvmA2IjjEFL2D5Mk7KTIukmvMEWtgVAjd6AiMl8xKrYo6ycJgVf3GJUx4S7U0jY4eQlY8j6MUlUmibF5SaUIJdm1rrjw',
    },
    assignedTeam: 'Cards Operations Squad',
    entities: [
      { label: 'card_status', value: 'Compromised / Lost' },
      { label: 'fulfillment', value: 'Expedited Courier' },
      { label: 'location', value: 'Geneva, CH' },
    ],
    predictions: [
      { intent: 'card_replacement', score: 0.94, isTop: true },
      { intent: 'freeze_account', score: 0.042 },
      { intent: 'fraud_report', score: 0.018 },
    ],
    ngrams: [
      { ngram: 'stolen debit card', weight: 0.96 },
      { ngram: 'expedite delivery', weight: 0.84 },
      { ngram: 'replacement card', weight: 0.72 },
    ],
  },
];

export const CORRECTION_STREAM: CorrectionItem[] = [
  {
    id: 'corr-1',
    ticketId: '#RD-89412',
    agent: 'M. Rodriguez',
    originalIntent: 'transfer_funds',
    correctedIntent: 'recurring_payment',
    transcriptExcerpt: 'I need to cancel the direct debit authorization for next Tuesday',
    timestamp: '8m ago',
  },
  {
    id: 'corr-2',
    ticketId: '#RD-89390',
    agent: 'K. Patel',
    originalIntent: 'general_inquiry',
    correctedIntent: 'account_security',
    transcriptExcerpt: 'Someone logged in from an unknown iPad device in Frankfurt',
    timestamp: '22m ago',
  },
  {
    id: 'corr-3',
    ticketId: '#RD-89354',
    agent: 'D. Vance',
    originalIntent: 'billing_dispute',
    correctedIntent: 'unsupported_query',
    transcriptExcerpt: 'What is the interest rate for your corporate bond fund?',
    timestamp: '47m ago',
  },
];

export const BENCHMARK_MODELS: ModelBenchmark[] = [
  {
    architecture: 'TF-IDF + Logistic Regression',
    versionTag: 'Baseline v1.4',
    accuracy: '87.4%',
    unsupportedRecall: '89.2%',
    latencyP95: '12ms',
    memoryFootprint: '45MB',
    status: 'Archived',
    statusBadgeType: 'archived',
  },
  {
    architecture: 'TF-IDF + Tuned LogReg + N-grams',
    versionTag: 'v2.1 Active In-Flight',
    accuracy: '91.6%',
    unsupportedRecall: '94.8%',
    latencyP95: '24ms',
    memoryFootprint: '110MB',
    status: 'Live Production',
    statusBadgeType: 'live',
  },
  {
    architecture: 'Fine-tuned MiniLM Embeddings + Classifier',
    versionTag: 'v3.0 Shadow (Dual-Ingest)',
    accuracy: '94.2%',
    unsupportedRecall: '97.1%',
    latencyP95: '86ms',
    memoryFootprint: '380MB',
    status: 'Shadow Pipeline (Evaluating)',
    statusBadgeType: 'shadow',
  },
];

export const CATEGORY_METRICS: CategoryMetric[] = [
  {
    category: 'account_security',
    accuracy: 96,
    falsePositives: 3,
    recall: 97.2,
  },
  {
    category: 'billing_dispute',
    accuracy: 93,
    falsePositives: 7,
    recall: 91.5,
  },
  {
    category: 'transfer_funds',
    accuracy: 95,
    falsePositives: 4,
    recall: 95.8,
  },
  {
    category: 'card_replacement',
    accuracy: 91,
    falsePositives: 9,
    recall: 89.4,
  },
  {
    category: 'unsupported_query (Out-of-Scope)',
    accuracy: 94,
    falsePositives: 5,
    recall: 94.1,
    fBeta: 0.941,
    isOod: true,
  },
];

export const RAW_SQL_SCHEMA = `-- ResolveDesk Operational Data Engine DDL (backend/src/db/schema.sql)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('agent', 'admin', 'lead')),
  created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  auto_route_enabled BOOLEAN DEFAULT true,
  target_sla_mins INT DEFAULT 45
);

CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(100) NOT NULL,
  subject TEXT NOT NULL,
  status VARCHAR(40) NOT NULL CHECK (status IN ('new', 'routed', 'closed')),
  assigned_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'agent', 'bot')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  model_version VARCHAR(50) NOT NULL,
  predicted_intent VARCHAR(100) NOT NULL,
  confidence NUMERIC(5,4) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
  created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_by VARCHAR(30) NOT NULL CHECK (assigned_by IN ('ml_auto_routing', 'supervisor')),
  assigned_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  reviewed_by UUID NOT NULL REFERENCES users(id),
  corrected_intent VARCHAR(100) NOT NULL,
  override_reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_tag VARCHAR(50) UNIQUE NOT NULL,
  f1_score NUMERIC(5,4) NOT NULL,
  benchmark_dataset VARCHAR(50) DEFAULT 'CLINC150',
  is_active BOOLEAN DEFAULT false
);`;
