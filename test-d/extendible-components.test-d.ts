/**
 * Tests for the ability to allow your strongly typed components to be extendible
 */

import lng from '../index.js';

namespace Animal {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    name: string;
  }
}

class Animal<TemplateSpecType extends Animal.TemplateSpec = Animal.TemplateSpec> extends lng.Component<TemplateSpecType> implements lng.Component.ImplementTemplateSpec<Animal.TemplateSpec> {
  static _template(): lng.Component.Template<Animal.TemplateSpec> {
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

    // 'as TemplateSpecType' required due to ts(2345)
    this.patch({
      name: 'Still Unkown'
    } as TemplateSpecType);

    // If this and same error below go away it's a good thing! Update the tests and documentation
    // @ts-expect-error 'as TemplateSpecType' required
    this.patch({
      name: 'Still Unkown'
    });
  }

  name: string = '';
}

namespace Mammal {
  export interface TemplateSpec extends Animal.TemplateSpec {
    hairType: 'definitive' | 'vibrissae' | 'pelage' | 'spines' | 'bristles' | 'velli' | 'wool';
  }
}

class Mammal<TemplateSpecType extends Mammal.TemplateSpec = Mammal.TemplateSpec> extends Animal<TemplateSpecType> implements lng.Component.ImplementTemplateSpec<Mammal.TemplateSpec> {
  static _template(): lng.Component.Template<Mammal.TemplateSpec> {
    return {
      name: 'Unknown',
      hairType: 'bristles'
    };
  }

  _init() {
    this.name = 'unkonwn2';
    this.hairType = 'definitive';

    // 'as TemplateSpecType' required due to ts(2345)
    this.patch({
      name: 'Still Unkown',
      hairType: 'pelage'
    } as TemplateSpecType);

    // If this and error above goes away, it's a good thing! Update the tests and documentation
    // @ts-expect-error 'as TemplateSpecStrong' required
    this.patch({
      name: 'Still Unkown',
      hairType: 'pelage'
    });
  }

  hairType: Mammal.TemplateSpec['hairType'] = 'bristles'
}

namespace Bear {
  export interface TemplateSpec extends Mammal.TemplateSpec {
    bearType: 'black' | 'grizzlie' | 'polar';
  }
}

class Bear extends Mammal<Bear.TemplateSpec> implements lng.Component.ImplementTemplateSpec<Bear.TemplateSpec> {
  static _template(): lng.Component.Template<Bear.TemplateSpec> {
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

  bearType: Bear.TemplateSpec['bearType'] = 'black';
}

namespace Cat {
  export interface TemplateSpec extends Mammal.TemplateSpec {
    catType: 'house' | 'lion' | 'tiger' | 'leopard';
  }
}

class Cat extends Mammal<Cat.TemplateSpec> implements lng.Component.ImplementTemplateSpec<Cat.TemplateSpec> {
  static _template(): lng.Component.Template<Cat.TemplateSpec> {
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

  catType: Cat.TemplateSpec['catType'] = 'house';
}
