import AnimationSettings from "./AnimationSettings.mjs";

declare namespace AnimationActionSettings {
  export interface AnimationActionValue {
    /**
     * Slope
     *
     * The slope (value per progress unit, 0 means flat, positive means 'curving upwards', negative means 'curving downwards' )
     *
     * Default value: 0
     */
    s?: number;
    /**
     * Slope end
     *
     * Outgoing curve sloop, if different from (incoming) slope (s)
     *
     * Default value: 0
     */
    se?: number;
    /**
     * Smoothness
     *
     * Smoothness of the curve around the point
     *
     * Default value: 0.5
     */
    sm?: number;
    /**
     * Smooth end
     *
     * Outgoing curve smoothness, if different from (incoming) smoothness (sm)
     *
     * Default value: 0.5
     */
    sme?: number;
    /**
     * Value
     *
     * Exact value at control point
     *
     * Default value: 0
     */
    v: number | boolean;
  }

  export interface AnimationActionValueMap {
    [index: number]: number | AnimationActionValue;
    sm?: number;
  }

  export interface Literal {
    properties?: string | Array<string>;
    selector?: string;
    value?: AnimationActionSettings.AnimationActionValueMap;

    /**
     * @deprecated
     * While available this property does nothing but redirect to the `value` setter
     v?: AnimationActionValueMap;
      */

    /**
     * @deprecated
     * While available this property does nothing but redirect to the `properties` setter
     p?: string | Array<string>;
      */
  }
}


declare class AnimationActionSettings implements AnimationActionSettings.Literal {
  constructor(animationSettings: AnimationSettings);

  set selector(v: string);
  set value(v: AnimationActionSettings.AnimationActionValueMap);
  set properties(v: string | Array<string>);
}

export default AnimationActionSettings;
