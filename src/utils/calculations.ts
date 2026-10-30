import { DecisionReport, OptionAnalysis, MatrixCriterion } from '../types/decision';

export function calculateOptionProsConsScore(option: OptionAnalysis): {
  prosScore: number;
  consScore: number;
  netScore: number;
  activeProsCount: number;
  activeConsCount: number;
} {
  const activePros = option.pros.filter((p) => p.enabled !== false);
  const activeCons = option.cons.filter((c) => c.enabled !== false);

  const prosScore = activePros.reduce((sum, p) => sum + (p.score * (p.userWeight ?? 1)), 0);
  const consScore = activeCons.reduce((sum, c) => sum + (c.score * (c.userWeight ?? 1)), 0);

  return {
    prosScore: Math.round(prosScore * 10) / 10,
    consScore: Math.round(consScore * 10) / 10,
    netScore: Math.round((prosScore - consScore) * 10) / 10,
    activeProsCount: activePros.length,
    activeConsCount: activeCons.length,
  };
}

export function calculateMatrixTotals(
  criteria: MatrixCriterion[],
  options: OptionAnalysis[]
): Record<string, { totalWeightedScore: number; maxPossible: number; percentage: number }> {
  const result: Record<string, { totalWeightedScore: number; maxPossible: number; percentage: number }> = {};

  const totalCriteriaWeight = criteria.reduce((sum, c) => sum + (c.weight || 1), 0);
  const maxPossible = totalCriteriaWeight * 10;

  for (const opt of options) {
    let weightedSum = 0;
    for (const criterion of criteria) {
      const match = criterion.scores.find((s) => s.optionId === opt.id);
      const score = match ? match.score : 5;
      weightedSum += score * (criterion.weight || 1);
    }

    const percentage = maxPossible > 0 ? Math.round((weightedSum / maxPossible) * 100) : 50;
    result[opt.id] = {
      totalWeightedScore: Math.round(weightedSum * 10) / 10,
      maxPossible,
      percentage,
    };
  }

  return result;
}

export function generateMarkdownReport(report: DecisionReport): string {
  let md = `# The Tiebreaker: Decision Analysis Report\n\n`;
  md += `**Decision Dilemma:** ${report.title}\n`;
  md += `**Date:** ${new Date(report.createdAt).toLocaleDateString()}\n\n`;

  if (report.context) {
    md += `### Context & Circumstances\n${report.context}\n\n`;
  }
  if (report.userPriorities) {
    md += `### Priorities & Values\n${report.userPriorities}\n\n`;
  }

  md += `## 🏆 The Tiebreaker Verdict\n\n`;
  md += `**Recommended Choice:** **${report.verdict.recommendedOptionName}** (Confidence: ${report.verdict.confidenceScore}%)\n\n`;
  md += `> "${report.verdict.headlineVerdict}"\n\n`;
  md += `**The Tipping Factor:** ${report.verdict.criticalFactor}\n\n`;
  md += `### Detailed Rationale\n${report.verdict.detailedRationale}\n\n`;

  md += `### Devil's Advocate & Risk Mitigation\n`;
  md += `- **Potential Pitfall:** ${report.verdict.devilsAdvocate.potentialPitfall}\n`;
  md += `- **Hedge Strategy:** ${report.verdict.devilsAdvocate.hedgeStrategy}\n`;
  md += `- **When to Reconsider:** ${report.verdict.devilsAdvocate.whenToReconsider}\n\n`;

  md += `### The 10/10/10 Rule\n`;
  md += `- **In 10 Minutes:** ${report.verdict.rule101010.tenMinutes}\n`;
  md += `- **In 10 Months:** ${report.verdict.rule101010.tenMonths}\n`;
  md += `- **In 10 Years:** ${report.verdict.rule101010.tenYears}\n\n`;

  md += `**Gut-Check Question:** *${report.verdict.gutCheckQuestion}*\n\n`;

  md += `---\n\n## ⚖️ Pros & Cons Breakdown\n\n`;
  for (const opt of report.options) {
    const scores = calculateOptionProsConsScore(opt);
    md += `### Option: ${opt.name} — *"${opt.tagline}"*\n`;
    md += `*Net Score: ${scores.netScore > 0 ? '+' : ''}${scores.netScore} (Pros: +${scores.prosScore} | Cons: -${scores.consScore})*\n\n`;

    md += `**Pros:**\n`;
    for (const pro of opt.pros) {
      md += `- [${pro.category}] **+${pro.score}** ${pro.text}: ${pro.explanation}\n`;
    }
    md += `\n**Cons:**\n`;
    for (const con of opt.cons) {
      md += `- [${con.category}] **-${con.score}** ${con.text}: ${con.explanation}\n`;
    }
    md += `\n**Key Tradeoff:** ${opt.keyTradeoff}\n\n`;
  }

  md += `---\n\n## 📊 Comparison Matrix\n\n`;
  md += `| Evaluation Criterion | Weight | ${report.options.map((o) => o.name).join(' | ')} |\n`;
  md += `| --- | --- | ${report.options.map(() => '---').join(' | ')} |\n`;

  for (const c of report.matrix.criteria) {
    const rowScores = report.options.map((opt) => {
      const match = c.scores.find((s) => s.optionId === opt.id);
      return match ? `${match.score}/10` : '-';
    });
    md += `| **${c.name}** | ${c.weight}x | ${rowScores.join(' | ')} |\n`;
  }

  md += `\n---\n\n## 🧭 SWOT Analysis\n\n`;
  for (const opt of report.options) {
    md += `### ${opt.name} SWOT\n`;
    md += `- **Strengths:** ${opt.swot.strengths.join('; ')}\n`;
    md += `- **Weaknesses:** ${opt.swot.weaknesses.join('; ')}\n`;
    md += `- **Opportunities:** ${opt.swot.opportunities.join('; ')}\n`;
    md += `- **Threats:** ${opt.swot.threats.join('; ')}\n\n`;
  }

  md += `\nGenerated with The Tiebreaker.`;
  return md;
}
