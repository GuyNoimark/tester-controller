import { Panel } from "rsuite";

const DashboardPanel = (props: {
  header?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  children?: any;
}) => {
  // props.activated = props.activated === undefined ? true : props.activated;

  return (
    <>
      <div
        style={props.disabled ? { pointerEvents: "none", opacity: "0.4" } : {}}
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
