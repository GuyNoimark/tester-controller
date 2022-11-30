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
import { ModalState, SummaryPanelData } from "./Models/types";
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

  const [resetSettingsPanel, setResetSettingsPanel] = useState(false);
  const [openSummaryModal, setOpenSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryPanelData>();

  enum AppState {
    CONFIGURE,
    IN_TEST,
    STOP,
    DONE,
    ERROR,
  }

  // useEffect(() => {
  //   const removeEventListener = window.electronAPI.getErrors(
  //     (event: any, error: string) => {
  //       setErrorMessage(error);
  //       setOpen(true);
  //     }
  //   );
  //   return () => {
  //     removeEventListener();
  //   };
  // }, [getPorts]);

  useEffect(() => {
    const removeEventListenerGetProgress = window.electronAPI.getProgress(
      (event: any, value: number) => {
        setProgressValue((value / iterations) * 100);
        if ((value / iterations) * 100 === 100) {
          window.electronAPI.stopTest();
          setForceTarget(1000);

          const getSummary = async () => await window.electronAPI.getSummary();
          getSummary().then((response: SummaryPanelData) => {
            setSummaryData(response);
            console.log(response);
            setOpenSummaryModal(true);
            setResetSettingsPanel(false);

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
                      setForceTarget(1000);
                      setProgressValue(0);
                      setResetSettingsPanel(true);
                    }}
                    onClickStart={(formData) => {
                      setForceTarget(formData.force);
                      setIterations(formData.iterations);
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
              <Col md={18}>
                <Stack
                  spacing={padding}
                  direction="column"
                  alignItems="stretch"
                >
                  <Row>
                    <DashboardPanel disabled={false}>
                      <ChartPanel forceTarget={forceTarget} />
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
          </Grid>
          <SummaryModal
            data={summaryData}
            open={openSummaryModal}
            onClose={() => {
              setResetSettingsPanel(true);
              setProgressValue(0);
              setOpenSummaryModal(false);
            }}
          />
        </div>
      </div>
    </CustomProvider>
  );
}

export default App;
