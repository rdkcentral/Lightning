/**
 * This is an example of the `lng create` app. There should be no errors or regular tests here.
 */
// @ts-expect-error
import { Utils } from '@lightningjs/sdk'
import lng from '../index.js';

export declare namespace App {
  export interface Literal extends lng.Component.Literal {
    /**
     * Background of the App
     */
    Background: typeof lng.Element;
    /**
     * Lightning Logo that appears on the background
     */
    Logo: typeof lng.Element;
    /**
     * Text that appears below Lightning Logo
     */
    Text: typeof lng.Element;
  }
}

export class App extends lng.Component<App.Literal> implements lng.Component.ImplementLiteral<App.Literal> {
  static getFonts() {
    return [{ family: 'Regular', url: Utils.asset('fonts/Roboto-Regular.ttf') as string }]
  }

  readonly Background = this.getByRef('Background')!;
  readonly Logo = this.getByRef('Logo')!;
  readonly Text = this.getByRef('Text')!;

  static _template(): lng.Component.Template<App.Literal> {
    return {
      Background: {
        w: 1920,
        h: 1080,
        color: 0xfffbb03b,
        src: Utils.asset('images/background.png') as string,
      },
      Logo: {
        x: 960,
        y: 600,
        src: Utils.asset('images/logo.png') as string,
      },
      Text: {
        x: 960,
        y: 720,
        text: {
          text: "Let's start Building!",
          fontFace: 'Regular',
          fontSize: 64,
          textColor: 0xbbffffff,
        },
      },
    }
  }

  _init() {
    this.Background
      .animation({
        duration: 15,
        repeat: -1,
        actions: [
          {
            selector: '',
            properties: 'color',
            value: { 0: { v: 0xfffbb03b }, 0.5: { v: 0xfff46730 }, 0.8: { v: 0xfffbb03b } },
          },
        ],
      })
      .start()
  }
}
