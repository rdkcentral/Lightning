// Exposes the ux namespace for apps.

import Ui from "./Ui.js";
import AppDefinition from "./AppDefinition.js";
import App from "./App.js";

import tools from "./tools/tools.js";

const ux = {
    Ui,
    AppDefinition,
    App,
    tools
};

window.ux = ux;

export default ux;