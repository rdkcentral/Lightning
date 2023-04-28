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
import Animation from "../animation/Animation.mjs";
import AnimationSettings, { AnimationForceLiteral } from "../animation/AnimationSettings.mjs";
import Transition from "../animation/Transition.mjs";
import TransitionSettings from "../animation/TransitionSettings.mjs";
import Component from "../application/Component.mjs";
import { AnimatableValueTypes, ExtractAnimatableValueTypes } from "../commonTypes.mjs";
import EventEmitter from "../EventEmitter.mjs";
import { CombineTagPaths, CombineTagPathsSingleLevel, Documentation, EventMapType, ReduceSpecificity, SpecToTagPaths, TextureType, ValidRef } from "../internalTypes.mjs";
import TextTexture from "../textures/TextTexture.mjs";
import ElementCore from "./core/ElementCore.mjs";
import ElementTexturizer from "./core/ElementTexturizer.mjs";
import ElementChildList from "./ElementChildList.mjs";
import Shader from "./Shader.mjs";
import Stage from "./Stage.mjs";
import Texture from "./Texture.mjs";
import TextureSource from "./TextureSource.mjs";

//
// Private types
//

/**
 * Filters out any non-ref keys from an inline Element template and returns the filtered
 * type with Strong Element template spec.
 *
 * @hidden Internal use only
 */
export type InlineElement<ElementTemplate> = {
  [P in keyof ElementTemplate as P extends ValidRef ? P : never]:
    ElementTemplate[P]
} & Element<Element.TemplateSpec>['__$type_TemplateSpec'];

/**
 * An object keyed by transitionable Element properties
 *
 * @hidden Internal use only
 */
export type SmoothTemplate<TemplateSpecType = Element.TemplateSpec> = {
  [P in keyof TemplateSpecType]?:
    ExtractAnimatableValueTypes<TemplateSpecType[P]> extends never
      ?
        never
      :
        ExtractAnimatableValueTypes<TemplateSpecType[P]> | [ ExtractAnimatableValueTypes<TemplateSpecType[P]>, TransitionSettings.Literal ]
};

/**
 * An object keyed by transitionable Element properties (numeric properties)
 * and valued by {@link lng.types.TransitionSettings.Literal}
 *
 * @hidden Internal use only
 */
export type TransitionsTemplate<TemplateSpecType = Element.TemplateSpec> = {
  [P in keyof TemplateSpecType]?:
    ExtractAnimatableValueTypes<TemplateSpecType[P]> extends never
      ?
        never
      :
        TransitionSettings.Literal
};

/**
 * Returns a CompiledTemplateSpecType with all types from the TemplateSpec properly combined
 *
 * @privateRemarks
 * Used to build: __$type_TemplateSpec
 *
 * @hidden Internal use only
 */
export type CompileElementTemplateSpecType<
  TemplateSpecType extends Element.TemplateSpec,
  TypeConfig extends Element.TypeConfig
> =
  TemplateSpecType & {
    smooth: SmoothTemplate<TemplateSpecType>,
    transitions: TransitionsTemplate<TemplateSpecType>,
  };

/**
 * If `PossibleElementConstructor` is an inline Element or a Component Constructor, convert it to it's instantiated form.
 * Otherwise, return the input type (or something else by setting `Default`)
 *
 * @hidden Internal use only
 */
export type TransformPossibleElement<Key, PossibleElementConstructor, Default = PossibleElementConstructor> =
  string extends Key
    ?
      any // Support Loose Elements: keyof loose Elements `P` will always be a `string`, so let anything go
    :
      Key extends ValidRef // Support Strong Elements
        ?
          PossibleElementConstructor extends Element.Constructor
            ?
              InstanceType<PossibleElementConstructor>
            :
              Element<InlineElement<PossibleElementConstructor>>
        :
          Default;

/**
 * Returns `true` if TemplateSpec is loose, `false` if it is strong
 */
export type IsLooseTemplateSpec<TemplateSpec extends Element.TemplateSpec> = string extends keyof TemplateSpec ? true : false;

/**
 * Returns `true` if TypeConfig is loose, `false` if it is strong
 */
export type IsLooseTypeConfig<TypeConfig extends Element.TypeConfig> = string extends keyof TypeConfig ? true : false;

/**
 * Remove index signatures from an object
 *
 * @privateRemarks
 * Converts a loose Element template to a strong Element template by
 * removing the index signature that Element.TemplateSpecLoose adds
 *
 * @hidden Internal use only
 */
export type RemoveIndex<T> = {
  [ K in keyof T as string extends K ? never : number extends K ? never : K ] : T[K]
};

/**
 * Returns a flattened map of the TemplateSpec where each key is is a `.` separated tag path to an element
 *
 * @privateRemarks
 *
 * Example:
 * ```ts
 * type Result = TemplateSpecTags<{
 *   MyElement: object
 *   MyParentElement: {
 *     MyChildComponent: typeof MyComponent
 *     MyChildElement: {
 *       MyGrandChildElement: object
 *     }
 *   }
 * }>
 * ```
 *
 * equates to:
 *
 * ```ts
 * type Result = {
 *   'MyElement': Lightning.Element<InlineElement<object>>;
 *   'MyParentElement': Lightning.Element<InlineElement<{
 *      MyChildComponent: typeof MyComponent
 *      MyChildElement: {
 *        MyGrandChildElement: object
 *      }
 *   }>>;
 *   'MyParentElement.MyChildComponent': MyComponent;
 *   'MyParentElement.MyChildElement': Lightning.Element<InlineElement<{ MyGrandChildElement: object }>>;
 *   'MyParentElement.MyChildElement.MyGrandChildElement': Lightning.Element<InlineElement<object>>
 * }
 * ```
 *
 * @hidden Internal use only
 */
export type TemplateSpecTags<TemplateSpec extends Element.TemplateSpec> = {
  [K in keyof CombineTagPaths<SpecToTagPaths<RemoveIndex<TemplateSpec>>>]: TransformPossibleElement<K, CombineTagPaths<SpecToTagPaths<RemoveIndex<TemplateSpec>>>[K]>;
} & (IsLooseTemplateSpec<TemplateSpec> extends true
  ? {
      [K in string]: any;
    }
  : {});

