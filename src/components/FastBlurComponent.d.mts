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
import Component from "../application/Component.mjs";
import Element from "../tree/Element.mjs";

declare namespace FastBlurComponent {
  export interface TemplateSpec<ContentType extends Element = Element> extends Component.TemplateSpec {
    /**
     * Content can be any Element / Component
     *
     * It is patched into the FastBlurComponent
     */
    content: Element.PatchTemplate<Element.ExtractTemplateSpec<ContentType>>;

    /**
     * X Padding
     */
    paddingX: number;

    /**
     * Y Padding
     */
    paddingY: number;

    /**
     * Sets the amount of blur. A value between 0 and 4. Goes up exponentially for blur.
     * Best results for non-fractional values.
     */
    amount: number;
  }
}

declare class FastBlurComponent<
  ContentType extends Element = Element
>
  extends Component<FastBlurComponent.TemplateSpec<ContentType>>
{
  get content(): ContentType;
  set content(v: Element.PatchTemplate<Element.ExtractTemplateSpec<ContentType>>);

  /**
   * X Padding
   *
   * @remarks
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link FastBlurComponent.TemplateSpec.paddingX}
   */
  paddingX: number;

  /**
   * Y Padding
   *
   * @remarks
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link FastBlurComponent.TemplateSpec.paddingY}
   */
  paddingY: number;

  amount: number;

  // Purposely not exposed:
  // readonly wrap: C2dFastBlurComponent | WebGLFastBlurComponent;
  // - Used only internally
}

export default FastBlurComponent;
