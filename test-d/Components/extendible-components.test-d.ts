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
/**
 * Tests for the ability to allow your strongly typed components to be extendible
 */

import lng from '../../index.js';

namespace Animal {
  export interface TemplateSpec extends lng.Component.TemplateSpec {
    name: string;
  }

  export interface EventMap extends lng.Component.EventMap {
    birthed(): void;
    died(): void;
  }

  export interface TypeConfig extends lng.Component.TypeConfig {
    EventMapType: EventMap;
  }
}

class Animal<
  TemplateSpecType extends Animal.TemplateSpec = Animal.TemplateSpec,
  TypeConfig extends Animal.TypeConfig = Animal.TypeConfig
> extends lng.Component<TemplateSpecType, TypeConfig> implements lng.Component.ImplementTemplateSpec<Animal.TemplateSpec> {
  static override _template(): lng.Component.Template<Animal.TemplateSpec> {
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
    };
  }

  name: string = '';

  override _init() {
    this.name = 'unknown';

    // This assertion is required for components that are sub-classable
    // See: https://github.com/microsoft/TypeScript/issues/43621 and related issues
    (this as Animal).patch({
      name: 'Still unknown'
    });

    (this as Animal).emit('birthed');
    (this as Animal).emit('died');
  }
}

namespace Mammal {
  export interface TemplateSpec extends Animal.TemplateSpec {
    hairType: 'definitive' | 'vibrissae' | 'pelage' | 'spines' | 'bristles' | 'velli' | 'wool';
  }

  export interface EventMap extends Animal.EventMap {
    growHair(length: number): void;
  }

  export interface TypeConfig extends Animal.TypeConfig {
    EventMapType: EventMap
  }
}

class Mammal<
  TemplateSpecType extends Mammal.TemplateSpec = Mammal.TemplateSpec,
  TypeConfig extends Mammal.TypeConfig = Mammal.TypeConfig
> extends Animal<TemplateSpecType, TypeConfig> implements lng.Component.ImplementTemplateSpec<Mammal.TemplateSpec> {
  static override _template(): lng.Component.Template<Mammal.TemplateSpec> {
    return {
      rect: true
    };
  }

  hairType: Mammal.TemplateSpec['hairType'] = 'bristles'

  // Instead of `as` assertion this can be asserted as first param of any method
  override _init(this: Mammal) {
    this.name = 'unkonwn2';
    this.hairType = 'definitive';

    this.patch({
      name: 'Still Unkown',
      hairType: 'definitive'
    });

    this.emit('birthed');
    this.emit('growHair', 7);
    this.emit('died');
  }
}

namespace Bear {
  export interface TemplateSpec extends Mammal.TemplateSpec {
    bearType: 'black' | 'grizzlie' | 'polar';
  }

  export interface EventMap extends Mammal.EventMap {
    roar(loudness: number): void;
    stealPicnicBasket(): void;
    eatHoney(amount: number): void;
  }

  export interface TypeConfig extends Mammal.TypeConfig {
    EventMapType: EventMap
  }
}

class Bear extends Mammal<
  Bear.TemplateSpec,
  Bear.TypeConfig
> implements lng.Component.ImplementTemplateSpec<Bear.TemplateSpec> {
  static override _template(): lng.Component.Template<Bear.TemplateSpec> {
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
    };
  }

  override _init() {
    this.name = 'Coldilocks';
    this.hairType = 'pelage';
    this.bearType = 'grizzlie';
    this.patch({
      name: 'Coldilocks',
      hairType: 'pelage',
      bearType: 'polar'
    });
    this.animation({
      duration: 10,
      actions: [
        { p: 'bearType', v: 'grizzlie' }
      ]
    });
    this.emit('birthed');
    this.emit('eatHoney', 500);
    this.emit('growHair', 7);
    this.emit('roar', 11);
    this.emit('stealPicnicBasket');
    this.emit('died');
  }

  bearType: Bear.TemplateSpec['bearType'] = 'black';
}

namespace Cat {
  export interface TemplateSpec extends Mammal.TemplateSpec {
    catType: 'house' | 'lion' | 'tiger' | 'leopard';
  }

  export interface EventMap extends Mammal.EventMap {
    lickPaws(): void;
    chaseMouse(): void;
    lookDisinterested(): void;
  }

  export interface TypeConfig extends Mammal.TypeConfig {
    EventMapType: EventMap;
  }
}

class Cat extends Mammal<Cat.TemplateSpec, Cat.TypeConfig> implements lng.Component.ImplementTemplateSpec<Cat.TemplateSpec> {
  static override _template(): lng.Component.Template<Cat.TemplateSpec> {
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
    };
  }

  override _init() {
    this.name = 'Buyo';
    this.hairType = 'pelage';
    this.catType = 'house';
    this.patch({
      name: 'Simba',
      hairType: 'definitive',
      catType: 'lion'
    });

    this.emit('birthed');
    this.emit('growHair', 2);
    this.emit('lickPaws');
    this.emit('lookDisinterested');
    this.emit('chaseMouse');
    this.emit('died');
  }

  catType: Cat.TemplateSpec['catType'] = 'house';
}