/**
 * Gets an object shape containing all the Refs (child Element / Components) in a TemplateSpec
 *
 * @privateRemarks
 * The refs are transformed into proper Element / Component references
 *
 * @hidden Internal use only
 */
export type TemplateSpecRefs<TemplateSpec extends Element.TemplateSpec> = {
  [K in keyof CombineTagPathsSingleLevel<SpecToTagPaths<RemoveIndex<TemplateSpec>>>]: TransformPossibleElement<K, CombineTagPathsSingleLevel<SpecToTagPaths<RemoveIndex<TemplateSpec>>>[K]>;
} & (IsLooseTemplateSpec<TemplateSpec> extends true
  ? {
      [K in string]: any;
    }
  : {});

//
// Public types
//
declare namespace Element {
  /**
   * Constructor type for an Element
   */
  export type Constructor<C extends Element = Element> = new (...a: any[]) => C;

  export type OnAfterCalcsCallback<T extends Element = Element> = (el: T) => void;

  export type OnAfterUpdateCallback<T extends Element = Element> = (el: T) => void;

  export type OnUpdateCallback<T extends Element = Element> = (el: T, core: ElementCore) => void;

  export interface Flex {
    /**
     * Flexbox container align content
     *
     * @remarks
     * CSS Documentation:
     * - [`align-content` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/align-content)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    alignContent?:
      | 'flex-start'
      | 'flex-end'
      | 'center'
      | 'space-between'
      | 'space-around'
      | 'space-evenly'
      | 'stretch';
    /**
     * Flexbox container align items
     *
     * @remarks
     * Difference from CSS:
     * - Baseline is not supported
     *
     * CSS Documentation:
     * - [`align-items` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
    /**
     * Flexbox container direction
     *
     * @remarks
     * CSS Documentation:
     * - [`flex-direction` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    direction?: 'column' | 'row';
    /**
     * Flexbox container justify content
     *
     * @remarks
     * CSS Documentation:
     * - [`justify-content` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    justifyContent?:
      | 'flex-start'
      | 'flex-end'
      | 'center'
      | 'space-between'
      | 'space-around'
      | 'space-evenly';
    /**
     * Flexbox container padding
     *
     * @remarks
     * CSS Documentation:
     * - [`padding` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/padding)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    padding?: number;
    /**
     * Flexbox container padding bottom
     *
     * @remarks
     * CSS Documentation:
     * - [`padding-bottom` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-bottom)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    paddingBottom?: number;
    /**
     * Flexbox container padding left
     *
     * @remarks
     * CSS Documentation:
     * - [`padding-left` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-left)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    paddingLeft?: number;
    /**
     * Flexbox container padding right
     *
     * @remarks
     * CSS Documentation:
     * - [`padding-right` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-right)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    paddingRight?: number;
    /**
     * Flexbox container padding top
     *
     * @remarks
     * CSS Documentation:
     * - [`padding-top` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-top)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    paddingTop?: number;
    /**
     * Flexbox container wrap
     *
     * @remarks
     * Difference from CSS:
     * - Only wrap (`true`) and no wrap (`false`) are supported
     *
     * CSS Documentation:
     * - [`flex-wrap` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    wrap?: boolean;
  }

  export interface FlexItem {
    /**
     * Flexbox item grow
     *
     * @remarks
     * CSS Documentation:
     * - [`flex-grow` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    grow?: number;
    /**
     * Flexbox item shrink
     *
     * @remarks
     * Difference from CSS:
     * - Non-containers are not shrinkable by default
     *
     * CSS Documentation:
     * - [`flex-shrink` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-shrink)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    shrink?: number;
    /**
     * Flexbox item align self
     *
     * @remarks
     * CSS Documentation:
     * - [`align-self` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/align-self)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    alignSelf?: string;
    /**
     * Flexbox item minimum width
     *
     * @remarks
     * Difference from CSS:
     * CSS Documentation:
     * - [`min-width` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/min-width)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    minWidth?: number;
    /**
     * Flexbox item minimum height
     *
     * @remarks
     * CSS Documentation:
     * - [`min-height` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/min-height)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    minHeight?: number;
    /**
     * Flexbox item maximum width
     *
     * @remarks
     * CSS Documentation:
     * - [`max-width` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/max-width)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    maxWidth?: number;
    /**
     * Flexbox item maximum height
     *
     * @remarks
     * CSS Documentation:
     * - [`max-height` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/max-height)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    maxHeight?: number;
    /**
     * Flexbox item margin
     *
     * @remarks
     * CSS Documentation:
     * - [`margin` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/margin)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    margin?: number;
    /**
     * Flexbox item margin left
     *
     * @remarks
     * CSS Documentation:
     * - [`margin-left` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    marginLeft?: number;
    /**
     * Flexbox item margin top
     *
     * @remarks
     * CSS Documentation:
     * - [`margin-top` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-top)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    marginTop?: number;
    /**
     * Flexbox item margin bottom
     *
     * @remarks
     * CSS Documentation:
     * - [`margin-bottom` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    marginBottom?: number;
    /**
     * Flexbox item margin right
     *
     * @remarks
     * CSS Documentation:
     * - [`margin-right` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-right)
     *
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    marginRight?: number;
  }

  export interface TemplateSpec {
    /**
     * Element's reference key
     */
    ref: string | undefined;

    /**
     * Hover cursor
     *
     * @remarks
     * See the keyword values at [`cursor` CSS property (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values) for valid values.
     *
     * See [PR #356](https://github.com/rdkcentral/Lightning/pull/356) for more information on this
     * feature.
     *
     * @defaultValue `undefined` (no cursor)
     */
    cursor: string | undefined;

    /**
     * Set this Element's texture
     *
     * @remarks
     * See [Texture Types](https://lightningjs.io/docs/#/lightning-core-reference/RenderEngine/Textures/index) for
     * more information.
     */
    texture: Texture | Texture.SettingsLoose | null;

