/**
 * This is an example of the `lng create` app. There should be no errors or regular tests here.
 */
// @ts-expect-error
import { Utils } from '@lightningjs/sdk'
import lng from '../index.js';

export declare namespace App {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    /**
     * Lightning Logo that appears on the background
     */
    Logo: typeof lng.Element;
  }
}

export class App extends lng.Component<App.TemplateSpec> implements lng.Component.ImplementTemplateSpec<App.TemplateSpec> {
  readonly Logo = this.getByRef('Logo')!;

  static _template(): lng.Component.Template<App.TemplateSpec> {
    return {
      Logo: {
        x: 960,
        y: 600,
        src: Utils.asset('images/logo.png') as string,
      },
    }
  }
}
