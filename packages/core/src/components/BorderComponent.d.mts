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

declare namespace BorderComponent {
  export interface TemplateSpec<ContentType extends Element = Element> extends Component.TemplateSpec {
    /**
     * Content can be any Element / Component
     *
     * It is patched into the BorderComponent
     */
    content: Element.PatchTemplate<Element.ExtractTemplateSpec<ContentType>>;

    /**
     * Border width
     *
     * @remarks
     * When patched, this sets the width of all borders
     */
    borderWidth: number;

    /**
     * Width of top border
     */
    borderWidthTop: number;

    /**
     * Width of right border
     */
    borderWidthRight: number;

    /**
     * Width of bottom border
     */
    borderWidthBottom: number;

    /**
     * Width of left border
     */
    borderWidthLeft: number;

    /**
     * Border color
     *
     * When patched, this sets the width of all borders
     */
    colorBorder: number;

    /**
     * Color of top border
     */
    colorBorderTop: number;

    /**
     * Color of right border
     */
    colorBorderRight: number;

    /**
     * Color of bottom border
     */
    colorBorderBottom: number;

    /**
     * Color of left border
     */
    colorBorderLeft: number;

    /**
     * Top border element / template
     *
     * @remarks
     * Use to customize the border beyond color/width
     */
    borderTop: Element.PatchTemplate<Element.TemplateSpecLoose>;

    /**
     * Top border element / template
     *
     * @remarks
     * Use to customize the border beyond color/width
     */
    borderRight: Element.PatchTemplate<Element.TemplateSpecLoose>;

    /**
     * Top border element / template
     *
     * @remarks
     * Use to customize the border beyond color/width
     */
    borderBottom: Element.PatchTemplate<Element.TemplateSpecLoose>;

    /**
     * Top border element / template
     *
     * @remarks
     * Use to customize the border beyond color/width
     */
    borderLeft: Element.PatchTemplate<Element.TemplateSpecLoose>;

    /**
     * Border template
     *
     * @remarks
     * When patched, applies the patch template to all borders
     */
    borders: Element.PatchTemplate<Element.TemplateSpecLoose>;
  }
}

declare class BorderComponent<ContentType extends Element = Element>
  extends Component<BorderComponent.TemplateSpec<ContentType>>
{
  // @ts-expect-error Prevent ts(2380)
  get content(): ContentType;
  set content(v: Element.PatchTemplate<Element.ExtractTemplateSpec<ContentType>>);

  borderWidth: number;
  borderWidthTop: number;
  borderWidthRight: number;
  borderWidthBottom: number;
  borderWidthLeft: number;

  colorBorder: number;
  colorBorderTop: number;
  colorBorderRight: number;
  colorBorderBottom: number;
  colorBorderLeft: number;

  get borderTop(): Element;
  set borderTop(v: Element.PatchTemplate<Element.TemplateSpecLoose>);

  get borderRight(): Element;
  set borderRight(v: Element.PatchTemplate<Element.TemplateSpecLoose>);

  get borderBottom(): Element;
  set borderBottom(v: Element.PatchTemplate<Element.TemplateSpecLoose>);

  get borderLeft(): Element;
  set borderLeft(v: Element.PatchTemplate<Element.TemplateSpecLoose>);

  /**
   * Border template
   *
   * @remarks
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link BorderComponent.TemplateSpec.borders}
   */
  borders: Element.PatchTemplate<Element.TemplateSpecLoose>;
}

export default BorderComponent;
