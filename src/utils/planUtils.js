export const isPlanValid = (business) => {
  const now = new Date();

  // 🆓 Free Trial
  if (business.isTrialActive && business.trialEndDate) {
    return now <= business.trialEndDate;
  }

  // 💳 Paid Plan
  if (business.isPlanActive && business.planEndDate) {
    return now <= business.planEndDate;
  }

  return false;
};
