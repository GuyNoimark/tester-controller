import "rsuite/dist/rsuite.min.css";

import RemindRoundIcon from "@rsuite/icons/RemindRound";
import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  CustomProvider,
  Grid,
  Modal,
  Panel,
  Progress,
  Row,
  Stack,
  Timeline,
} from "rsuite";

import ItamarLogo from ".//assets/logos/ItamarFavicon-2.png";
import ChartPanel from "./Components/ChartPanel";
import DashboardPanel from "./Components/DashboardPanel";
import SessionInput from "./Components/SessionSettingsPanel";
import SummaryModal from "./Components/SummaryModal";
import { ConnectionStatus } from "./Models/ConnectionState";
import { SummaryPanelData } from "./Models/types";
import OnboardingModal from "./Components/OnboardingModal";

function App() {
  const [theme, setTheme] = useState<
    "light" | "dark" | "high-contrast" | undefined
  >("light");

  const switchTheme = (e: any) => setTheme(e.target.value);

  const [forceTarget, setForceTarget] = useState(0);
  const [iterations, setIterations] = useState(0);
  const [progressValue, setProgressValue] = useState(0);

  const defaultPadding = 30;

  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [getPorts, setGetPorts] = useState(false);

  const [resetSettingsPanel, setResetSettingsPanel] = useState(false);
  const [openSummaryModal, setOpenSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryPanelData>();

  const [startTest, setStartTest] = useState(false);

  const [openOnboardingModal, setOpenOnboardingModal] = useState(true);

  // enum AppState {
  //   CONFIGURE,
  //   IN_TEST,
  //   STOP,
  //   DONE,
  //   ERROR,
  // }

  useEffect(() => console.log("render"));

  useEffect(() => {
    const removeEventListener = window.electronAPI.getErrors(
      (event: any, error: string) => {
        setErrorMessage(error);
        setOpen(true);
      }
    );
    return () => {
      removeEventListener();
    };
  }, []);

  useEffect(() => {
    const removeEventListenerGetProgress = window.electronAPI.getProgress(
      (event: any, value: number) => {
        setProgressValue((value / iterations) * 100);

        if ((value / iterations) * 100 === 100) {
          window.electronAPI.stopTest();

          const getSummary = async () => await window.electronAPI.getSummary();
          getSummary().then((response: SummaryPanelData) => {
            setSummaryData(response);
            console.log(response);
            setOpenSummaryModal(true);
            setResetSettingsPanel(false);
            setForceTarget(0);
            setStartTest(false);
            // const interval = setInterval(function () {
            //   clearInterval(interval);
            // }, 1000);
          });
        }
      }
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
          // background:
          //   "linear-gradient(87deg, rgba(2,0,36,1) 0%, rgba(7,71,114,1) 35%, rgba(8,162,155,1) 100%)",
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
            <Stack direction="column" spacing={padding} alignItems="stretch">
              <DashboardPanel>
                <img src={ItamarLogo} width={50} alt={""} />
              </DashboardPanel>
              <Row gutter={padding}>
                <Col md={6}>
                  <Stack
                    direction="column"
                    spacing={padding}
                    alignItems="stretch"
                  >
                    <SessionInput
                      resetForm={resetSettingsPanel}
                      onClickStop={() => {
                        window.electronAPI.stopTest();
                        setForceTarget(0);
                        setProgressValue(0);
                        setResetSettingsPanel(true);
                        setStartTest(false);
                      }}
                      onClickStart={(formData) => {
                        setForceTarget(formData.force);
                        setIterations(formData.iterations);
                        setStartTest(true);
                        window.electronAPI.writeArduino(formData);
                      }}
                    ></SessionInput>

                    <Panel
                      header={
                        <Progress.Line
                          percent={+progressValue.toFixed(0)}
                          status="active"
                        />
                      }
                      shaded
                      bordered
                      collapsible
                    >
                      <Stack
                        direction="column"
                        spacing={padding}
                        alignItems="stretch"
                      >
                        <Timeline>
                          <Timeline.Item>
                            16:27:41 Session Started
                          </Timeline.Item>
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
                <Col md={18}>
                  <Stack
                    spacing={padding}
                    direction="column"
                    alignItems="stretch"
                  >
                    <Row>
                      <DashboardPanel disabled={false}>
                        <ChartPanel
                          forceTarget={forceTarget}
                          pause={!startTest}
                        />
                      </DashboardPanel>
                    </Row>
                    {/* <Row gutter={padding}>
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
                  </Row> */}
                  </Stack>
                </Col>
              </Row>
            </Stack>
          </Grid>
          <OnboardingModal
            open={openOnboardingModal}
            onClose={() => {
              const getResponse = async () =>
                await window.electronAPI.getSerialPorts();
              setTimeout(
                () =>
                  getResponse().then((response: ConnectionStatus) => {
                    if (
                      response !== ConnectionStatus.BOTH_DEVICES_ARE_CONNECTED
                    ) {
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
            }}
          />
          <SummaryModal
            data={summaryData}
            open={openSummaryModal}
            onClose={() => {
              setResetSettingsPanel(true);
              setProgressValue(0);
              setOpenSummaryModal(false);
            }}
          />
          <Modal
            open={open}
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
                // onClick={() => setGetPorts(true)}
                onClick={() => {
                  window.electronAPI.closeApp();
                }}
                appearance="primary"
                color={"orange"}
                style={{
                  background: "linear-gradient(87deg, #f5365c 0, #f56036 100%)",
                }}
                // loading={getPorts}
              >
                Close App
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </CustomProvider>
  );
}

export default App;
