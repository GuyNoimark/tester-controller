import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
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
  Modal,
} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import SessionInput from "./Components/SessionSettingsPanel";
import ModalAlert from "./Components/ModalAlert";
import socketIOClient from "socket.io-client";
import ChartPanel from "./Components/ChartPanel";
import { ModalState } from "./Models/types";
import RemindRoundIcon from "@rsuite/icons/RemindRound";
import { ConnectionStatus } from "./Models/ConnectionState";
import { Hash, Aperture } from "react-feather";
import DashboardPanel from "./Components/DashboardPanel";
import SummaryModal from "./Components/SummaryModal";

function App() {
  const [theme, setTheme] = useState<
    "light" | "dark" | "high-contrast" | undefined
  >("light");

  const switchTheme = (e: any) => setTheme(e.target.value);

  const [show, setShow] = React.useState(true);
  const onChange = () => setShow(!show);

  const [forceTarget, setForceTarget] = useState(1000);
  const [iterations, setIterations] = useState(0);
  const [progressValue, setProgressValue] = useState(0);

  const defaultPadding = 30;

  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [getPorts, setGetPorts] = useState(false);
  // ipcRenderer.send("searchSerialPort", "test");

  // const ENDPOINT = "http://127.0.0.1:4001";
  // const [response, setResponse] = useState("");

  // const [reloadPorts, setReloadPorts] = useState(false);

  enum AppState {
    CONFIGURE,
    IN_TEST,
    STOP,
    DONE,
    ERROR,
  }

  const getProgress = async () => await window.electronAPI.getSerialPorts();

  useEffect(() => {
    const getResponse = async () => await window.electronAPI.getSerialPorts();
    setTimeout(
      () =>
        getResponse().then((response: ConnectionStatus) => {
          if (response !== ConnectionStatus.BOTH_DEVICES_ARE_CONNECTED) {
            setErrorMessage(response.toString());
            setOpen(true);
          } else {
            console.log("Devices Connected");
            setOpen(false);
            setGetPorts(false);
          }
          setGetPorts(false);
        }),
      500
    );

    const removeEventListener = window.electronAPI.getErrors(
      (event: any, error: string) => {
        setErrorMessage(error);
        setOpen(true);
      }
    );
    return () => {
      removeEventListener();
    };
  }, [getPorts]);

  useEffect(() => {
    const removeEventListenerGetProgress = window.electronAPI.getProgress(
      (event: any, value: number) =>
        setProgressValue((value / iterations) * 100)
    );
    return () => {
      removeEventListenerGetProgress();
    };
  });

  const padding = 30;
  return (
    <CustomProvider theme={theme}>
      <div
        className="App"
        style={{
          textAlign: "center",
          padding: defaultPadding,
        }}
      >
        {/* <ButtonToolbar>
          <Button appearance="default" onClick={switchTheme} value="light">
            Light theme
          </Button>
          <Button appearance="primary" onClick={switchTheme} value="dark">
            Dark theme
          </Button>
        </ButtonToolbar> */}
        {/* <Divider></Divider> */}
        <div>
          <Grid fluid>
            <Row gutter={padding}>
              <Col md={8}>
                <Stack
                  direction="column"
                  spacing={padding}
                  alignItems="stretch"
                >
                  {/* <div style={{ pointerEvents: "none", opacity: "0.4" }}> */}
                  <SessionInput
                    // onPropertyChange={(formData) => }
                    onClickStop={() => {
                      window.electronAPI.stopTest();
                      setForceTarget(1000);
                      setProgressValue(0);
                    }}
                    onClickStart={(formData) => {
                      setForceTarget(formData.force);
                      setIterations(formData.iterations);
                      window.electronAPI.writeArduino(formData);
                    }}
                  ></SessionInput>
                  {/* </div> */}
                  {/* <Button
                    onClick={() => {
                      window.electronAPI.readArduino();
                    }}
                  >
                    Read
                  </Button> */}
                  <Panel
                    // header="Session Progress"
                    header={
                      <Progress.Line percent={progressValue} status="active" />
                    }
                    shaded
                    bordered
                    collapsible
                    // className="overlay"
                    // style={{
                    //   background:
                    //     "linear-gradient(87deg, #f5365c 0, #f56036 100%)",
                    // }}
                  >
                    <Stack
                      direction="column"
                      spacing={padding}
                      alignItems="stretch"
                    >
                      {/* <Progress.Line percent={45} status="active" /> */}
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
                <Stack
                  spacing={padding}
                  direction="column"
                  alignItems="stretch"
                >
                  <Row>
                    <ChartPanel forceTarget={forceTarget} />
                  </Row>
                  <Row gutter={padding}>
                    <Col md={12}>
                      <DashboardPanel header="TEST">HI</DashboardPanel>
                    </Col>
                    <Col md={12}>
                      <Panel
                        title="PROGRESS"
                        expanded={true}
                        shaded
                        bordered
                        style={{
                          background:
                            "linear-gradient(87deg, #2dce89 0, #2dcecc 100%)",
                        }}
                      >
                        <Aperture color="white" />
                      </Panel>
                    </Col>
                  </Row>
                </Stack>
              </Col>
            </Row>
          </Grid>
          <SummaryModal data={[]} state={ModalState.Open} />
          <Modal
            open={false}
            onClose={() => setOpen(false)}
            backdrop={"static"}
            role="alertdialog"
            keyboard={false}
            size={"xs"}
          >
            <Modal.Header closeButton={false}>
              <Modal.Title>
                {" "}
                <RemindRoundIcon
                  style={{ color: "#f08901", fontSize: 30 }}
                />{" "}
                Error
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>{errorMessage}</Modal.Body>
            <Modal.Footer>
              <Button
                onClick={() => setGetPorts(true)}
                appearance="primary"
                color={"orange"}
                style={{
                  background: "linear-gradient(87deg, #f5365c 0, #f56036 100%)",
                }}
                loading={getPorts}
              >
                Try Again
              </Button>
            </Modal.Footer>
          </Modal>

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
