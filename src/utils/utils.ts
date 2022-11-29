export const convertSecondsToISO = (seconds: number): string => {
  const date = new Date(0);
  date.setSeconds(seconds); // specify value for SECONDS here
  return date.toISOString().substring(14, 19);
};

export {};
