/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2022 Metrological
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
declare class StageUtils {
  static mergeColors(c1: number, c2: number, p: number): number;
  static mergeNumbers(v1: number, v2: number, p: number): number;
  static rgb(r: number, g: number, b: number): number;
  static rgba(r: number, g: number, b: number, a: number): number;
  static getRgbaString(c: number): string;
  static mergeColorAlpha(c: number, alpha: number): number;

  static getRgbComponentsNormalized(argb: number): Array<number>;
  static getRgbaComponentsNormalized(argb: number): Array<number>;
}

export default StageUtils;