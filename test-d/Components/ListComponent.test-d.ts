import lng from '../../index';
import { expectType } from 'tsd';
import TransitionSettings from '../../src/animation/TransitionSettings.mjs';
import AnimationSettings from '../../src/animation/AnimationSettings.mjs';

namespace Container {
  export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
    ListComponent: typeof lng.components.ListComponent;
    ListComponent_Specific: typeof lng.components.ListComponent<typeof lng.components.BloomComponent>;
  }
}

class Container extends lng.Component<Container.TemplateSpec> implements lng.Component.ImplementTemplateSpec<Container.TemplateSpec> {
  static _template(): lng.Component.Template<Container.TemplateSpec> {
    // Template validity
    return {
      ListComponent: {
        type: lng.components.ListComponent,
        items: [
          {
            text: 'Item 1'
          },
          {
            text: 'Item 2'
          },
          {
            text: 'Item 3'
          }
        ],
        itemSize: 10,
        viewportScrollOffset: 0,
        itemScrollOffset: 0,
        scrollTransitionSettings: {
          delay: 10,
          duration: 10,
          timingFunction: 'ease',
        },
        scrollTransition: {
          delay: 10,
          duration: 10,
          timingFunction: 'cubic-bezier(0.1,0.2,0.3,0.4)'
        },
        progressAnimation: {
          actions: [
            {
              properties: 'prop',
              // @ts-expect-error Sanity test: selector needs to be a string
              selector: 123,
              value: {
                0: 12,
                1: 31,
                sm: 12,
                // @ts-expect-error
                INVALID_PROP: 123
              }
            }
          ],
          stopMethod: AnimationSettings.STOP_METHODS.FADE
        },
        roll: true,
        rollMin: 10,
        rollMax: 20,
        invertDirection: true,
        horizontal: true
      }
    };
  }

  ListComponent: lng.components.ListComponent = this.getByRef('ListComponent')!;
  ListComponent_Specific: lng.components.ListComponent<typeof lng.components.BloomComponent> = this.getByRef('ListComponent_Specific')!;

