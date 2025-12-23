
export enum AgentType {
  OPTIMIST = 'OPTIMIST',
  SKEPTIC = 'SKEPTIC',
  SOCIAL_LISTENER = 'SOCIAL_LISTENER',
  AD_ANALYST = 'AD_ANALYST',
  JUDGE = 'JUDGE',
  SUPREME_COURT = 'SUPREME_COURT'
}

export interface AgentResponse {
  type: AgentType;
  content: string;
  timestamp: number;
}

export interface ClarifyingQuestions {
  questions: string[];
}

export interface DebateSession {
  idea: string;
  location: string;
  responses: AgentResponse[];
  status: 'idle' | 'analyzing' | 'clarifying' | 'refining' | 'judging' | 'completed' | 'error';
  verdict?: Verdict;
  clarifications?: string[];
}

export interface Verdict {
  viabilityScore: number;
  summary: string;
  keyRisks: string[];
  keyOpportunities: string[];
  marketTrends: string[];
  socialSentiment: string;
  estimatedCAC: string;
  supremeCourtRuling?: string;
  sources: { title: string; uri: string }[];
}
