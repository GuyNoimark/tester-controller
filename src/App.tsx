import React, { useState } from "react";
import logo from "./logo.svg";
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
} from "rsuite";
import "rsuite/dist/rsuite.min.css";

function App() {
  const [theme, setTheme] = useState<
    "light" | "dark" | "high-contrast" | undefined
  >("light");

  const switchTheme = (e: any) => setTheme(e.target.value);

  const [show, setShow] = React.useState(true);
  const onChange = () => setShow(!show);

  return (
    <CustomProvider theme={theme}>
      <div className="App">
        <Header>
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
        </Header>
        <Divider></Divider>
        <Content>
          <Grid fluid={true}>
            <Row>
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
                        {/* <img src={logo}></img> */}
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
              {/* <Col></Col> */}
            </Row>
          </Grid>
        </Content>
      </div>
    </CustomProvider>
  );
}

export default App;
