import { ReactNode, useEffect, useState } from "react";
import {
  FcAdvance,
  FcCableRelease,
  FcCommandLine,
  FcFlashOn,
  FcHighPriority,
  FcIdea,
} from "react-icons/fc";
import { Button, Divider, FlexboxGrid, Modal, Panel, Stack } from "rsuite";

const OnboardingModal = (props: { open: boolean; onClose(): void }) => {
  const [open, setOpen] = useState(props.open);

  useEffect(() => setOpen(props.open), [props.open]);

  type PanelData = {
    icon: ReactNode;
    text: string;
  };

  type OnboardingPage = {
    title: string;
    panels: PanelData[];
  };

  type OnboardingModalData = {
    onboardingPages: OnboardingPage;
  };

  const defaultIconSize = 40;

  const page1: OnboardingPage = {
    title: "Welcome to the control unit!",
    panels: [
      {
        icon: <FcHighPriority size={defaultIconSize} />,
        text: "Before you start, please make sure to follow the instructions",
      },
      {
        icon: <FcCableRelease size={defaultIconSize} />,
        text: "Please check that you have 2 USB cables (USB-A to USB-B)",
      },
    ],
  };

  const page2: OnboardingPage = {
    title: "A few connections you need to make:",

    panels: [
      {
        icon: <FcIdea size={defaultIconSize} />,
        text: "Plug the power supply to the power outlet. Then, connect the DC plug to the electronics box and turn the red switch on",
      },
      {
        icon: <FcAdvance size={defaultIconSize} />,
        text: " Connect one USB-B cable to the force gauge and one to the electronics box. Then, connect the other ends to the computer",
      },
    ],
  };

  const page3: OnboardingPage = {
    title: "Pay attention!",
    panels: [
      {
        icon: <FcFlashOn size={defaultIconSize} />,
        text: "The power supply should output 7.5 Volts in order for the machine to run properly",
      },
      {
        icon: <FcCommandLine size={defaultIconSize} />,
        text: "In order to set the test configuration, you must specify the amount of repetitions, the target force and the desired direction",
      },
    ],
  };

  const pages: OnboardingPage[] = [page1, page2, page3];

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const isFirstPage: boolean = currentPageIndex === 0;
  const isLastPage: boolean = currentPageIndex === pages.length - 1;

  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size={"sm"}
        overflow={false}
        className="OnboardingModal"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title style={{ fontSize: 28, fontWeight: "bold" }}>
            Hello! 👋
          </Modal.Title>
        </Modal.Header>
        <Divider></Divider>
        <Modal.Body>
          <div
            className="Summary"
            style={{
              padding: 5,
              paddingTop: 0,
            }}
          >
            <p style={{ fontSize: 16, fontWeight: "bold" }}>
              {pages[currentPageIndex].title}
            </p>

            <div
              style={{
                height: 20,
              }}
            ></div>
            {pages[currentPageIndex].panels.map(
              (panel: PanelData, index: number, panelsArray: PanelData[]) => (
                <>
                  <Panel style={{ background: "#f7f7f8" }}>
                    <Stack spacing={20}>
                      {panel.icon}
                      {panel.text}
                    </Stack>
                  </Panel>
                  {index !== panelsArray.length - 1 ? (
                    <div
                      style={{
                        height: 20,
                      }}
                    ></div>
                  ) : (
                    <></>
                  )}
                </>
              )
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <FlexboxGrid justify={isFirstPage ? "end" : "space-between"}>
            {!isFirstPage ? (
              <Button
                onClick={() => {
                  setCurrentPageIndex(currentPageIndex - 1);
                }}
                appearance="default"
              >
                Back
              </Button>
            ) : (
              ""
            )}

            <Button
              onClick={() => {
                isLastPage
                  ? setOpen(false)
                  : setCurrentPageIndex(currentPageIndex + 1);
              }}
              appearance={isLastPage ? "primary" : "default"}
            >
              {isLastPage ? "Done" : "Next"}
            </Button>
          </FlexboxGrid>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OnboardingModal;
