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

/**
 * @internal
 * Text overflow settings
 */
export interface ISuffixInfo {
  suffix: string;
  nowrap: boolean;
}

/**
 * @internal
 * Text layout information
 */
export interface ILinesInfo {
  l: ILineInfo[];
  r?: string[];
}

/**
 * @internal
 * Word styling
 */
export interface ILineWordStyle {
  font: string;
  color: string;
}

/**
 * @internal
 * Layed out word information
 */
export interface ILineWord {
  text: string;
  width: number;
  style?: ILineWordStyle;
}

/**
 * @internal
 * Layed out line information
 */
export interface ILineInfo {
  text: string;
  words?: ILineWord[];
  width: number;
}

/**
 * @internal
 * Complete text layout information
 */
export interface IRenderInfo {
  lines: ILineInfo[];
  remainingText: string;
  moreTextLines: boolean;
  precision: number;
  w: number;
  h: number;
  width: number;
  innerWidth: number;
  height: number;
  fontSize: number;
  cutSx: number;
  cutSy: number;
  cutEx: number;
  cutEy: number;
  lineHeight: number;
  lineWidths: number[];
  offsetY: number;
  paddingLeft: number;
  paddingRight: number;
  letterSpacing: number;
  textIndent: number;
}

/**
 * @internal
 * Individual line render info
 */
export interface IDrawLineInfo {
  info: ILineInfo;
  x: number;
  y: number;
  w: number;
}
