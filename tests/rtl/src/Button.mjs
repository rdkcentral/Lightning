/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
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

export default class Button extends lng.Component {
  static _template() {
    return {
      h: 50,
      rect: true,
      color: 0xff333333,
      flex: { padding: 10 },
      flexItem: {
        marginRight: 20,
      },
      Label: {
        text: {
          fontFace: "Arial",
          fontSize: 40,
          textColor: 0xbbffffff,
        },
      },
    };
  }

  _construct() {
    this.directionUpdatesCount = 0;
  }

  _init() {
    this.tag("Label").text.text = this.label;
  }

  _focus() {
    this.color = 0xffff3333;
  }

  _unfocus() {
    this.color = 0xff333333;
  }

  _onDirectionChanged() {
    this.directionUpdatesCount++;
  }
}
