import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
// import "react-flexr/styles.css";
import Chart from "react-apexcharts";
// import { SerialPort } from "serialport";

// import "./App.css";
import {
  Button,
  CustomProvider,
  ButtonToolbar,
  Panel,
  Placeholder,
  Row,
  Col,
  Content,
  Header,
  InputNumber,
  Progress,
  Divider,
  FlexboxGrid,
  Container,
  Stack,
  Grid,
  Animation,
  Toggle,
  RadioGroup,
  Radio,
  Timeline,
} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import SessionInput from "./components/SessionSettingsPanel";
import socketIOClient from "socket.io-client";

function App() {
  const [theme, setTheme] = useState<
    "light" | "dark" | "high-contrast" | undefined
  >("light");

  const switchTheme = (e: any) => setTheme(e.target.value);

  const [show, setShow] = React.useState(true);
  const onChange = () => setShow(!show);

  const defaultPadding = 20;

  let data: ApexAxisChartSeries = [
    { data: Array.from({ length: 40 }, () => Math.floor(Math.random() * 40)) },
  ];

  const ENDPOINT = "http://127.0.0.1:4001";
  const [response, setResponse] = useState("");

  const connectToArduino = () => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("FromAPI", (data) => {
      setResponse(data);
      socket.on("Disconnect", (data) => {
        console.log("DISCONNECTED");
      });
    });
    // if (socket.) console.log("DISCONNECTED");
  };

  return (
    <CustomProvider theme={theme}>
      <div
        className="App"
        style={{
          textAlign: "center",
          padding: defaultPadding,
        }}
      >
        {/* <Button appearance="primary">Hello World</Button> */}
        {/* <Header>
          <ButtonToolbar>
            <Button appearance="default" onClick={switchTheme} value="light">
              Light theme(default)
            </Button>
            <Button appearance="primary" onClick={switchTheme} value="dark">
              Dark theme
            </Button>
            <Button
              appearance="ghost"
              onClick={switchTheme}
              value="high-contrast"
            >
              High contrast theme
            </Button>
          </ButtonToolbar>
        </Header> */}
        {/* <Divider></Divider> */}
        <div>
          <Grid fluid>
            <Row gutter={20}>
              <Col md={8}>
                <Stack direction="column" spacing={20} alignItems="stretch">
                  <SessionInput onClick={connectToArduino}></SessionInput>
                  <Panel header="Session Progress" shaded>
                    <Stack direction="column" spacing={20} alignItems="stretch">
                      <Progress.Line percent={+response} status="active" />
                      <Timeline>
                        <Timeline.Item>16:27:41 Session Started</Timeline.Item>
                        <Timeline.Item>16:28:43 50% Done</Timeline.Item>

                        <Timeline.Item>
                          16:28:45 Test results available
                        </Timeline.Item>
                        <Timeline.Item>
                          02:34:41 Send to Shanghai Hongkou Company
                        </Timeline.Item>
                        <Timeline.Item>
                          15:05:29 Sending you a piece
                        </Timeline.Item>
                      </Timeline>
                    </Stack>
                  </Panel>
                </Stack>
              </Col>
              <Col md={16}>
                <Row>
                  <Panel expanded={true} shaded>
                    <Chart
                      options={{
                        chart: {
                          id: "realtime",
                          animations: {
                            enabled: true,
                            easing: "linear",
                            dynamicAnimation: {
                              speed: 1000,
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
                        },
                        // xaxis: {
                        //   type: 'datetime',
                        //   range: XAXISRANGE,
                        // },
                        yaxis: {
                          max: 50,
                        },
                      }}
                      series={data}
                      type="line"
                      // width="500"
                    />
                  </Panel>
                </Row>
              </Col>
            </Row>
          </Grid>
          {/* </Row>

          {/* <Row>
              <Col md={6} sm={12}>
                <Panel header="Iterations" shaded>
                  <InputNumber min={0} step={1} />
                </Panel>{" "}
              </Col>
              <Col md={6} sm={12}>
                <Panel header="Testing Progress" shaded>
                  <Progress.Line percent={30} status="active" />
                </Panel>{" "}
              </Col>
              <Col md={6} sm={12}>
                <Animation.Collapse in={show}>
                  {(props, ref) => (
                    <div {...props} ref={ref}>
                      <Panel header="Panel title" shaded>
                      </Panel>
                    </div>
                  )}
                </Animation.Collapse>
              </Col>
              <Col md={6} sm={12}>
                <Panel header="Control Buttons" shaded>
                  <FlexboxGrid justify="space-around">
                    <FlexboxGrid.Item>
                      <ButtonToolbar>
                        <Button
                          color="orange"
                          appearance="primary"
                          onClick={onChange}
                        >
                          Hide
                        </Button>
                        <Button color="green" appearance="primary">
                          Red
                        </Button>
                        <Button color="cyan" appearance="primary">
                          Orange
                        </Button>
                        <Button color="violet" appearance="primary">
                          Yellow
                        </Button>
                      </ButtonToolbar>
                    </FlexboxGrid.Item>
                  </FlexboxGrid>
                </Panel>{" "}
              </Col>
            </Row> */}
          {/* </Grid> */}
        </div>
      </div>
    </CustomProvider>
  );
}

export default App;
