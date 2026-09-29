export type NavigationModule =
  | 'agent-inbox'
  | 'assignment-board'
  | 'customer-portal'
  | 'routing-analytics'
  | 'project-blueprint-and-architecture'
  | 'empty-state'
  | 'not-found';

export interface ExtractedEntity {
  label: string;
  value: string;
}

export interface PredictionProb {
  intent: string;
  score: number; // 0 to 1
  isTop?: boolean;
}

export interface FeatureNgram {
  ngram: string;
  weight: number;
}

export interface Ticket {
  id: string;
  subject: string;
  fullTranscript: string;
  predictedIntent: string;
  confidence: number; // 0 to 1
  status: 'review_needed' | 'auto_routed' | 'ood_rejected' | 'resolved';
  timeAgo: string;
  timestamp: string;
  customer: {
    name: string;
    role: string;
    company: string;
    email: string;
    phone: string;
    tier: string;
    avatarUrl: string;
  };
  assignedTeam: string;
  assignedAgent?: string;
  entities: ExtractedEntity[];
  predictions: PredictionProb[];
  ngrams: FeatureNgram[];
}

export interface CorrectionItem {
  id: string;
  ticketId: string;
  agent: string;
  originalIntent: string;
  correctedIntent: string;
  transcriptExcerpt: string;
  timestamp: string;
}

export interface ModelBenchmark {
  architecture: string;
  versionTag: string;
  accuracy: string;
  unsupportedRecall: string;
  latencyP95: string;
  memoryFootprint: string;
  status: 'Archived' | 'Live Production' | 'Shadow Pipeline (Evaluating)';
  statusBadgeType: 'archived' | 'live' | 'shadow';
}

export interface CategoryMetric {
  category: string;
  accuracy: number;
  falsePositives: number;
  recall: number;
  fBeta?: number;
  isOod?: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface SquadQueue {
  id: string;
  name: string;
  slug: string;
  lead: string;
  activeCount: number;
  capacity: number;
  tickets: Ticket[];
}
