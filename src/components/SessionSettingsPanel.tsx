import React, { useState } from "react";
import {
  Panel,
  Stack,
  InputNumber,
  RadioGroup,
  Radio,
  Button,
  Form,
  Schema,
  Modal,
  Placeholder,
  Divider,
  Checkbox,
  Slider,
  Toggle,
} from "rsuite";
import SortUpIcon from "@rsuite/icons/SortUp";
import SortDownIcon from "@rsuite/icons/SortDown";
import RemindRoundIcon from "@rsuite/icons/RemindRound";
import { isInteger } from "lodash";
import { SessionSettingsModel } from "../Models/Models";

// const Field = React.forwardRef((props, ref) => {
//   // const { name, message, label, accepter, error, ...rest } = props;
//   return (
//     <Form.Group
//       controlId={`${name}-10`}
//       ref={ref}
//       className={error ? "has-error" : ""}
//     >
//       <Form.ControlLabel>{label} </Form.ControlLabel>
//       <Form.Control
//         name={name}
//         accepter={accepter}
//         errorMessage={error}
//         {...rest}
//       />
//       <Form.HelpText>{message}</Form.HelpText>
//     </Form.Group>
//   );
// });

const SessionSettingsPanel = (props: {
  onClickStart(data: SessionSettingsModel): void;
  onClickStop(): void;
}) => {
  const [formData, setData] = useState<SessionSettingsModel>({
    iterations: 0,
    force: 0,
    push: true,
  });
  const [validationErrorMessage, setValidationErrorMessage] =
    useState<string>("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [enableAdvanced, setEnableAdvanced] = useState(false);

  enum ButtonState {
    START_TEST,
    STOP_TEST,
    RESTART,
  }

  const [buttonState, setButtonState] = useState(ButtonState.START_TEST);

  const maxForceAllowed: number = 500;

  const validate = (formData: SessionSettingsModel): boolean | String => {
    // return !(formData.iterations > 0)
    //   ? 'Field "Iterations" MUST be larger than 0'
    //   : !(formData.iterations > 0)
    //   ? 'Field "Iterations" MUST be larger than 0'
    //   : !(formData.force > 0)
    //   ? 'Field "Force" MUST be larger than 0'
    //   : formData.force > maxForceAllowed
    //   ? 'Field "Force" MUST be smaller than ${maxForceAllowed}'
    //   : true;

    if (!(formData.iterations > 0))
      return 'Field "Iterations" MUST be larger than 0';
    else if (!isInteger(formData.iterations))
      return 'Field "Iterations" MUST be an integer';
    else if (!(formData.force > 0))
      return 'Field "Force" MUST be larger than 0';
    else if (!isInteger(formData.force))
      return 'Field "Force" MUST be an integer';
    else if (formData.force > maxForceAllowed)
      return 'Field "Force" MUST be smaller than ${maxForceAllowed}';
    else return true;
  };

  return (
    <>
      <Panel header={"Session Settings"} shaded bordered>
        <Stack direction="column" spacing={20} alignItems="stretch">
          <InputNumber
            min={0}
            step={1}
            // defaultValue={3}
            prefix="Iterations"
            onChange={(value) =>
              setData({
                iterations: +value,
                force: formData.force,
                push: formData.push,
              })
            }
          />
          <InputNumber
            min={1}
            step={1}
            // defaultValue={5}
            prefix="Neuton Force"
            onChange={(value) =>
              setData({
                iterations: formData.iterations,
                force: +value,
                push: formData.push,
              })
            }
          />
          {/* <Toggle
          size="lg"
          checkedChildren={"Push"}
          unCheckedChildren={"Pull"}
        /> */}
          <RadioGroup
            name="radioList"
            inline
            appearance="picker"
            defaultValue="Push"
            onChange={(value) =>
              setData({
                iterations: formData.iterations,
                force: formData.force,
                push: value === "Push" ? true : false,
              })
            }
          >
            <Radio value="Push">
              <SortDownIcon /> Push
            </Radio>
            <Radio value="Pull">
              <SortUpIcon /> Pull
            </Radio>
          </RadioGroup>
          <Divider>
            {
              <Toggle
                size={"md"}
                checkedChildren={"Advanced"}
                unCheckedChildren={"Advanced"}
                defaultChecked={false}
                onChange={(checked) => setEnableAdvanced(checked)}
              />
            }{" "}
          </Divider>
          <InputNumber disabled={!enableAdvanced} defaultValue={10} />
          <Slider
            disabled={!enableAdvanced}
            defaultValue={50}
            min={0}
            // step={10}
            max={100}
            progress
          />
          {/* <Toggle
            size="md"
            checkedChildren="Dark Mode"
            unCheckedChildren="Light Mode"
            disabled={!enableAdvanced}
          /> */}
          <Button
            appearance="primary"
            // color={buttonState === ButtonState.START_TEST ? {'Blue'} : {'Red'}}

            style={
              buttonState === ButtonState.START_TEST
                ? { background: "#1787e8" }
                : { background: "#eb3626" }
            }
            //   "linear-gradient(87deg, #11cdef 0, #1171ef 100%)",
            // }}
            onClick={() => {
              if (buttonState === ButtonState.START_TEST) {
                const validationResponse = validate(formData);
                if (typeof validationResponse === "string") {
                  setValidationErrorMessage(validationResponse.toString());
                  handleOpen();
                } else {
                  console.log("Start Test");
                  setButtonState(ButtonState.STOP_TEST);
                  props.onClickStart(formData);
                }
              } else {
                console.log("STOP!!!");
                props.onClickStop();
                setButtonState(ButtonState.START_TEST);
              }
            }}
            block
          >
            {buttonState === ButtonState.START_TEST
              ? "Start Test Session"
              : "STOP"}
          </Button>
        </Stack>
      </Panel>

      <Modal open={open} onClose={handleClose} size={"xs"}>
        <Modal.Header>
          <Modal.Title>
            {" "}
            <RemindRoundIcon style={{ color: "#f08901", fontSize: 30 }} /> Error
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{validationErrorMessage}</Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose} appearance="primary" color={"orange"}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SessionSettingsPanel;
