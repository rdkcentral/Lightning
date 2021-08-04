/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