    /**
     * Creates a tag context
     *
     * @remarks
     * Tagged Elements in this branch will not be reachable
     * from ancestors of this Element.
     *
     * @defaultValue false
     */
    tagRoot: boolean;

    /**
     * Sets a Bounds Margin for this Element.
     *
     * Format:
     * ```text
     * [left margin, top margin, right margin, bottom margin]
     * ```
     *
     * - If `null` (default):
     *   - Inherit from Bounds Margins from parent
     *
     * Note: If no bounds margins are set in the render tree, the default on all
     *       sides is `100`.
     *
     * @remarks
     * The Bounds Margin influences whether an Element will be rendered as if it were
     * on screen. If the Bounds Margin is `0` on all sides, then this Element will only be
     * rendered if exactly any part of it's rectangle is potentially visible on screen. Adding
     * to the Bounds Margin allows an Element to be rendered as it gets closer to becoming
     * visible on screen.
     *
     * @defaultValue null
     */
    boundsMargin: [number, number, number, number] | null;

    /**
     * X position of this Element
     *
     * @remarks
     * If set with a method the value is made dynamic based
     * on the parent Element's width.
     *
     * @defaultValue 0
     */
    x: number | ((parentWidth: number) => number);

    /**
     * Y position of this Element
     *
     * @remarks
     * If set with a method the value is made dynamic based
     * on the parent Element's height.
     *
     * @defaultValue 0
     */
    y: number | ((parentHeight: number) => number);

    /**
     * Width of this Element
     *
     * @remarks
     * If set with a method the value is made dynamic based
     * on the parent Element's width.
     *
     * @defaultValue 0
     */
    w: number | ((parentWidth: number) => number);

    /**
     * Height of this Element
     *
     * @remarks
     * If set with a method the value is made dynamic based
     * on the parent Element's height.
     *
     * @defaultValue 0
     */
    h: number | ((parentHeight: number) => number);

    /**
     * Mouse pointer collision
     *
     * @remarks
     * If set `true`, then it allows a [Mouse Pointer](https://lightningjs.io/docs/#/lightning-core-reference/HandlingInput/Mouse?id=mouse-input)
     * to click/hover over this Element.
     */
    collision: boolean;

    /**
     * Rectangle texture mode
     *
     * @remarks
     * When set, this Element adopts a RectangleTexture as its Texture
     * and displays a rectangle colored by the various `color*` properties.
     *
     * Cannot be set at the same time as {@link src} or {@link text}.
     *
     * See [Texture Types](https://lightningjs.io/docs/#/lightning-core-reference/RenderEngine/Textures/index) for
     * more information.
     *
     * @defaultValue false
     *
     * @see
     * - {@link color}
     * - {@link colorTop}
     * - {@link colorBottom}
     * - {@link colorLeft}
     * - {@link colorRight}
     * - {@link colorUl}
     * - {@link colorUr}
     * - {@link colorBl}
     * - {@link colorBr}
     */
    rect: boolean;
    /**
     * Scale Horizontal Tranform
     *
     * @remarks
     * Stretches or shrinks this Element along the horizontal axis.
     *
     * @defaultValue 1.0
     */
    scaleX: number;

    /**
     * Scale Vertical Tranform
     *
     * @remarks
     * Stretches or shrinks this Element along the vertical axis.
     *
     * @defaultValue 1.0
     */
    scaleY: number;

    /**
     * Scale Tranform
     *
     * @remarks
     * Stretches or shrinks this Element along both the horizontal and
     * vertical axes.
     *
     * @defaultValue 1.0
     */
    scale: number;

    /**
     * Rotational Pivot Position (horizonal axis)
     *
     * @remarks
     * Controls the pivot that the {@link rotation} property rotates around along
     * the horizontal axis. Can be any floating point number between `0.0` and `1.0`.
     *
     * Examples
     * - `0.0` = left
     * - `0.5` (default) = center
     * - `1.0` = right
     *
     * @defaultValue 0.5
     */
    pivotX: number;

    /**
     * Rotational Pivot Position (vertical axis)
     *
     * @remarks
     * Controls the pivot that the {@link rotation} property rotates around along
     * both the vertical axes. Can be any floating point number between `0.0` and `1.0`.
     *
     * Examples
     * - `0.0` = top
     * - `0.5` (default) = center
     * - `1.0` = bottom
     *
    * @defaultValue 0.5
     */
    pivotY: number;
    /**
     * Rotational Pivot Position
     *
     * @remarks
     * Controls the pivot that the {@link rotation} property rotates around along
     * both the horizontal and vertical axis. Can be any floating point number between
     * `0.0` and `1.0`.
     *
     * Examples
     * - `0.0` = top-left
     * - `0.5` (default) = center
     * - `1.0` = bottom-right
     *
     * @defaultValue 0.5
     */
    pivot: number;

    /**
     * Texture mountpoint on horizontal axis
     *
     * @remarks
     * Controls the position within the Element that is placed at {@link x} and
     * {@link y} along the horizontal axis. Can be any floating point number between
     * `0.0` and `1.0`.
     *
     * Examples
     * - `0.0` (default) = left side
     * - `0.5` = center
     * - `1.0` = right side
     *
     * @defaultValue 0.0
     */
    mountX: number;

    /**
     * Texture mountpoint on vertical axis
     *
     * @remarks
     * Controls the position within the Element that is placed at {@link x} and
     * {@link y} along the vertical axis. Can be any floating point number between
     * `0.0` and `1.0`.
     *
     * Examples
     * - `0.0` (default) = top side
     * - `0.5` = center
     * - `1.0` = bottom side
     *
     * @defaultValue 0.0
     */
    mountY: number;

    /**
     * Texture mountpoint
     *
     * @remarks
     * Controls the position within the Element that is placed at {@link x} and
     * {@link y} along both the horizontal and vertical axes. Can be any floating
     * point number between `0.0` and `1.0`.
     *
     * Examples:
     * - `0.0` (default) = top-left corner
     * - `0.5` = center
     * - `1.0` = bottom-right corner
     *
     * @default
     */
    mount: number;

