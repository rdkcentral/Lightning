/**
 * Tests for the ability to allow your strongly typed components to be extendible
 */

import lng from '../index.js';

namespace Animal {
  export interface Literal extends lng.Component.Literal {
    name: string;
  }
}

class Animal<Literal extends Animal.Literal = Animal.Literal> extends lng.Component<Literal> implements lng.Component.ImplementLiteral<Animal.Literal> {
  static _template(): lng.Component.Template<Animal.Literal> {
    return {
      x: (w) => w,
      y: (h) => h,
      w: (w) => w,
      h: (h) => h,
      color: 0xffffffff,
      rtt: true,
      mount: 0.0,
      mountX: 0.5,
      mountY: 1.0,
      name: '123'
    };
  }

  _init() {
    this.name = 'unkonwn2';

    // 'as Literal' required due to ts(2345)
    this.patch({
      name: 'Still Unkown'
    } as Literal);

    // If this and same error below go away it's a good thing! Update the tests and documentation
    // @ts-expect-error 'as Literal' required
    this.patch({
      name: 'Still Unkown'
    });
  }

  name: string = '';
}

namespace Mammal {
  export interface Literal extends Animal.Literal {
    hairType: 'definitive' | 'vibrissae' | 'pelage' | 'spines' | 'bristles' | 'velli' | 'wool';
  }
}

class Mammal<Literal extends Mammal.Literal = Mammal.Literal> extends Animal<Literal> implements lng.Component.ImplementLiteral<Mammal.Literal> {
  static _template(): lng.Component.Template<Mammal> {
    return {
      name: 'Unknown',
      hairType: 'bristles'
    };
  }

  _init() {
    this.name = 'unkonwn2';
    this.hairType = 'definitive';

    // 'as Literal' required due to ts(2345)
    this.patch({
      name: 'Still Unkown',
      hairType: 'pelage'
    } as Literal);

    // If this and error above goes away, it's a good thing! Update the tests and documentation
    // @ts-expect-error 'as Literal' required
    this.patch({
      name: 'Still Unkown',
      hairType: 'pelage'
    });
  }

  hairType: Mammal.Literal['hairType'] = 'bristles'
}

namespace Bear {
  export interface Literal extends Mammal.Literal {
    bearType: 'black' | 'grizzlie' | 'polar';
  }
}

class Bear extends Mammal<Bear.Literal> implements lng.Component.ImplementLiteral<Bear.Literal> {
  static _template(): lng.Component.Template<Bear> {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      color: 0xffffffff,
      rtt: true,
      mount: 0.0,
      mountX: 0.5,
      mountY: 1.0,
      bearType: 'grizzlie'
    };
  }

  _init() {
    this.name = 'Coldilocks';
    this.hairType = 'pelage';
    this.bearType = 'grizzlie';
    this.patch({
      name: 'Coldilocks',
      hairType: 'pelage',
      bearType: 'polar'
    });
  }

  bearType: Bear.Literal['bearType'] = 'black';
}

namespace Cat {
  export interface Literal extends Mammal.Literal {
    catType: 'house' | 'lion' | 'tiger' | 'leopard';
  }
}

class Cat extends Mammal<Cat.Literal> implements lng.Component.ImplementLiteral<Cat.Literal> {
  static _template(): lng.Component.Template<Cat> {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      color: 0xffffffff,
      rtt: true,
      mount: 0.0,
      mountX: 0.5,
      mountY: 1.0,
      catType: 'house'
    };
  }

  _init() {
    this.name = 'Buyo';
    this.hairType = 'pelage';
    this.catType = 'house';
    this.patch({
      name: 'Simba',
      hairType: 'definitive',
      catType: 'lion'
    });
  }

  catType: Cat.Literal['catType'] = 'house';
}
