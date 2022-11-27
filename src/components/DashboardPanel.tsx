import { useState } from "react";
import { Button, Message, Modal, Panel } from "rsuite";

const DashboardPanel = (props: {
  header: string;
  style?: React.CSSProperties;
  activated?: boolean;
  children: any;
}) => {
  return (
    <>
      <div
        style={props.activated ? { pointerEvents: "none", opacity: "0.4" } : {}}
      >
        <Panel
          header={props.header}
          expanded={true}
          shaded
          bordered
          style={props.style}
        >
          {props.children}
        </Panel>
      </div>
    </>
  );
};

export default DashboardPanel;