    /**
     * Rotation Transform (in radians)
     *
     * @remarks
     * Rotates this Element around the pivot (defined by {@link pivot}, {@link pivotX},
     * and {@link pivotY}).
     *
     * - `0.0` = No rotation
     * - `Math.PI / 2` = 90 degree rotation
     * - `Math.PI` = 180 degree rotation
     * - `Math.PI * 3 / 2` = 270 degree rotation
     * - `Math.PI * 2` = 360 degree rotation (same as no rotation)
     *
     * @defaultValue 0.0
     */
    rotation: number;

    /**
     * Defines the opacity of this Element and its descendants. This can be any number
     * between `0.0` (0% opacity) and `1.0` (100% opacity).
     *
     * @remarks
     * - If set to `0.0`:
     *   - This Element is not rendered, but will still maintain its space in a Flex Box layout
     * - If set to `1.0` (default):
     *   - This Element is rendered with 100% opacity.
     *
     * The {@link visible} property takes prescendence over `alpha`.
     *
     * @defaultValue 1.0
     */
    alpha: number;

    /**
     * Defines the visibility of this Element and its descendents.
     *
     * @remarks
     * - If set to `true` (default):
     *   - This Element is rendered.
     * - If set to `false`:
     *   - This Element is not rendered and its space in a Flex Box layout is collapsed.
     *
     * If an element is invisible, the off-screen Elements are invisible as well,
     * so you do not have to hide those manually to maintain a good performance.
     *
     * This property takes prescendence over the {@link alpha} property.
     *
     * @defaultValue true
     */
    visible: boolean;

    /**
     * Text settings / texture
     *
     * @remarks
     * When set, the Element adopts a `TextTexture` and renders the text / settings
     * laid out in this property.
     *
     * Cannot be set at the same time as {@link rect} or {@link src}.
     *
     * See [Texture Types](https://lightningjs.io/docs/#/lightning-core-reference/RenderEngine/Textures/index) for
     * more information.
     */
    text: TextTexture.Settings | string | null;

    /**
     * Set a shader on this Element
     */
    shader: Shader | Shader.SettingsLoose | null;

    /**
     * @see {@link rtt}
     */
    renderToTexture: boolean;

    /**
     * If set to `true`, enables Render-to-Texture mode on this Element
     *
     * @remarks
     * Render-to-Texture renders the children of this element to a seperate
     * texture before rendering it to screen. This allows shader effects to
     * work on an entire component as well as enabling advanced transformations
     * (like rotations).
     *
     * @defaultValue `false`
     */
    rtt: boolean;

    /**
     * Determines if the texture is always updated or only when necessary
     *
     * @defaultValue `false`
     */
    rttLazy: boolean;

    /**
     * Forces the Element's contents to be rendered to an offscreen frame buffer. If set to `true`,
     * the Element will not be drawn onto the screen.
     *
     * @remarks
     * You can use this offscreen texture as a sampler for drawing other elements. So,
     * {@link renderToTexture} must be set to true for this to work.
     */
    renderOffscreen: boolean;

    /**
     * If set to `true`, applies a colorization effect to the resulting texture when {@link rtt} is on.
     *
     * @remarks
     * This property has no effect if {@link rtt} is not enabled.
     */
    colorizeResultTexture: boolean;

    /**
     * Flexbox container properties
     *
     * @remarks
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    flex: Element.Flex;

    /**
     * Flexbox item properties
     *
     * @remarks
     * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox) documentation
     * for more information.
     */
    flexItem: Element.FlexItem;

    /**
     * Starts a smooth transition for all the included properties of the object
     *
     * @remarks
     * This is the same as calling {@link Element.setSmooth} for each property.
     *
     * For each property:
     * - If the value is a `number`:
     *   - Property value to smoothly transition to (using the default transition)
     * - If the value is a 2-value array:
     *   - array[0] = Property value to smoothly transition to
     *   - array[1] = Settings describing the transition
     */
    smooth: SmoothTemplate;

    /**
     * Image source URI
     *
     * When set, this Element adopts an ImageTexture as its Texture
     * and loads/displays the image located at the URI.
     *
     * @remarks
     * Cannot be set at the same time as {@link rect} or {@link text}.
     *
     * See [Texture Types](https://lightningjs.io/docs/#/lightning-core-reference/RenderEngine/Textures/index) for
     * more information.
     */
    src: string | undefined;

    /**
     * The maximum expected texture source width.
     *
     * @remarks
     * Used for within bounds determination while texture is not yet loaded.
     *
     * If not set, 2048 is used by ElementCore.update()
     */
    mw: number;

    /**
     * The maximum expected texture source height.
     *
     * @remarks
     * Used for within bounds determination while texture is not yet loaded.
     *
     * If not set, 2048 is used by ElementCore.update()
     */
    mh: number;

    /**
     * Upper-left Corner Rectangle Color
     *
     * @see {@link color}
     */
    colorUl: number;

    /**
     * Upper-right Corner Rectangle Color
     *
     * @see {@link color}
     */
    colorUr: number;


    /**
     * Bottom-left Corner Rectangle Color
     *
     * @see {@link color}
     */
    colorBl: number;

    /**
     * Bottom-right Corner Rectangle Color
     *
     * @see {@link color}
     */
    colorBr: number;

    /**
     * Rectangle Color
     *
     * @remarks
     * This and the other `color*` properties are used to change the color of the
     * Element when {@link rect} is set to `true`.
     *
     * This property sets all of the corners/sides to the same color.
     *
     * The color value is expressed as an ARGB hexadecimal value:
     * ```
     *    A R G B
     *    | | | |
     * 0xffeeddcc
     * ```
     */
    color: number;

    /**
     * Top Side Rectangle Color
     *
     * @see {@link color}
     */
    colorTop: number;

    /**
     * Bottom Side Rectangle Color
     *
     * @see {@link color}
     */
    colorBottom: number;

    /**
     * Left Side Rectangle Color
     *
     * @see {@link color}
     */
    colorLeft: number;

    /**
     * Right Side Rectangle Color
     *
     * @see {@link color}
     */
    colorRight: number;

