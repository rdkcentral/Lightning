import lng from '../index.js';

/**
 * Possible identity function to add to Lightning or suggest in documentation
 */
function $template<T extends lng.Element>(t: lng.Component.Template<T>): lng.Component.Template<T> {
  return t;
}

const element: lng.Element = {} as any;

element.rtt; // $ExpectType boolean

const component: lng.Component<any> = {} as any;

component.rtt; // $ExpectType boolean
