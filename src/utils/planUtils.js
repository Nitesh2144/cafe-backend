export const isPlanValid = (business) => {
  if (!business.planEndDate) return false;

  const now = new Date();
  return now <= business.planEndDate && business.isPlanActive;
};
