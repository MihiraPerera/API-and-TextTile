import { SizeMeasurementRule } from '../types';

export interface BodyMeasurementInput {
  bust: number; // inches
  waist: number; // inches
  hips: number; // inches
  shoulder?: number; // inches
}

export interface CalculatedSizeResult {
  recommendedSizeCode: string; // 'S', 'M', 'L', 'XL', etc.
  recommendedSizeLabel: string; // 'Small (S)', 'Medium (M)', etc.
  matchedRule: SizeMeasurementRule | null;
  score: number; // 0 - 100 confidence
  breakdown: {
    bustMatch: string;
    waistMatch: string;
    hipsMatch: string;
  };
  notes: string;
}

export function resolveSizeFromMeasurements(
  input: BodyMeasurementInput,
  rules: SizeMeasurementRule[]
): CalculatedSizeResult {
  if (!rules || rules.length === 0) {
    return {
      recommendedSizeCode: 'M',
      recommendedSizeLabel: 'Medium (M)',
      matchedRule: null,
      score: 50,
      breakdown: { bustMatch: 'M', waistMatch: 'M', hipsMatch: 'M' },
      notes: 'Default standard fit'
    };
  }

  const { bust, waist, hips } = input;

  // Find best match for each individual metric
  const findMetricMatch = (
    val: number, 
    getMin: (r: SizeMeasurementRule) => number, 
    getMax: (r: SizeMeasurementRule) => number
  ) => {
    for (const rule of rules) {
      if (val >= getMin(rule) && val <= getMax(rule)) {
        return rule;
      }
    }
    if (val < getMin(rules[0])) return rules[0];
    return rules[rules.length - 1];
  };

  const bustMatchRule = findMetricMatch(bust, r => r.bustMinInches, r => r.bustMaxInches);
  const waistMatchRule = findMetricMatch(waist, r => r.waistMinInches, r => r.waistMaxInches);
  const hipsMatchRule = findMetricMatch(hips, r => r.hipsMinInches, r => r.hipsMaxInches);

  // Calculate composite fit scores
  const ruleScores = rules.map(rule => {
    let scorePoints = 0;
    
    // Bust matching
    if (bust >= rule.bustMinInches && bust <= rule.bustMaxInches) {
      scorePoints += 3;
    } else {
      const dist = Math.min(Math.abs(bust - rule.bustMinInches), Math.abs(bust - rule.bustMaxInches));
      scorePoints += Math.max(0, 3 - dist * 0.8);
    }

    // Waist matching
    if (waist >= rule.waistMinInches && waist <= rule.waistMaxInches) {
      scorePoints += 3;
    } else {
      const dist = Math.min(Math.abs(waist - rule.waistMinInches), Math.abs(waist - rule.waistMaxInches));
      scorePoints += Math.max(0, 3 - dist * 0.8);
    }

    // Hips matching
    if (hips >= rule.hipsMinInches && hips <= rule.hipsMaxInches) {
      scorePoints += 3;
    } else {
      const dist = Math.min(Math.abs(hips - rule.hipsMinInches), Math.abs(hips - rule.hipsMaxInches));
      scorePoints += Math.max(0, 3 - dist * 0.8);
    }

    return { rule, score: scorePoints };
  });

  // Sort descending by score
  ruleScores.sort((a, b) => b.score - a.score);
  const best = ruleScores[0].rule;
  const maxPossible = 9;
  const scorePct = Math.min(100, Math.round((ruleScores[0].score / maxPossible) * 100));

  return {
    recommendedSizeCode: best.sizeCode,
    recommendedSizeLabel: best.sizeLabel,
    matchedRule: best,
    score: scorePct,
    breakdown: {
      bustMatch: bustMatchRule.sizeCode,
      waistMatch: waistMatchRule.sizeCode,
      hipsMatch: hipsMatchRule.sizeCode
    },
    notes: best.notes || `Fits bust ${best.bustMinInches}"-${best.bustMaxInches}", waist ${best.waistMinInches}"-${best.waistMaxInches}", hips ${best.hipsMinInches}"-${best.hipsMaxInches}".`
  };
}
