import "chartjs-adapter-moment";

import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import ChartStreamingPlugin from "chartjs-plugin-streaming";
import react, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

Chart.defaults.font.family =
  "Apple-System,Arial,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,STXihei,sans-serif";

Chart.register(...registerables);
Chart.register(ChartStreamingPlugin);
Chart.register(annotationPlugin);

const data = {
  datasets: [
    {
      label: "Sensor Data",
      backgroundColor: "rgb(23, 135, 232, 0.5)",
      borderColor: "rgb(23, 135, 232)",
      fill: false,
      lineTension: 0,
      data: [],
      pointRadius: 0,
    },
  ],
};
const chartBuffer = 20;

let newValue = 0;

const ChartPanel = (props: { forceTarget: number; pause: boolean }) => {
  useEffect(() => {
    window.electronAPI.getSensorValue((event: any, value: number) => {
      newValue = Math.abs(value);
    });
  }, []);

  const onRefresh = (chart: any): void => {
    const now: number = Date.now();

    chart.data.datasets[0].data.push({
      x: now,
      y: newValue,
    });
  };

  return (
    <>
      <Line
        data={data}
        options={{
          animation: false,
          plugins: {
            streaming: {
              frameRate: 60,
            },
            annotation: {
              annotations: {
                line1: {
                  display: props.forceTarget !== 0,
                  type: "line",
                  yMin: props.forceTarget,
                  yMax: props.forceTarget,
                  borderColor: "rgb(255, 99, 132)",
                  borderWidth: 3,
                  borderDash: [4, 4],
                },
              },
            },
          },
          // interaction: {
          //   intersect: false,
          // },
          scales: {
            y: {
              display: true,
              beginAtZero: true,
              // steps: 10,
              max: props.forceTarget !== 0 ? props.forceTarget + 5 : undefined,
              ticks: {
                // stepValue: 5,
              },
            },

            x: {
              type: "realtime",
              realtime: {
                duration: 5000,
                refresh: 10,
                delay: 0,
                onRefresh: onRefresh,
                pause: props.pause,
              },
            },
          },
        }}
      />
    </>
  );
};

export default ChartPanel;
