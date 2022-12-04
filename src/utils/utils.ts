export const convertSecondsToISO = (seconds: number): string => {
  const date = new Date(0);
  date.setSeconds(seconds); // specify value for SECONDS here
  return date.toISOString().substring(14, 19);
};

export const movingAverage = (array: number[], range: number): number[] => {
  const values: number[] = [];
  array.map((value, index) => {
    if (index + 1 >= range) {
      const numbersToSum: number[] = array.slice(index - range, index);
      const sum = numbersToSum.reduce((prev, curr) => prev + curr, 0);
      values.push(+(sum / range).toFixed(2));
    }
  });
  return values;
};

export {};