    /**
     * Z-index
     *
     * @remarks
     * See [Z-Indexing](https://lightningjs.io/docs/#/lightning-core-reference/RenderEngine/Elements/Rendering?id=z-indexing)
     * for more information.
     *
     * @defaultValue 0
     */
    zIndex: number;

    /**
     * Forces a new z-index context for children of this Element.
     *
     * @remarks
     * See [Z-Indexing](https://lightningjs.io/docs/#/lightning-core-reference/RenderEngine/Elements/Rendering?id=z-indexing)
     * for more information.
     *
     * @defaultValue `false`
     */
    forceZIndexContext: boolean;

    /**
     * Defines whether clipping should be turned on or off for this element
     *
     * @remarks
     * - If set to `true`:
     *   - Everything outside the dimensions of this Element is not
     *     rendered. (The effect is similar to overflow:hidden in CSS.)
     * - If set to `false` (default):
     *   - Everything outside the dimensions of this Element is rendered.
     *
     * Setting this property might increase the performance, as descendants outside the
     * clipping region are detected and not rendered.
     *
     * Clipping is implemented using the high-performance WebGL operation scissor. As a
     * consequence, clipping does not work for non-rectangular areas. So, if the Element
     * is rotated (by itself or by any of its ancestors), clipping is not applied. In such
     * situations, you can use the advanced `renderToTexture` property which applies clipping
     * as a side effect.
     *
     * @defaultValue false
     */
    clipping: boolean;

    /**
     * Clipbox
     *
     * @remarks
     * If set to `true` (default), does not render any of this Element's children if the
     * Element itself is completely out-of-bounds.
     *
     * Explicitly set this to `false` to enable rendering of children in that
     * situation.
     *
     * @defaultValue `true`
     */
    clipbox: boolean;

    /**
     * Set the children of this Element
     */
    children: Array<Element> | Array<{ [id: string]: any}>

    /**
     * Setup one or more transitions
     *
     * @remarks
     * This is the same as calling {@link Element.transition} for each property.
     */
    transitions: TransitionsTemplate;

    /**
     * Callback called before the Element's flexbox layout is updated.
     */
    onUpdate: OnUpdateCallback | undefined | null;

    /**
     * ???
     *
     * @remarks
     * After Calcs may change render coords, scissor and/or recBoundsMargin.
     *
     */
    onAfterCalcs: OnAfterCalcsCallback | undefined | null;

    /**
     * Callback called after the Element's flexbox layout is updated.
     */
    onAfterUpdate: OnAfterUpdateCallback | undefined | null;
  }

  /**
   * Loose form of lng.Element.TemplateSpec that allows any additional 'any' properties
   */
  export interface TemplateSpecLoose extends Element.TemplateSpec {
    [s: string]: any
  }

  /**
   * Type used for patching an array of Elements/Compnents
   */
  export type PatchTemplateArray<T extends Element.Constructor = typeof Element> =
    Array<Element.NewPatchTemplate<T>>;

  /**
   * Patch object for new Elements / Components
   *
   * @remarks
   * Components require the 'type'
   */
  export type NewPatchTemplate<T extends Element.Constructor = Element.Constructor> =
    T extends Component.Constructor
      ?
        { type: T } & Element.PatchTemplate<InstanceType<T>['__$type_TemplateSpec']>
      :
        Element.PatchTemplate<InstanceType<T>['__$type_TemplateSpec']>;

  /**
   * Type used for patch() parameter.
   *
   * All TemplateSpec properties are made optional, including properties of nested TemplateSpecs.
   */
   export type PatchTemplate<TemplateSpecType extends Element.TemplateSpec = Element.TemplateSpecLoose> = {
    [P in keyof TemplateSpecType]?:
      P extends ValidRef
        ?
          TemplateSpecType[P] extends Component.Constructor
            ?
              { type?: TemplateSpecType[P] } & PatchTemplate<InstanceType<TemplateSpecType[P]>['__$type_TemplateSpec']>
            :
              TemplateSpecType[P] extends Element.Constructor
                ?
                  PatchTemplate<InstanceType<TemplateSpecType[P]>['__$type_TemplateSpec']>
                :
                  PatchTemplate<InlineElement<TemplateSpecType[P]>>
        :
          TemplateSpecType[P]
  };

  /**
   * Extracts the input Element's TemplateSpec value
   */
  export type ExtractTemplateSpec<T extends Element = Element> = T['__$type_TemplateSpec'];

  export interface EventMap {
    /**
     * Texture Failed to Load
     *
     * @param error Error that occurred
     * @param textureSource Textured that fa
     */
    txError(error: Error, textureSource: TextureSource): void;
    /**
     * Texture Loaded
     *
     * @param texture
     */
    txLoaded: (texture: Texture) => void,
    /**
     * Texture Unloaded
     */
    txUnloaded: (texture: Texture) => void,
  }

  /**
   * Additional types to pass to an Element
   */
  export interface TypeConfig {
    TextureType: Texture,
    EventMapType: Element.EventMap
  }

  export interface TypeConfigLoose extends TypeConfig {
    TextureType: Texture
    EventMapType: Element.EventMap
    [s: string]: any
  }
}

declare class Element<
  // Elements use loose typing TemplateSpecs by default (for ease of use as Elements aren't often fully definable)
  TemplateSpecType extends Element.TemplateSpecLoose = Element.TemplateSpecLoose,
  TypeConfig extends Element.TypeConfigLoose = Element.TypeConfigLoose
