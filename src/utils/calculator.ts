import { SubjectInput, SubjectMetrics, MockTestRecord, SubjectName } from '../types';

export function calculateSubjectMetrics(input: SubjectInput): SubjectMetrics {
  const correct = Math.max(0, Number(input.correct) || 0);
  const incorrect = Math.max(0, Number(input.incorrect) || 0);
  const totalQuestions = Number(input.totalQuestions) || 25;
  const attempted = correct + incorrect;
  const unattempted = Math.max(0, totalQuestions - attempted);
  
  // JEE Format: +4 for correct, -1 for incorrect
  const score = (correct * 4) - (incorrect * 1);
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 1000) / 10 : 0;
  const negativeMarks = incorrect * 1;
  // If the student had solved those incorrect correctly, they'd have +4 instead of -1 (swing of 5 marks)
  const potentialMarksLost = incorrect * 5;
  const maxMarks = totalQuestions * 4;

  return {
    correct,
    incorrect,
    unattempted,
    attempted,
    totalQuestions,
    score,
    accuracy,
    negativeMarks,
    potentialMarksLost,
    maxMarks,
  };
}

export function estimateJeePercentile(score: number): number {
  // Approximate standard JEE Main percentile curve for a typical 300-mark paper
  if (score >= 280) return 99.98;
  if (score >= 260) return 99.9;
  if (score >= 240) return 99.75;
  if (score >= 220) return 99.5;
  if (score >= 200) return 99.2;
  if (score >= 180) return 98.8;
  if (score >= 160) return 98.0;
  if (score >= 140) return 96.5;
  if (score >= 120) return 94.2;
  if (score >= 100) return 90.5;
  if (score >= 80) return 83.0;
  if (score >= 60) return 72.0;
  if (score >= 40) return 55.0;
  if (score >= 20) return 35.0;
  return Math.max(5.0, Math.round(score * 1.5 * 10) / 10);
}

export interface LaggingInsight {
  type: 'danger' | 'warning' | 'success' | 'info';
  subject?: SubjectName;
  title: string;
  detail: string;
  recommendation: string;
}

export function generateLaggingInsights(
  current: MockTestRecord,
  previous?: MockTestRecord
): LaggingInsight[] {
  const insights: LaggingInsight[] = [];

  // Check overall negative marks damage
  if (current.totalNegativeMarks >= 8) {
    insights.push({
      type: 'danger',
      title: `Critical Negative Marks Penalty (${current.totalNegativeMarks} marks lost)`,
      detail: `You got ${current.totalIncorrect} questions wrong across subjects. This didn't just cost you -${current.totalNegativeMarks} marks; it cost you a swing of ${current.totalIncorrect * 5} marks that could have elevated your percentile significantly!`,
      recommendation: 'Strictly avoid 50-50 speculative guesses. Implement the "Two-Round Strategy": solve 100% sure questions first.'
    });
  }

  // Subject-wise accuracy and balance check
  const subjects: SubjectName[] = ['physics', 'chemistry', 'maths'];
  const subjectLabels: Record<SubjectName, string> = {
    physics: 'Physics',
    chemistry: 'Chemistry',
    maths: 'Mathematics'
  };

  subjects.forEach(sub => {
    const currSub = current[sub];
    
    // Low accuracy check (< 75%)
    if (currSub.attempted >= 5 && currSub.accuracy < 75) {
      insights.push({
        type: 'warning',
        subject: sub,
        title: `${subjectLabels[sub]} Accuracy Lagging (${currSub.accuracy}%)`,
        detail: `You attempted ${currSub.attempted} questions in ${subjectLabels[sub]} but made ${currSub.incorrect} mistakes. This dragged down your ${subjectLabels[sub]} score to ${currSub.score}.`,
        recommendation: `Log these ${currSub.incorrect} mistakes in the Mistake Notebook. Check if they are calculation errors or formula gaps.`
      });
    }

    // Low attempt rate in maths or physics
    if (currSub.attempted < 10) {
      insights.push({
        type: 'info',
        subject: sub,
        title: `Low Attempt Rate in ${subjectLabels[sub]} (${currSub.attempted}/${currSub.totalQuestions})`,
        detail: `Only ${currSub.attempted} questions were attempted, leaving ${currSub.unattempted} questions untouched.`,
        recommendation: `Scan the paper for easy pickings (low-hanging fruits like modern physics, statistics, or direct NCERT questions).`
      });
    }
  });

  // Comparison with Previous Test
  if (previous) {
    const scoreDiff = current.totalScore - previous.totalScore;
    const accuracyDiff = Math.round((current.overallAccuracy - previous.overallAccuracy) * 10) / 10;
    const negativeDiff = current.totalNegativeMarks - previous.totalNegativeMarks;

    if (scoreDiff < 0) {
      insights.push({
        type: 'danger',
        title: `Score Dropped by ${Math.abs(scoreDiff)} marks vs Previous Mock`,
        detail: `Your score dropped from ${previous.totalScore} in "${previous.name}" to ${current.totalScore} in "${current.name}".`,
        recommendation: 'Analyze which subject had the largest drop below and check the corresponding questions in your test review.'
      });
    } else if (scoreDiff > 0) {
      insights.push({
        type: 'success',
        title: `Progress! +${scoreDiff} marks gain vs Previous Mock`,
        detail: `You scored ${current.totalScore} vs ${previous.totalScore} previously. Great momentum!`,
        recommendation: 'Reinforce the chapters you mastered in this test by completing their R1/R2 revisions in the sheet.'
      });
    }

    // Identify which subject lagged most in comparison
    subjects.forEach(sub => {
      const prevSub = previous[sub];
      const currSub = current[sub];
      const subScoreDiff = currSub.score - prevSub.score;
      const subAccDiff = Math.round((currSub.accuracy - prevSub.accuracy) * 10) / 10;

      if (subScoreDiff < -5) {
        insights.push({
          type: 'warning',
          subject: sub,
          title: `${subjectLabels[sub]} Lagging vs Last Test (${subScoreDiff} marks)`,
          detail: `In "${previous.name}", you scored ${prevSub.score} with ${prevSub.accuracy}% accuracy. In "${current.name}", it was ${currSub.score} (${currSub.accuracy}%).`,
          recommendation: `Review the mock test solutions for ${subjectLabels[sub]} and identify chapters with consecutive negative marks.`
        });
      }
    });

    if (negativeDiff > 2) {
      insights.push({
        type: 'warning',
        title: `Increased Negative Marking (+${negativeDiff} negative marks)`,
        detail: `You had ${previous.totalNegativeMarks} negative marks previously, but conceded ${current.totalNegativeMarks} in this test.`,
        recommendation: 'Work on question selection. Don’t attempt questions under time pressure during the final 15 minutes.'
      });
    }
  }

  return insights;
}
