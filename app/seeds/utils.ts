export const toIso = (date: Date) => date.toISOString();

export const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toIso(date);
};

export const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toIso(date);
};
