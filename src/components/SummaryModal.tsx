import { useState } from "react";
import {
  Button,
  Col,
  FlexboxGrid,
  Grid,
  Message,
  Modal,
  Panel,
  Row,
  Stack,
} from "rsuite";
import { ModalState, SaveOptions, SummaryPanelData } from "../Models/types";
import RemindRoundIcon from "@rsuite/icons/RemindRound";
import Chart from "react-apexcharts";
import DashboardPanel from "./DashboardPanel";
import SplitButton from "./SplitButton";
import { convertSecondsToISO } from "../utils/utils";
const FileSaver = require("file-saver");

const SummaryModel = (props: { data?: SummaryPanelData; open: boolean }) => {
  // if (props.state === ModalState.Open) handleOpen();
  // if (props.state === ModalState.Closed) handleClose();
  console.log(props.data?.lineChartData);

  const date = new Date();

  // const _lineChartData: number[] = props.data?.lineChartData ?? [];
  const _lineChartData: number[] =
    Array.from({ length: 40 }, () => Math.floor(Math.random() * 40 - 20)) ?? [];

  const chartSeriesData: ApexAxisChartSeries = [
    // { name: "sensorValue", data: [0, 5, 1, 4] },
    {
      data: _lineChartData,
    },
  ];

  const lowestValue = Math.min(..._lineChartData);
  const maxValue = Math.max(..._lineChartData);

  // console.log(maxValue);

  const getIndex = (value: number): number => _lineChartData.indexOf(value);

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      id: "realtime",
      animations: {
        enabled: true,
        easing: "linear",
        dynamicAnimation: {
          speed: 10,
        },
      },
      events: {
        // mounted: function (chartContext, config) {
        //   const lowest = chartContext.getLowestValueInSeries(0);
        //   const highest = chartContext.getHighestValueInSeries(0);
        //   const getIndex = (value: number): number => chartSeriesData[0].data.indexOf(value);
        // const lowestValue = Math.min(...chartSeriesData);
        // const maxValue = Math.max(...lineChartData);
        //   const lowestValueIndex = getIndex(lowestValue);
        //   const maxValueIndex = getIndex(maxValue);
        //   chartContext.addPointAnnotation({
        //     x: lowestValueIndex,
        //     y: lowestValue,
        //     label: {
        //       text: "Lowest Force",
        //       borderColor: "#FF4560",
        //       style: {
        //         color: "#fff",
        //         background: "#FF4560",
        //       },
        //     },
        //   });
        // },
      },
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    stroke: {
      // curve: "straight",
      //   curve: "stepline",
      curve: "smooth",
    },
    xaxis: {
      axisTicks: {
        show: true,
      },
      type: "category",

      labels: {
        show: true,
        rotate: 0,
        formatter: function (val: string) {
          return +val % 10 === 0 ? val : "";
        },
      },
      // labels: {
      // },

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
          y: 15,
          borderColor: "#f08901",
          label: {
            borderColor: "#f08901",
            style: {
              color: "#fff",
              background: "#f08901",
            },
            text: "Force target: " + "15",
          },
        },
      ],
      points: [
        {
          x: maxValue,
          y: getIndex(maxValue),
          marker: {
            strokeColor: "#FF4560",
            // offsetX: 10,
          },
          seriesIndex: 0,
          label: {
            text: "Max Force",
            borderColor: "#FF4560",
            style: {
              color: "#fff",
              background: "#FF4560",
            },
          },
        },
        {
          x: lowestValue,
          y: getIndex(lowestValue),
          marker: {
            strokeColor: "#775dd0",
            // offsetX: 10,
          },
          seriesIndex: 0,
          label: {
            text: "Min Force",
            borderColor: "#775dd0",
            style: {
              color: "#fff",
              background: "#775dd0",
            },
          },
        },
      ],
    },
  };

  return (
    <>
      <Modal
        open={props.open}
        // onClose={() => set}
        size={"md"}
        overflow={true}
        backdrop={"static"}
        keyboard={false}
        className="summaryModal"
      >
        <Modal.Header closeButton={false}>
          <Modal.Title>
            <FlexboxGrid justify="space-between" align="middle">
              Test Summary {date.toLocaleDateString()}{" "}
              {date.toLocaleTimeString().slice(0, -3)}
              <SplitButton
                onClick={(saveOptions: SaveOptions) => {
                  const blob = new Blob(["Hello, world!"], {
                    type: "text/plain;charset=utf-8",
                  });
                  FileSaver.saveAs(blob, "hello world.txt");
                }}
              />
            </FlexboxGrid>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="Summary"
            style={{
              textAlign: "center",
              padding: 20,
            }}
          >
            <Chart
              options={chartOptions}
              series={chartSeriesData}
              type="line"
              height="300"
            />
            <Row gutter={20}>
              <Col md={6}>
                <DashboardPanel
                  style={{
                    background:
                      "linear-gradient(87deg, #f5365c 0, #f56036 100%)",
                    color: "white",
                  }}
                >
                  Cycles
                  <h2>{props.data?.sessionSettings.iterations}</h2>
                </DashboardPanel>
              </Col>
              <Col md={6}>
                <DashboardPanel
                  style={{
                    background:
                      "linear-gradient(87deg, #fb6340 0, #fbb140 100%)",
                    color: "white",
                  }}
                >
                  FORCE
                  <h2>{props.data?.sessionSettings.force}N</h2>
                </DashboardPanel>
              </Col>
              <Col md={6}>
                <DashboardPanel
                  style={{
                    background:
                      "linear-gradient(87deg, #2dce89 0, #2dcecc 100%)",
                    color: "white",
                  }}
                >
                  ERROR
                  <h2>+/-5</h2>
                </DashboardPanel>
              </Col>
              <Col md={6}>
                <DashboardPanel
                  style={{
                    background:
                      "linear-gradient(87deg, #11cdef 0, #1171ef 100%)",
                    color: "white",
                  }}
                >
                  TIME ELAPSED
                  <h2>{convertSecondsToISO(props.data?.time ?? 0)}</h2>
                </DashboardPanel>
              </Col>
            </Row>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SummaryModel;
