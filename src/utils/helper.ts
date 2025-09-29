// Placeholder for the helper function
export const generateDocUUID = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
export const calculateAverageProcessingTimes = (applications: any[]) => {
  let totalReviewedTime = 0;
  let reviewedCount = 0;
  let totalAcceptedTime = 0;
  let acceptedCount = 0;

  applications.forEach(app => {
    const appliedAt = new Date(app.appliedAt);

    // Calculate time from applied to reviewed
    if (app.reviewedAt) {
      const reviewedAt = new Date(app.reviewedAt);
      const reviewTimeHours = (reviewedAt.getTime() - appliedAt.getTime()) / (1000 * 60 * 60);
      totalReviewedTime += reviewTimeHours;
      reviewedCount++;
    }

    // Calculate time from applied to accepted
    if (app.status === 'accepted' && app.reviewedAt) {
      const reviewedAt = new Date(app.reviewedAt);
      const acceptTimeHours = (reviewedAt.getTime() - appliedAt.getTime()) / (1000 * 60 * 60);
      totalAcceptedTime += acceptTimeHours;
      acceptedCount++;
    }
  });

  return {
    appliedToReviewed: reviewedCount > 0 ? Math.round(totalReviewedTime / reviewedCount) : 0,
    appliedToAccepted: acceptedCount > 0 ? Math.round(totalAcceptedTime / acceptedCount) : 0,
  };
};

// Helper function to generate application trends
export const generateApplicationTrends = (applications: any[]) => {
  const daily: { [key: string]: number } = {};
  const weekly: { [key: string]: number } = {};
  const monthly: { [key: string]: number } = {};

  applications.forEach(app => {
    const appliedAt = new Date(app.appliedAt);

    // Ensure we have a valid date
    if (isNaN(appliedAt.getTime())) {
      return; // Skip invalid dates
    }

    // Daily trend - use explicit string construction to avoid undefined
    const year = appliedAt.getFullYear();
    const month = String(appliedAt.getMonth() + 1).padStart(2, '0');
    const day = String(appliedAt.getDate()).padStart(2, '0');
    const dayKey = `${year}-${month}-${day}`;

    daily[dayKey] = (daily[dayKey] ?? 0) + 1;

    // Weekly trend
    const weekStart = new Date(appliedAt);
    weekStart.setDate(appliedAt.getDate() - appliedAt.getDay()); // Start of week (Sunday)
    const weekYear = weekStart.getFullYear();
    const weekMonth = String(weekStart.getMonth() + 1).padStart(2, '0');
    const weekDay = String(weekStart.getDate()).padStart(2, '0');
    const weekKey = `${weekYear}-${weekMonth}-${weekDay}`;

    weekly[weekKey] = (weekly[weekKey] ?? 0) + 1;

    // Monthly trend
    const monthKey = `${year}-${month}`;
    monthly[monthKey] = (monthly[monthKey] ?? 0) + 1;
  });

  // Convert to arrays and sort
  const dailyArray = Object.entries(daily)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // Last 30 days

  const weeklyArray = Object.entries(weekly)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12); // Last 12 weeks

  const monthlyArray = Object.entries(monthly)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Last 12 months

  return {
    daily: dailyArray,
    weekly: weeklyArray,
    monthly: monthlyArray,
  };
};
