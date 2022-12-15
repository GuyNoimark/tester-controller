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

export function findSpikes(arr: number[]): number[][] {
  let spikeStartIndex: number = 0;
  let spikeEndIndex: number = 0;
  // const smoothGraph = movingAverage(arr, 100);
  return arr.reduce(function (spikes: number[][], val, i) {
    if (arr[i + 1] >= 3 && arr[i] < 3) {
      spikeStartIndex = i;
    } else if (spikeStartIndex !== 0 && arr[i + 1] === 0 && arr[i + 2] === 0) {
      spikeEndIndex = i;
      spikes.push(arr.slice(spikeStartIndex, spikeEndIndex));
      spikeStartIndex = 0;
      spikeEndIndex = 0;
    }
    return spikes;
  }, []);
}

export {};
