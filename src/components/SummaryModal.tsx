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
import { ModalState } from "../Models/types";
import RemindRoundIcon from "@rsuite/icons/RemindRound";
import Chart from "react-apexcharts";
import DashboardPanel from "./DashboardPanel";
import SplitButton from "./SplitButton";

const SummaryModel = (props: { data: number[]; state: ModalState }) => {
  const [open, setOpen] = useState(true);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // if (props.state === ModalState.Open) handleOpen();
  // if (props.state === ModalState.Closed) handleClose();

  const date = new Date();

  const lineChartData: number[] = Array.from({ length: 100 }, () =>
    Math.floor(Math.random() * 20)
  );

  const chartSeriesData: ApexAxisChartSeries = [
    // { name: "sensorValue", data: [0, 5, 1, 4] },
    {
      data: lineChartData,
    },
  ];

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
        //   // const lowestValue = Math.min(...chartSeriesData);
        //   // const maxValue = Math.max(...lineChartData);
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
          x: 50,
          y: 10,
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
          x: 50,
          y: 0,
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
        open={open}
        onClose={handleClose}
        size={"md"}
        overflow={true}
        backdrop={"static"}
        keyboard={false}
        className="summaryModal"
      >
        <Modal.Header closeButton={false}>
          <Modal.Title>
            <FlexboxGrid justify="space-between">
              Test Summary {date.toLocaleDateString()}{" "}
              {date.toLocaleTimeString().slice(0, -3)}
              <SplitButton onClick={() => {}} />
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
                  <h2>85</h2>
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
                  <h2>20N</h2>
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
                  <h2>15:35</h2>
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
