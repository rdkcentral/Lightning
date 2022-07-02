import lng from '../index.js';

const element: lng.Element = {} as any;

element.rtt; // $ExpectType boolean

const component: lng.Component<any> = {} as any;

component.rtt; // $ExpectType boolean
