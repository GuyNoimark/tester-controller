"use strict";
exports.__esModule = true;
exports.SaveOptions = exports.ModalState = void 0;
var ModalState;
(function (ModalState) {
    ModalState[ModalState["Open"] = 0] = "Open";
    ModalState[ModalState["Closed"] = 1] = "Closed";
})(ModalState = exports.ModalState || (exports.ModalState = {}));
var SaveOptions;
(function (SaveOptions) {
    SaveOptions["SAVE_AS_CSV"] = "Save As CSV";
    SaveOptions["SAVE_AS_PICTURE"] = "Save As Picture";
    // Close,
})(SaveOptions = exports.SaveOptions || (exports.SaveOptions = {}));
// RED      background: "linear-gradient(87deg, #f5365c 0, #f56036 100%)"
// Orange   background: "linear-gradient(87deg, #fb6340 0, #fbb140 100%)"
// GREEN    background: "linear-gradient(87deg, #2dce89 0, #2dcecc 100%)"
// BLUE     background: "linear-gradient(87deg, #11cdef 0, #1171ef 100%)"