  _init() {
    // Verify types of ListComponents
    expectType<lng.components.ListComponent>(this.getByRef('ListComponent')!);
    expectType<lng.components.ListComponent<typeof lng.components.BloomComponent>>(this.getByRef('ListComponent_Specific')!);

    // Direct property getting (TemplateSpec properties)
    expectType<
      lng.Element[]
    >(this.ListComponent.items);
    expectType<number>(this.ListComponent.itemSize);
    expectType<number>(this.ListComponent.viewportScrollOffset);
    expectType<number>(this.ListComponent.itemScrollOffset);
    expectType<TransitionSettings>(this.ListComponent.scrollTransitionSettings);
    expectType<TransitionSettings>(this.ListComponent.scrollTransition);
    expectType<AnimationSettings | null>(this.ListComponent.progressAnimation);
    expectType<boolean>(this.ListComponent.roll);
    expectType<number>(this.ListComponent.rollMin);
    expectType<boolean>(this.ListComponent.invertDirection);
    expectType<boolean>(this.ListComponent.horizontal);

    // Direct property getting (Non-TemplateSpec readonly properties)
    expectType<lng.tools.ObjectListWrapper<lng.Element, lng.Element.PatchTemplate<lng.Element['__$type_TemplateSpec']>>>(this.ListComponent.itemList);
    expectType<lng.Element | null>(this.ListComponent.element);
    expectType<number>(this.ListComponent.length);
    expectType<'x' | 'y'>(this.ListComponent.property);
    expectType<number>(this.ListComponent.viewportSize);
    expectType<number>(this.ListComponent.index);
    expectType<number>(this.ListComponent.realIndex);

    // Direct property setting (TemplateSpec properties)
    this.ListComponent.items = [
      { text: 'child1' },
      { text: 'child2' }
    ];
    this.ListComponent.itemSize = 123;
    this.ListComponent.viewportScrollOffset = 123;
    this.ListComponent.itemScrollOffset = 123;
    this.ListComponent.scrollTransitionSettings = {} as TransitionSettings.Literal;
    this.ListComponent.scrollTransition = {} as TransitionSettings.Literal;
    this.ListComponent.progressAnimation = {} as AnimationSettings.Literal;
    this.ListComponent.progressAnimation = {} as AnimationSettings;
    this.ListComponent.progressAnimation = null;
    this.ListComponent.roll = true;
    this.ListComponent.rollMin = 123;
    this.ListComponent.invertDirection = true;
    this.ListComponent.horizontal = false;

    // Function calls
    expectType<void>(this.ListComponent.setIndex(123));
    expectType<void>(this.ListComponent.setIndex(123, false));
    expectType<void>(this.ListComponent.setIndex(123, true, false));
    expectType<number>(this.ListComponent.getAxisPosition());
    expectType<void>(this.ListComponent.setPrevious());
    expectType<void>(this.ListComponent.setNext());
    expectType<lng.Element | undefined>(this.ListComponent.getWrapper(123));

    // Indirect patch
    this.patch({
      ListComponent: {
        items: [
          {
            text: 'Item 1'
          },
          {
            text: 'Item 2'
          },
          {
            text: 'Item 3'
          }
        ],
        itemSize: 10,
        viewportScrollOffset: 0,
        itemScrollOffset: 0,
        scrollTransitionSettings: {
          delay: 10,
          duration: 10,
          timingFunction: 'ease',
        },
        scrollTransition: {
          delay: 10,
          duration: 10,
          timingFunction: 'cubic-bezier(0.1,0.2,0.3,0.4)'
        },
        progressAnimation: {
          actions: [
            {
              properties: 'prop',
              selector: 'selector',
              value: {
                0: 12,
                1: 31,
                sm: 12,
                // @ts-expect-error
                INVALID_PROP: 123
              }
            }
          ],
          stopMethod: AnimationSettings.STOP_METHODS.FADE
        },
        roll: true,
        rollMin: 10,
        rollMax: 20,
        invertDirection: true,
        horizontal: true
      }

    });

    // Direct patch
    this.ListComponent.patch({
      items: [
        {
          text: 'Item 1'
        },
        {
          text: 'Item 2'
        },
        {
          text: 'Item 3'
        }
      ],
      itemSize: 10,
      viewportScrollOffset: 0,
      itemScrollOffset: 0,
      scrollTransitionSettings: {
        delay: 10,
        duration: 10,
        timingFunction: 'ease',
      },
      scrollTransition: {
        delay: 10,
        duration: 10,
        timingFunction: 'cubic-bezier(0.1,0.2,0.3,0.4)'
      },
      progressAnimation: {
        actions: [
          {
            properties: 'prop',
            selector: 'selector',
            value: {
              0: 12,
              1: 31,
              sm: 12,
              // @ts-expect-error
              INVALID_PROP: 123
            }
          }
        ],
        stopMethod: AnimationSettings.STOP_METHODS.FADE
      },
      roll: true,
      rollMin: 10,
      rollMax: 20,
      invertDirection: true,
      horizontal: true
    });

    // Specific type tests
    this.ListComponent_Specific.items = [
      {
        alpha: 0.5,
        // @ts-expect-error amount is spected to be a number
        amount: '123',
        paddingX: 1,
      },
      {
        alpha: 0.5,
        // @ts-expect-error amount is spected to be a number
        amount: '123',
        paddingX: 1,
      }
    ];

    expectType<
      lng.tools.ObjectListWrapper<
        lng.components.BloomComponent,
        lng.Element.PatchTemplate<lng.components.BloomComponent['__$type_TemplateSpec']>
      >
    >(this.ListComponent_Specific.itemList);
    expectType<lng.components.BloomComponent | null>(this.ListComponent_Specific.getElement(0));
    expectType<lng.components.BloomComponent | null>(this.ListComponent_Specific.element);
    expectType<lng.components.BloomComponent[]>(this.ListComponent_Specific.items);
  }
}