import { useEffect, useState } from "react";
import {
  Button,
  ButtonToolbar,
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
import { convertSecondsToISO, findSpikes, movingAverage } from "../utils/utils";
import * as htmlToImage from "html-to-image";
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from "html-to-image";
import { saveAs } from "file-saver";
import { useUpdateEffect } from "rsuite/esm/utils";
import ItamarLogo from "../assets/logos/ItamarFavicon-2.png";
const FileSaver = require("file-saver");

const SummaryModel = (props: {
  data?: SummaryPanelData;
  open: boolean;
  onClose(): void;
}) => {
  // if (props.state === ModalState.Open) handleOpen();
  // if (props.state === ModalState.Closed) handleClose();
  // console.log(props.data?.lineChartData);

  const [open, setOpen] = useState(props.open);

  useEffect(() => setOpen(props.open), [props.open]);
  useEffect(() => {
    const renderTime = new Date();
    console.log(renderTime.getMilliseconds());
  }, []);

  const date = new Date();

  let _csvChartData = props.data?.lineChartData;

  let _lineChartData: number[] = [];

  const positiveValuesCount: number =
    props.data?.lineChartData.filter((value) => value > 0).length ?? 0;
  const samplesPerRepetition: number = +(
    positiveValuesCount / props.data?.sessionSettings.iterations!
  ).toFixed(0);

  props.data?.lineChartData.map((value: any, index: any) =>
    value > 0 ? _lineChartData.push(value) : ""
  );

  const getIndex = (value: number): number => _lineChartData.indexOf(value);
  const lowestValue = Math.min(..._lineChartData);
  const maxValue: number = Math.max(..._lineChartData);
  const realMaxValue: number = Math.max(...(_csvChartData ?? [100]));
  const maxValueIndex: number = getIndex(maxValue);

  const repNumberToView = 10;
  const rangeToView = repNumberToView * samplesPerRepetition;

  let startOfRange =
    maxValueIndex - samplesPerRepetition * (repNumberToView / 2);
  let endOfRange = maxValueIndex + samplesPerRepetition * (repNumberToView / 2);

  if (startOfRange < 0) {
    endOfRange += Math.abs(startOfRange);
    startOfRange = 0;
  } else if (endOfRange > _lineChartData.length) {
    startOfRange -= endOfRange - _lineChartData.length;
    endOfRange = _lineChartData.length;
  }

  let wantedRange = _lineChartData.slice(startOfRange, endOfRange);

  wantedRange = movingAverage(wantedRange, 15);

  // console.log({
  //   start: startOfRange,
  //   end: endOfRange,
  //   maxValueIndex: maxValueIndex,
  //   samplesPer: samplesPerRepetition,
  // });
  const spikes: number[][] = findSpikes(_csvChartData ?? []);
  const maxValuesInSpikes = spikes.map((spike: number[]) => Math.max(...spike));
  const averageForce =
    maxValuesInSpikes.reduce((prev, curr) => prev + curr) /
    maxValuesInSpikes.length;

  console.log(maxValuesInSpikes.length, averageForce);

  // const spike = _csvChartData?.reduce((resultArray, item, index) => {
  //   item > 0 ? _csvChartData?.findIndex((val) => val ===0 )

  //   return resultArray;
  // }, []);
  // console.log(samplesPerRepetition);
  // console.log(wantedRange);

  // props.data?.lineChartData.map((value, index) =>
  //   index % 100 === 0 ? _lineChartData.push(value) : ""
  // );

  // const _lineChartData: number[] = props.data?.lineChartData ?? [];
  // const _lineChartData: number[] =
  //   Array.from({ length: 40 }, () => Math.floor(Math.random() * 40 - 20)) ?? [];

  const chartSeriesData: ApexAxisChartSeries = [
    // { name: "sensorValue", data: [0, 5, 1, 4] },
    {
      data: wantedRange,
    },
  ];

  // console.log(
  //   _csvChartData?.filter(
  //     (number) => number > props.data!.sessionSettings.force
  //   )
  // );

  // console.log(maxValueIndex, maxValue);

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      id: "summary",
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
        enabled: true,
      },
    },
    stroke: {
      // curve: "straight",
      //   curve: "stepline",
      curve: "smooth",
    },
    title: {
      text: `Shows ${repNumberToView} cycles (Out of ${props.data?.sessionSettings.iterations})`,
      align: "left",
      style: {
        fontSize: "12px",
        fontWeight: 200,
        fontFamily: undefined,
        color: "#868686",
      },
    },
    xaxis: {
      axisTicks: {
        show: true,
      },
      type: "category",

      labels: {
        show: true,
        rotate: 0,
        hideOverlappingLabels: true,
        style: { colors: "white" },
        formatter: function (val: string) {
          return val;
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
          y: props.data?.sessionSettings.force,
          borderColor: "#f08901",
          label: {
            borderColor: "#f08901",
            style: {
              color: "#fff",
              background: "#f08901",
            },
            text: "Force target: " + props.data?.sessionSettings.force,
          },
        },
      ],
      points: [
        {
          x: maxValueIndex - startOfRange,
          // x: ,
          // y: 12.13,
          y: maxValue,
          // x: maxValue,
          // y: getIndex(maxValue),
          marker: {
            strokeColor: "#FF4560",
            // offsetX: 10,
          },
          seriesIndex: 0,
          label: {
            text: `Max Force ${realMaxValue}`,
            borderColor: "#FF4560",
            style: {
              color: "#fff",
              background: "#FF4560",
            },
          },
        },
        // {
        //   x: lowestValue,
        //   y: getIndex(lowestValue),
        //   marker: {
        //     strokeColor: "#775dd0",
        //     // offsetX: 10,
        //   },
        //   seriesIndex: 0,
        //   label: {
        //     text: "Min Force",
        //     borderColor: "#775dd0",
        //     style: {
        //       color: "#fff",
        //       background: "#775dd0",
        //     },
        //   },
        // },
      ],
    },
  };

  return (
    <>
      <Modal
        open={open}
        // onClose={() => set}
        size={"md"}
        overflow={true}
        backdrop={"static"}
        keyboard={false}
        className="summaryModal"
        id={"screenshotArea"}
        // onEntered={() => setTimeout(() => {}, 2000)}
      >
        <Modal.Header closeButton={false}>
          <Modal.Title>
            <FlexboxGrid justify="space-between" align="middle">
              <Stack spacing={10}>
                <div style={{ width: 20 }}></div>
                <img src={ItamarLogo} width={30} />
                {`Test Summary
                ${date.toLocaleDateString("en-GB")}
                ${date.toLocaleTimeString("en-GB").slice(0, -3)}`}
              </Stack>
              <ButtonToolbar>
                <SplitButton
                  onClick={(saveOptions: SaveOptions) => {
                    const formattedDate = date.toLocaleDateString("en-GB");
                    const formattedTime = date.toLocaleTimeString("en-GB");
                    const saveAsFileName = formattedDate + "_" + formattedTime;
                    console.log(formattedDate, formattedTime);

                    if (saveOptions === SaveOptions.SAVE_AS_CSV) {
                      const blob = new Blob(
                        _csvChartData?.map((value) =>
                          value.toString().concat(",\n")
                        ),
                        {
                          type: "text/plain;charset=utf-8",
                        }
                      );
                      FileSaver.saveAs(blob, `${saveAsFileName}.csv`);
                    } else if (saveOptions === SaveOptions.SAVE_AS_PICTURE) {
                      const imageArea =
                        document.getElementById("screenshotArea");

                      htmlToImage.toBlob(imageArea!).then(function (blob: any) {
                        console.log("save");
                        if (window.saveAs) {
                          window.saveAs(blob ?? "", `${saveAsFileName}.png`);
                        } else {
                          FileSaver.saveAs(blob, `${saveAsFileName}.png`);
                        }
                      });
                    }
                  }}
                />
                <Button
                  style={{ backgroundColor: "#d3d3d3" }}
                  appearance="default"
                  onClick={() => {
                    setOpen(false);
                    props.onClose();
                  }}
                >
                  Close
                </Button>
              </ButtonToolbar>
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
                  AVERAGE FORCE
                  <h2>{averageForce.toFixed(2)}</h2>
                  {/* DEVICE ERROR
                  <h2>
                    ±
                    {(
                      averageForce - props.data?.sessionSettings.force!
                    ).toFixed(2)}
                  </h2> */}
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
