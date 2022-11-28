import {
  ButtonGroup,
  Button,
  Whisper,
  Popover,
  Dropdown,
  IconButton,
} from "rsuite";
import ArrowDownIcon from "@rsuite/icons/ArrowDown";
import { useState } from "react";

const options = ["Save as JSON", "Save as CSV", "Save as Picture", "Close"];

const SplitButton = (props: { onClick(): void }) => {
  const [action, setAction] = useState(0);
  return (
    <ButtonGroup>
      <Button onClick={props.onClick} appearance="primary">
        {options[action]}
      </Button>
      <Whisper
        placement="bottomEnd"
        trigger="click"
        speaker={({ onClose, left, top, className }, ref) => {
          const handleSelect = (eventKey: any) => {
            onClose();
            setAction(eventKey);
            console.log(eventKey);
          };
          return (
            <Popover ref={ref} className={className} style={{ left, top }} full>
              <Dropdown.Menu onSelect={handleSelect}>
                {options.map((item, index) => (
                  <Dropdown.Item key={index} eventKey={index}>
                    {item}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Popover>
          );
        }}
      >
        <IconButton appearance="primary" icon={<ArrowDownIcon />} />
      </Whisper>
    </ButtonGroup>
  );
};

export default SplitButton;