> extends EventEmitter<EventMapType<TypeConfig>> implements Documentation<Element.TemplateSpec> {
  constructor(stage: Stage);

  isElement: 1;

  get id(): number | string;

  ref: string | undefined;

  cursor: string | undefined;

  readonly core: ElementCore;

  // setAsRoot() {
  // - Skipped as this seems very internal use

  readonly isRoot: boolean;

  /**
   * Gets the number of levels deep this Element is in the render tree.
   */
  getDepth(): number;

  /**
   * Gets the ancestor of this Element that is `l` levels back.
   *
   * @remarks
   * Examples:
   * - If `l` === 0:
   *   - Will return this Element
   * - If `l` === 1:
   *   - Will return this Element's parent
   * - If `l` === 2:
   *   - Will return this Element's grandparent
   *
   * @param l Number of levels to go back
   */
  getAncestor(l: number): Element | null;

  /**
   * Gets an array of this Element's ancestors (including this Element).
   *
   * Order:
   * ```text
   * [
   *   This Element,
   *   This Element's Parent,
   *   This Element's Grandparent,
   *   ... And so on
   * ]
   * ```
   */
  getAncestors(): Array<Element>;

  /**
   * Gets the ancestor of this Element that has the depth of `depth` in the render tree.
   *
   * - If `depth` === `0`:
   *   - Will return the root Element (generally the Application)
   * - If `depth` === `1`:
   *   - Will return the ancestor that is the child of the root Element
   * - If `depth` === `this.getDepth()`
   *   - Will return this Element
   *
   * @param depth Depth in the render tree from the root Element
   */
  getAncestorAtDepth(depth: number): void;

  /**
   * Returns true if this Element is an ancestor of Element `c`
   *
   * @param c Element to test
   */
  isAncestorOf(c: Element): boolean;

  /**
   * Gets the first common ancestor Element that this Element and another Element `c` share.
   *
   * @remarks
   * Returns `null` if there are no common ancestors
   *
   * @param c Element to find common ancestor with
   */
  getSharedAncestor(c: Element): Element | null;

  /**
   * Attached State
   *
   * @remarks
   * `true` if this {@link Element} is attached, otherwise `false`.
   *
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents?id=lifecycle-events).
   */
  readonly attached: boolean;

  /**
   * Enabled State
   *
   * @remarks
   * `true` if this {@link Element} is enabled, otherwise `false`.
   *
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents?id=lifecycle-events).
   */
  readonly enabled: boolean;

  /**
   * Active State
   *
   * @remarks
   * `true` if this {@link Element} is active, otherwise `false`.
   *
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents?id=lifecycle-events).
   */
  readonly active: boolean;

  /**
   * Application's Global {@link Stage}
   */
  readonly stage: Stage;

  _onSetup(): void;

  _onAttach(): void;

  _onDetach(): void;

  _onEnabled(): void;

  _onDisabled(): void;

  _onActive(): void;

  _onInactive(): void;

  _onResize(): void;

  readonly renderWidth: number;

  readonly renderHeight: number;

  /**
   * If flexbox is enabled for this Element, contains the final X position of
   * the Element after the layout update operation has been done.
   *
   * @remarks
   * See [Flexbox - Final Coordinates](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox?id=final-coordinates)
   * for more information.
   */
  readonly finalX: number;
  /**
   * If flexbox is enabled for this Element, contains the final Y position of
   * the Element after the layout update operation has been done.
   *
   * @remarks
   * See [Flexbox - Final Coordinates](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox?id=final-coordinates)
   * for more information.
   */
  readonly finalY: number;

  /**
   * If flexbox is enabled for this Element, contains the final width of
   * the Element after the layout update operation has been done.
   *
   * @remarks
   * See [Flexbox - Final Coordinates](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox?id=final-coordinates)
   * for more information.
   */
  readonly finalW: number;

  /**
   * If flexbox is enabled for this Element, contains the final height of
   * the Element after the layout update operation has been done.
   *
   * @remarks
   * See [Flexbox - Final Coordinates](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox?id=final-coordinates)
   * for more information.
   */
  readonly finalH: number;

  /**
   * Retruns `true` if a texture is currently loaded in this Element
   */
  textureIsLoaded(): boolean;

  /**
   * Load the texture that was set by {@link Element.TemplateSpec.texture}
   */
  loadTexture(): void;

  forceZIndexContext: boolean;

  /**
   * Get/set the Element's texture
   *
   * @remarks
   * See [Texture Types](https://lightningjs.io/docs/#/lightning-core-reference/RenderEngine/Textures/index) for
   * more information.
   *
   * @see {@link Element.TemplateSpec.texture}
   */
  get texture(): TextureType<TypeConfig> | null;
  set texture(v: TextureType<TypeConfig> | Texture.SettingsLoose | null);

  /**
   * The currently displayed texture. While this.texture is loading,
   * this one may be different.
   */
  readonly displayedTexture: TextureType<TypeConfig> | null;

  // onTextureSourceLoaded() {
  // - Internal use only. Calling/overriding this can break things

  // onTextureSourceLoadError(error: unknown): void;
  // - Internal use only. Calling/overriding this can break things

  /**
   * Force re-create of render texture and re-invoke shader
   */
  forceRenderUpdate(): void;

  // onDisplayedTextureClippingChanged
  // - Internal use only. Calling/overriding this can break things

  // onPrecisionChanged
  // - Internal use only. Calling/overriding this can break things

  // onDimensionsChanged(w: number, h: number): void;
  // - Internal use only. Calling/overriding this can break things

  /**
   * Get the corner points of this Element
   *
   * Format:
   * ```
   * [
   *    topLeftX, topLeftY,
   *    topRightX, topRightY,
   *    bottomRightX, bottomRight,
   *    bottomLeftX, bottomLeftY
   * ]
   * ```
   */
  getCornerPoints(): [number, number, number, number, number, number, number, number];

  /**
   * Returns one of the Elements from the subtree that has this tag path.
   *
   * @remarks
   * Using {@link getByRef} may be slightly more performant, but only works one level at a time.
   *
   * In strongly typed Components, only fully qualified paths are supported in a type-safe way
   * (i.e. 'MyChild.MyGrandChild.MyGreatGrandChild'). If you'd like to reference a deep element
   * by its ref name (i.e. just 'MyGreatGrandChild') you can opt into this by asserting `as any`:
   *
   * ```ts
   * // No error and is typed
   * this.tag('MyChild.MyGrandChild.MyGreatGrandChild')
   * ```
   *
   * ```ts
   * // Needs `any` assertion and is typed as `any`
   * this.tag('MyGreatGrandChild' as any)
   * ```
   *
   * See [Tags](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Tags?id=tags) for more
   * information.
   * @param tagName `.` separated tag path
   */
  tag<Path extends keyof TemplateSpecTags<TemplateSpecType>>(tagName: Path): TemplateSpecTags<TemplateSpecType>[Path] | undefined;

  /**
   * Returns all Elements from the subtree that have this tag.
   *
   * @param tagName
   */
  mtag(tagName: string): Element[];

  // stag(tag, settings) {
  // - Not recommended

  tagRoot: boolean;

  // sel(path) {
  // select(path) {
  // - Complex and undocumented. Not recommended.

  /**
   * Get child directly by ref name
   *
   * @param ref
   */
  getByRef<RefKey extends keyof TemplateSpecRefs<TemplateSpecType>>(ref: RefKey): TemplateSpecRefs<TemplateSpecType>[RefKey] | undefined;

  /**
   * Get the location identifier of this Element
   */
  getLocationString(): string;

  // toString() {
  // - This is inherent on any class

  // static getPrettyString(obj, indent: string): string;
  // - Utility method used by toString()

  /**
   * Get Settings object representing this Element
   */
  getSettings(): Element.TemplateSpec;

  // getNonDefaults() {
  // - Internal use only

  /**
   * `true` if Element is within the bounds margin
   */
  readonly withinBoundsMargin: boolean;

  boundsMargin: [number, number, number, number] | null;

  /**
   * X position of this Element
   *
   * @see {@link Element.TemplateSpec.x}
   */
  get x(): number;
  set x(x: number | ((parentWidth: number) => number));

  /**
   * Y position of this Element
   *
   * @see {@link Element.TemplateSpec.y}
   */
  get y(): number;
  set y(y: number | ((parentHeight: number) => number));

  /**
   * Width of this Element
   *
   * @see {@link Element.TemplateSpec.w}
   */
  get w(): number;
  set w(w: number | ((parentWidth: number) => number));

  /**
   * Height of this Element
   *
   * @see {@link Element.TemplateSpec.h}
   */
  get h(): number;
  set h(h: number | ((parentHeight: number) => number));

  collision: boolean;

  scaleX: number;

  scaleY: number;

  scale: number;

  pivotX: number;

  pivotY: number;

  pivot: number;

  mountX: number;

  mountY: number;

  mount: number;

  rotation: number;

  alpha: number;

  visible: boolean;

  colorUl: number;

  colorUr: number;

  colorBl: number;

  colorBr: number;

  color: number;

  colorTop: number;

  colorBottom: number;

  colorLeft: number;

  colorRight: number;

  zIndex: number;

  clipping: boolean;

  clipbox: boolean;

  readonly childList: ElementChildList;

  hasChildren(): boolean;

  /**
   * Set/get the children of this Element
   *
   * @see {@link Element.TemplateSpec.children}
   */
  get children(): Array<Element>;
  set children(children: Array<Element> | Array<{ [id: string]: any }>);

  /**
   * Add element to end of this Element's childList
   */
  add<T extends Element>(
    element: T,
  ): T;
  add<T extends Component.Constructor>(element: Element.NewPatchTemplate<T>): InstanceType<T>;
  add(
    element: Array<Element.NewPatchTemplate | Element>,
  ): null;
  add(
    element: Element.NewPatchTemplate,
  ): Element;

  /**
   * @deprecated Alias of {@link parent}
   */
  readonly p: Element | null;

  /**
   * Parent Element of this Element
   */
  readonly parent: Element | null;

  src: string | undefined;

  /**
   * The maximum expected texture source width.
   *
   * @remarks
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link Element.TemplateSpec.mw}
   */
  mw: number;

  /**
   * The maximum expected texture source height.
   *
   * @remarks
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link Element.TemplateSpec.mh}
   */
  mh: number;

  rect: boolean;

  /**
   * Sets the TextTexture on this Element, replacing any already set texture
   */
  enableTextTexture(): TextTexture;

  /**
   * Text settings / texture
   *
   * @remarks
   * WARNING: You may ONLY set `TextTexture.Literal | string` to this property
   *
   * Note: This property will always return `TextTexture | null` when read.
   *
   * @see {@link Element.TemplateSpec.text}
   */
  // @ts-ignore-error Prevent ts(2380)
  get text(): TextTexture | null;
  set text(text: TextTexture.Settings | string);

  /**
   * Callback called before the Element's flexbox layout is updated.
   *
   * @remarks
   * Note: This property will always return `undefined` when read.
   *
   * @see {@link Element.TemplateSpec.onAfterUpdate}
   */
  onUpdate: Element.OnUpdateCallback | null | undefined;

  /**
   * ??? (make sure matches literal version)
   *
   * @remarks
   * Note: This property will always return `undefined` when read.
   *
   * @see {@link Element.TemplateSpec.onAfterUpdate}
   */
  onAfterCalcs: Element.OnAfterCalcsCallback | null | undefined;

  /**
   * Callback called after the Element's flexbox layout is updated.
   *
   * @remarks
   * Note: This property will always return `undefined` when read.
   *
   * @see {@link Element.TemplateSpec.onAfterUpdate}
   */
  onAfterUpdate: Element.OnAfterUpdateCallback | null | undefined;

  /**
   * Forces an update loop.
   */
  forceUpdate(): void;

  /**
   * Get/set a shader of/on this Element
   *
   * @see {@link Element.TemplateSpec.shader}
   */
  get shader(): Shader | Shader.SettingsLoose | null;
  set shader(v: Shader | Shader.SettingsLoose | null | undefined);

  renderToTexture: boolean;

  rtt: boolean;

  rttLazy: boolean;

  renderOffscreen: boolean;

  colorizeResultTexture: boolean;

  getTexture(): TextureSource;

  readonly texturizer: ElementTexturizer;

  /**
   * Patches settings of this Element plus child Elements of the render tree.
   *
   * @remarks
   * See [Patching](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Patching?id=patching) for
   * more information.
   *
   * @param template
   */
  patch(template: Element.PatchTemplate<TemplateSpecType>): void;

  /**
   * Attach an animation to this Element
   *
   * @remarks
   * See [Animations](https://lightningjs.io/docs/#/lightning-core-reference/Animations/index) for
   * more information.
   *
   * @param animation
   */
  animation<Key extends keyof TemplateSpecType | AnimationForceLiteral>(animation: AnimationSettings.Literal<Pick<TemplateSpecType, Key>, Key>): Animation;

  /**
   * Get/set Transition for `property`
   *
   * @remarks
   * This method has 2 overloads:
   * - If `settings` param is provided:
   *   - Set the Transition `settings` for `property`
   * - If `settings` param is NOT provided:
   *   - Get the {@link Lightning.types.Transition} instance for `property`
   *
   * See [Transitions](https://lightningjs.io/docs/#/lightning-core-reference/Transitions/index) for more
   * information.
   *
   * @param property
   * @param settings Transition settings to configure `property` with in this Element (optional)
   */
  transition<
    Key extends keyof TransitionsTemplate<TemplateSpecType>
  >(
    property: ExtractAnimatableValueTypes<TemplateSpecType[Key]> extends never ? never : Key
  ): Transition;
  transition<
    Key extends keyof TransitionsTemplate<TemplateSpecType>
  >(
    property: ExtractAnimatableValueTypes<TemplateSpecType[Key]> extends never ? never : Key,
    settings: TransitionSettings.Literal
  ): null;

  /**
   * Setup one or more transitions
   *
   * @remarks
   * **WARNING:** DO NOT read from this property. It is WRITE-ONLY. It will always return `undefined`.
   *
   * See [Transitions](https://lightningjs.io/docs/#/lightning-core-reference/Transitions/index) for more
   * information.
   *
   * @see {@link Element.TemplateSpec.transitions}
   */
  // The getter type needs to have TransitionsTemplate in its union for some reason thats not clear
  // @ts-ignore-error Prevent ts(2380)
  get transitions(): TransitionsTemplate<TemplateSpecType> | undefined;
  set transitions(v: TransitionsTemplate<TemplateSpecType>);

  /**
   * Starts a smooth transition for all the included properties of the object
   *
   * @remarks
   * This is the same as calling {@link Element.setSmooth} for each property.
   *
   * For each property:
   * - If the value is a `number`:
   *   - Property value to smoothly transition to (using the default transition)
   * - If the value is a 2-value array:
   *   - array[0] = Property value to smoothly transition to
   *   - array[1] = Settings describing the transition
   *
   * **WARNING:** DO NOT read from this property. It is WRITE-ONLY. It will always return `undefined`.
   *
   * @see {@link Element.TemplateSpec.smooth}
   */
  // The getter type needs to have SmoothTemplate in its union for some reason thats not clear
  // @ts-ignore-error Prevent ts(2380)
  get smooth(): SmoothTemplate<TemplateSpecType> | undefined;
  set smooth(object: SmoothTemplate<TemplateSpecType>);

  /**
   * Fast-forward a currently transitioning `property` to its target value
   * immediately.
   *
   * @remarks
   * This method also supports providing a property path (i.e. `'texture.x'`). To do
   * this within a strongly typed Element / Component you can do so with an explicit
   * `as any`.
   *
   * ```ts
   * strongElement.fastForward('texture.x' as any);
   * ```
   *
   * @param property
   */
  fastForward<Key extends keyof TransitionsTemplate<TemplateSpecType>>(
    property: ExtractAnimatableValueTypes<TemplateSpecType[Key]> extends never ? never : Key
  ): void;

  /**
   * Get the current target value of an active transition.
   *
   * - If `property` is not actively transitioning:
   *   - Returns `value`, if provided.
   *   - Otherwise, returns `undefined`.
   *
   * @remarks
   * This method also supports providing a property path (i.e. `'texture.x'`). To do
   * this within a strongly typed Element / Component you can do so with an explicit
   * `as any`.
   *
   * ```ts
   * strongElement.getSmooth('texture.x' as any);
   * ```
   *
   * @param property
   * @param value
   */
  getSmooth<Key extends keyof SmoothTemplate<TemplateSpecType>>(
    property: ExtractAnimatableValueTypes<TemplateSpecType[Key]> extends never ? never : Key
  ): ExtractAnimatableValueTypes<TemplateSpecType[Key]> | undefined;
  getSmooth<Key extends keyof SmoothTemplate<TemplateSpecType>, Value extends ExtractAnimatableValueTypes<TemplateSpecType[Key]>>(
    property: Value extends never ? never : Key,
    value: Value,
  ): ReduceSpecificity<Value, AnimatableValueTypes>;

  /**
   * Start a smooth transition of `property` to the target `value`. Optionally
   * you may provide transition `settings`. If `settings` is not provided the
   * default transition will be used.
   *
   * @remarks
   * This method also supports transitioning a property path (i.e. `'texture.x'`). To do
   * this within a strongly typed Element / Component you can do so with an explicit
   * `as any`.
   *
   * ```ts
   * strongElement.setSmooth('texture.x' as any, 123);
   * ```
   *
   * @param property Property to transition
   * @param value Target value
   * @param settings Transition settings
   */
  setSmooth<Key extends keyof SmoothTemplate<TemplateSpecType>>(
    property: Key,
    value: number extends TemplateSpecType[Key] ? number : never,
    settings?: TransitionSettings.Literal,
  ): void;

  flex: Element.Flex;

  flexItem: Element.FlexItem;
  //toJSON() {
  //static collectChildren(tree, children) {
  //static getProperties(element) {

  /**
   * Phantom type that holds the LiteralType.
   *
   * NOT AVAILABLE AT RUNTIME.
   */
  readonly __$type_TemplateSpec: CompileElementTemplateSpecType<TemplateSpecType, TypeConfig>

  // Purposely not exposed:
  // getTags();
  // setTags(tags);
  // addTag(tag);
  // removeTag(tag);
  // hasTag(tag);
  // get tags() {
  // set tags(v) {
  // set t(v) {
  // - These tag related methods/properties seem very internal use only and it's not clear if there's a
  //   practical external use
  // static getGetter(propertyPath) {
  // static getSetter(propertyPath) {
  // _allowChildrenAccess() {
  // - This seems to have limited utility for overriding
  // static isColorProperty(property)
  // static getMerger(property)
  // - These are used solely by Transitions with no likely external utility
}

export default Element;
