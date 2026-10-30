export type ProConCategory =
  | 'Financial'
  | 'Career & Growth'
  | 'Time & Energy'
  | 'Emotional & Wellbeing'
  | 'Risk & Security'
  | 'Strategic';

export interface ProConItem {
  id: string;
  text: string;
  category: ProConCategory;
  score: number; // 1 to 5
  explanation: string;
  userWeight?: number; // 0.5, 1, 1.5, 2, 3
  enabled?: boolean;
  isCustom?: boolean;
}

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface OptionAnalysis {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  pros: ProConItem[];
  cons: ProConItem[];
  swot: SWOTData;
  keyTradeoff: string;
}

export interface CriterionScore {
  optionId: string;
  score: number; // 1 to 10
  rationale: string;
}

export interface MatrixCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 1 to 3
  scores: CriterionScore[];
}

export interface DevilsAdvocate {
  potentialPitfall: string;
  hedgeStrategy: string;
  whenToReconsider: string;
}

export interface Rule101010 {
  tenMinutes: string;
  tenMonths: string;
  tenYears: string;
}

export interface TiebreakerVerdict {
  recommendedOptionId: string;
  recommendedOptionName: string;
  confidenceScore: number; // 50 to 95
  headlineVerdict: string;
  detailedRationale: string;
  criticalFactor: string;
  devilsAdvocate: DevilsAdvocate;
  rule101010: Rule101010;
  gutCheckQuestion: string;
}

export interface DecisionReport {
  id: string;
  createdAt: string;
  title: string;
  context?: string;
  userPriorities?: string;
  summary: string;
  options: OptionAnalysis[];
  matrix: {
    criteria: MatrixCriterion[];
  };
  verdict: TiebreakerVerdict;
  chosenOptionId?: string; // If the user finalized their choice
}

export interface DecisionTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  options: string[];
  context: string;
  userPriorities: string;
}
