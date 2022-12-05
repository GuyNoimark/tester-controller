import react, { useEffect, useState } from "react";
import { Panel } from "rsuite";
// import Chart from "react-apexcharts";
import DashboardPanel from "./DashboardPanel";
import { Line } from "react-chartjs-2";
import ChartStreamingPlugin from "chartjs-plugin-streaming";
import "chartjs-adapter-moment";

import { Chart, registerables } from "chart.js";
import console from "console";
Chart.register(...registerables);
Chart.register(ChartStreamingPlugin);

const data = {
  datasets: [
    {
      label: "Realtime",
      backgroundColor: "red",
      borderColor: "blue",
      fill: false,
      lineTension: 0,
      data: [],
      pointRadius: 0,
    },
  ],
};
const chartBuffer = 20;

let newValue = 0;

const ChartPanel = (props: { forceTarget: number }) => {
  // const [chartData, updateChartData] = useState([0, 1, 2]);
  // const chartData: number[] = [];

  // const chartSeriesData: ApexAxisChartSeries = [
  //   { name: "sensorValue", data: chartData },
  //   // { data: Array.from({ length: 40 }, () => Math.floor(Math.random() * 40)) },
  // ];

  useEffect(() => {
    window.electronAPI.getSensorValue((event: any, value: number) => {
      newValue = value;
      console.log(value);
    });
  }, []);

  // useEffect(() => console.log("chart renderd"));

  // const onRefresh = (chart: any): void => {
  //   const now: number = Date.now();

  //   chart.data.datasets[0].data.push({
  //     x: now,
  //     y: newValue,
  //   });
  // };

  // useEffect(() => {
  //   window.electronAPI.getSensorValue((event: any, value: number) => {
  //     //   const [first, ...rest] = chartData;
  //     //   console.log(chartData.length);
  //     if (chartData.length > chartBuffer) chartData.shift();
  //     // updateChartData((array) => array.slice(1));
  //     chartData.push(value);
  //     chartData.slice();
  //     // console.log(value);

  //     ApexCharts.exec("realtime", "updateSeries", [
  //       {
  //         data: [...chartData, value],
  //       },
  //     ]);
  //     // updateChartData([...chartData, value]);
  //     // chartData.push(value);
  //   });

  //   // window.electronAPI.removeSensorListener(() => {});
  // }, []);

  return (
    <>
      <Line
        data={data}
        options={{
          // animation: false,
          // plugins: {
          //   streaming: {
          //     frameRate: 60,
          //   },
          // },

          // interaction: {
          //   intersect: false,
          // },
          scales: {
            x: {
              // type: "realtime",
              // realtime: {
              //   duration: 5000,
              //   refresh: 10,
              // delay: 0,
              // onRefresh: onRefresh,
              // },
            },
          },
        }}
      />
    </>
  );
};

export default ChartPanel;
