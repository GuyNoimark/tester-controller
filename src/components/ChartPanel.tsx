import react, { useEffect, useState } from "react";
import { Panel } from "rsuite";
import Chart from "react-apexcharts";
import DashboardPanel from "./DashboardPanel";

const ChartPanel = (props: { forceTarget: number }) => {
  const [chartData, updateChartData] = useState([0, 1, 2]);

  const chartSeriesData: ApexAxisChartSeries = [
    { name: "sensorValue", data: chartData },
    // { data: Array.from({ length: 40 }, () => Math.floor(Math.random() * 40)) },
  ];

  const chartBuffer = 20;

  useEffect(() => {
    const removeEventListener = window.electronAPI.getSensorValue(
      (event: any, value: number) => {
        //   const [first, ...rest] = chartData;
        //   console.log(chartData.length);
        if (chartData.length > chartBuffer) chartData.shift();
        // updateChartData((array) => array.slice(1));
        updateChartData([...chartData, value]);
        // chartData.push(value);
      }
    );
    return () => {
      removeEventListener();
    };
    // window.electronAPI.removeSensorListener(() => {});
  });

  return (
    <>
      <Chart
        options={{
          chart: {
            id: "realtime",
            animations: {
              enabled: true,
              easing: "linear",
              dynamicAnimation: {
                speed: 10,
              },
            },
            toolbar: {
              show: true,
            },
            zoom: {
              enabled: false,
            },
          },
          stroke: {
            curve: "straight",
            //   curve: "stepline",
            //   curve: "smooth",
          },
          xaxis: {
            axisTicks: {
              show: true,
            },
            // type: 'datetime',
            //   range: XAXISRANGE,
          },
          yaxis: {
            min: -20,
            max: 20,

            //   tickAmount: 10,
          },
          annotations: {
            yaxis: [
              {
                y: props.forceTarget,
                borderColor: "#f08901",
                label: {
                  borderColor: "#f08901",
                  style: {
                    color: "#fff",
                    background: "#f08901",
                  },
                  text: "Force target: " + props.forceTarget,
                },
              },
            ],
          },
        }}
        series={chartSeriesData}
        type="line"
        // width="500"
      />
    </>
  );
};

export default ChartPanel;
