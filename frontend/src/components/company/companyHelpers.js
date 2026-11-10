export const COMPANY_CATEGORIES = [
  'Product-Based',
  'Service-Based',
  'IT Consulting',
  'Startups'
];

export function enrichCompany(company) {
  const aptitudeSolved = company.solvedQuestions || 0;
  const aptitudeTotal = company.totalQuestions || 0;
  const dsaSolved = company.dsaSolved || 0;
  const dsaTotal = company.dsaTotal || 0;

  const combinedSolved = aptitudeSolved + dsaSolved;
  const combinedTotal = aptitudeTotal + dsaTotal;
  const combinedProgress =
    combinedTotal > 0 ? Math.round((combinedSolved / combinedTotal) * 100) : 0;

  return {
    ...company,
    category: company.category || 'Product-Based',
    assessmentType: company.assessmentType || 'Aptitude + Coding',
    roundsCount: company.roundsCount || (company.stages?.length || 3),
    description:
      company.description ||
      `Targeted placement preparation track for ${company.name} featuring structured aptitude banks, coding challenges, and mock assessments.`,
    stages: Array.isArray(company.stages) ? company.stages : [],
    experiences: Array.isArray(company.experiences) ? company.experiences : [],
    combinedSolved,
    combinedTotal,
    combinedProgress
  };
}
