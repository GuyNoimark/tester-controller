export type SessionSettingsModel = {
  iterations: number;
  force: number;
  push: boolean;
  stroke: number;
};

export enum ModalState {
  Open,
  Closed,
}

export type SummaryPanelData = {
  lineChartData: number[];
  sessionSettings: SessionSettingsModel;
  time: number;
};

// RED      background: "linear-gradient(87deg, #f5365c 0, #f56036 100%)"
// Orange   background: "linear-gradient(87deg, #fb6340 0, #fbb140 100%)"
// GREEN    background: "linear-gradient(87deg, #2dce89 0, #2dcecc 100%)"
// BLUE     background: "linear-gradient(87deg, #11cdef 0, #1171ef 100%)"
