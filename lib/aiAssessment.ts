import { HealthAssessment, HealthStatus } from './types';

interface VitalInputs {
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  weight: number;
  previousWeight?: number;
}

const NORMAL_RANGES = {
  temperature: { min: 99, max: 101, unit: '°F' },
  heartRate: { min: 28, max: 44, unit: 'bpm' },
  respiratoryRate: { min: 8, max: 16, unit: 'breaths/min' },
  weightChangePct: 5,
};

function scoreVital(value: number, min: number, max: number): { score: number; severity: 'normal' | 'warning' | 'critical' } {
  if (value >= min && value <= max) return { score: 100, severity: 'normal' };

  const range = max - min;
  const warningBuffer = range * 0.15;
  const criticalBuffer = range * 0.35;

  const deviation = value < min ? min - value : value - max;

  if (deviation <= warningBuffer) return { score: 70, severity: 'warning' };
  if (deviation <= criticalBuffer) return { score: 40, severity: 'warning' };
  return { score: 10, severity: 'critical' };
}

export function assessHealth(inputs: VitalInputs): HealthAssessment {
  const findings: string[] = [];
  const recommendations: string[] = [];
  const scores: number[] = [];
  const severities: Array<'normal' | 'warning' | 'critical'> = [];

  // Temperature assessment
  const tempResult = scoreVital(inputs.temperature, NORMAL_RANGES.temperature.min, NORMAL_RANGES.temperature.max);
  scores.push(tempResult.score);
  severities.push(tempResult.severity);
  if (tempResult.severity === 'normal') {
    findings.push(`Temperature normal at ${inputs.temperature}°F`);
  } else if (tempResult.severity === 'warning') {
    if (inputs.temperature > NORMAL_RANGES.temperature.max) {
      findings.push(`Temperature elevated at ${inputs.temperature}°F (normal: ${NORMAL_RANGES.temperature.min}–${NORMAL_RANGES.temperature.max}°F)`);
      recommendations.push('Monitor temperature every 4 hours');
      recommendations.push('Ensure adequate hydration and shade');
      if (inputs.temperature > 102) {
        recommendations.push('Contact veterinarian if temperature exceeds 103°F');
      }
    } else {
      findings.push(`Temperature below normal at ${inputs.temperature}°F (normal: ${NORMAL_RANGES.temperature.min}–${NORMAL_RANGES.temperature.max}°F)`);
      recommendations.push('Provide warm shelter and monitor for hypothermia signs');
    }
  } else {
    if (inputs.temperature > NORMAL_RANGES.temperature.max) {
      findings.push(`Temperature critically high at ${inputs.temperature}°F — possible fever or heat stroke`);
      recommendations.push('Seek immediate veterinary attention for high temperature');
      recommendations.push('Apply cool water to lower body temperature');
    } else {
      findings.push(`Temperature critically low at ${inputs.temperature}°F — possible hypothermia`);
      recommendations.push('Seek immediate veterinary attention for low temperature');
    }
  }

  // Heart rate assessment
  const hrResult = scoreVital(inputs.heartRate, NORMAL_RANGES.heartRate.min, NORMAL_RANGES.heartRate.max);
  scores.push(hrResult.score);
  severities.push(hrResult.severity);
  if (hrResult.severity === 'normal') {
    findings.push(`Heart rate optimal at ${inputs.heartRate} bpm`);
  } else if (hrResult.severity === 'warning') {
    if (inputs.heartRate > NORMAL_RANGES.heartRate.max) {
      findings.push(`Heart rate elevated at ${inputs.heartRate} bpm (normal: ${NORMAL_RANGES.heartRate.min}–${NORMAL_RANGES.heartRate.max} bpm)`);
      recommendations.push('Reduce exercise intensity and allow rest');
      recommendations.push('Monitor heart rate over the next 24 hours');
    } else {
      findings.push(`Heart rate slightly low at ${inputs.heartRate} bpm (normal: ${NORMAL_RANGES.heartRate.min}–${NORMAL_RANGES.heartRate.max} bpm)`);
      recommendations.push('Observe horse behavior for signs of lethargy');
    }
  } else {
    if (inputs.heartRate > NORMAL_RANGES.heartRate.max) {
      findings.push(`Heart rate critically elevated at ${inputs.heartRate} bpm — possible cardiac stress or pain`);
      recommendations.push('Contact veterinarian immediately for elevated heart rate');
    } else {
      findings.push(`Heart rate critically low at ${inputs.heartRate} bpm — possible cardiac or neurologic issue`);
      recommendations.push('Contact veterinarian immediately for low heart rate');
      recommendations.push('Keep horse calm and minimize movement');
    }
  }

  // Respiratory rate assessment
  const rrResult = scoreVital(inputs.respiratoryRate, NORMAL_RANGES.respiratoryRate.min, NORMAL_RANGES.respiratoryRate.max);
  scores.push(rrResult.score);
  severities.push(rrResult.severity);
  if (rrResult.severity === 'normal') {
    findings.push(`Respiratory rate normal at ${inputs.respiratoryRate} breaths/min`);
  } else if (rrResult.severity === 'warning') {
    if (inputs.respiratoryRate > NORMAL_RANGES.respiratoryRate.max) {
      findings.push(`Respiratory rate elevated at ${inputs.respiratoryRate} breaths/min (normal: ${NORMAL_RANGES.respiratoryRate.min}–${NORMAL_RANGES.respiratoryRate.max})`);
      recommendations.push('Check for signs of respiratory distress or nasal discharge');
      recommendations.push('Ensure good ventilation in stable');
    } else {
      findings.push(`Respiratory rate slightly low at ${inputs.respiratoryRate} breaths/min`);
      recommendations.push('Monitor breathing pattern closely');
    }
  } else {
    if (inputs.respiratoryRate > NORMAL_RANGES.respiratoryRate.max) {
      findings.push(`Respiratory rate critically high at ${inputs.respiratoryRate} breaths/min — possible respiratory distress`);
      recommendations.push('Seek immediate veterinary attention for breathing difficulty');
    } else {
      findings.push(`Respiratory rate critically low at ${inputs.respiratoryRate} breaths/min — possible respiratory depression`);
      recommendations.push('Seek immediate veterinary attention for low respiratory rate');
    }
  }

  // Weight change assessment
  if (inputs.previousWeight && inputs.previousWeight > 0) {
    const pctChange = Math.abs((inputs.weight - inputs.previousWeight) / inputs.previousWeight) * 100;
    if (pctChange > NORMAL_RANGES.weightChangePct) {
      const direction = inputs.weight < inputs.previousWeight ? 'loss' : 'gain';
      findings.push(`Significant weight ${direction} detected: ${pctChange.toFixed(1)}% change from previous ${inputs.previousWeight} lbs`);
      scores.push(60);
      severities.push('warning');
      recommendations.push(`Investigate cause of weight ${direction} and consult veterinarian`);
      recommendations.push('Review diet and feeding schedule');
    }
  }

  // Calculate overall score (weighted average, critical findings drag score down more)
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Overall status
  let status: HealthStatus = 'healthy';
  if (severities.includes('critical')) {
    status = 'critical';
  } else if (severities.includes('warning')) {
    status = 'warning';
  }

  // Add general recommendations if everything is fine
  if (status === 'healthy') {
    findings.push('All vital signs within normal ranges');
    recommendations.push('Continue regular monitoring');
    recommendations.push('Maintain current diet and exercise routine');
  } else {
    recommendations.push('Record all observations in health log for veterinary review');
  }

  // Ensure score aligns with status
  let finalScore = Math.round(avgScore);
  if (status === 'critical' && finalScore > 40) finalScore = Math.min(finalScore, 40);
  if (status === 'warning' && finalScore > 75) finalScore = Math.min(finalScore, 75);
  if (status === 'healthy' && finalScore < 80) finalScore = Math.max(finalScore, 80);

  return { score: finalScore, status, findings, recommendations };
}
