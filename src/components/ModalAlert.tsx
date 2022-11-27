import { useState } from "react";
import { Button, Message, Modal } from "rsuite";
import { ModalState } from "../Models/types";
import RemindRoundIcon from "@rsuite/icons/RemindRound";

const ModalAlert = (props: { message: string; state: ModalState }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (props.state === ModalState.Open) handleOpen();
  if (props.state === ModalState.Closed) handleClose();

  return (
    <>
      <Modal open={open} onClose={handleClose} size={"xs"}>
        <Modal.Header>
          <Modal.Title>
            {" "}
            <RemindRoundIcon style={{ color: "#f08901", fontSize: 30 }} /> Error
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{props.message}</Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose} appearance="primary" color={"orange"}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalAlert;
