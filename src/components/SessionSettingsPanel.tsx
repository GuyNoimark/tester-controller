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
} from "rsuite";
import SortUpIcon from "@rsuite/icons/SortUp";
import SortDownIcon from "@rsuite/icons/SortDown";

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

const validate = (formData: SessionSettingsModel): boolean | String => {
  if (!(formData.iterations > 0)) {
    return 'Field "Iterations" MUST be larger than 0';
  } else if (!(formData.force > 0)) {
    return 'Field "Force" MUST be larger than 0';
  } else {
    return true;
  }
};
type SessionSettingsModel = {
  iterations: number;
  force: number;
  push: boolean;
};

const SessionSettingsPanel = () => {
  const [formData, setData] = useState<SessionSettingsModel>({
    iterations: 0,
    force: 0,
    push: true,
  });

  return (
    <Panel header={"Session Settings"} shaded>
      <Stack direction="column" spacing={20} alignItems="stretch">
        <InputNumber
          min={0}
          step={1}
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
          min={0}
          step={1}
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
        >
          <Radio value="Push">
            <SortDownIcon /> Push
          </Radio>
          <Radio value="Pull">
            <SortUpIcon /> Pull
          </Radio>
        </RadioGroup>
        <Button
          appearance="primary"
          onClick={() => console.log(validate(formData))}
          block
        >
          Start Test Session
        </Button>
      </Stack>
    </Panel>
  );
};

export default SessionSettingsPanel;
