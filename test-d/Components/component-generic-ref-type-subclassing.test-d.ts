import { expectType } from 'tsd';
import lng from '../../src/index.js';
import { TemplateSpecTags, TemplateSpecRefs } from '../../src/tree/Element.mjs';

///
/// Test that we can create a Component class that accepts a generic Component type
/// for a Ref in its template spec
///

class Header extends lng.Component {
  headerSpecificProperty = 'abc'
}

export interface IPageTemplateSpec<
  T extends lng.Component.Constructor = lng.Component.Constructor,
> extends lng.Component.TemplateSpec {
  Header: typeof Header
  Content: T
}

export interface IPageTypeConfig extends lng.Component.TypeConfig {
  IsPage: true
}

export class Page<T extends lng.Component.Constructor = lng.Component.Constructor>
  extends lng.Component<IPageTemplateSpec<T>, IPageTypeConfig>
  implements lng.Component.ImplementTemplateSpec<IPageTemplateSpec<T>>
{
  static override _template(): lng.Component.Template<IPageTemplateSpec> {
    return {
      w: (w: number) => w,
      h: (h: number) => h,
      rect: true,
      color: 0xff0e0e0e,

      Header: {
        type: Header,
      },
      Content: undefined,
    }
  }

  override _init() {
    /// Content (Direct checks)
    expectType<NonNullable<TemplateSpecTags<IPageTemplateSpec<T>>["Content"]>>(this.Content_tag);
    expectType<NonNullable<TemplateSpecRefs<IPageTemplateSpec<T>>["Content"]>>(this.Content_getByRef);
    expectType<TemplateSpecTags<IPageTemplateSpec<T>>["Content"] | undefined>(this.tag('Content'));
    expectType<TemplateSpecRefs<IPageTemplateSpec<T>>["Content"] | undefined>(this.getByRef('Content'));

    /// Content (Upcast checks)
    expectType<lng.Component>((this as Page).Content_tag);
    expectType<lng.Component>((this as Page).Content_getByRef);
    expectType<lng.Component | undefined>((this as Page).tag('Content'));
    expectType<lng.Component | undefined>((this as Page).getByRef('Content'));

    /// Header (direct checks)
    expectType<NonNullable<TemplateSpecTags<IPageTemplateSpec<T>>["Header"]>>(this.Header_tag);
    expectType<NonNullable<TemplateSpecRefs<IPageTemplateSpec<T>>["Header"]>>(this.Header_getByRef);
    expectType<TemplateSpecTags<IPageTemplateSpec<T>>["Header"] | undefined>(this.tag('Header'));
    expectType<TemplateSpecRefs<IPageTemplateSpec<T>>["Header"] | undefined>(this.getByRef('Header'));

    /// Header (upcast checks)
    expectType<Header>((this as Page).Header_tag);
    expectType<Header>((this as Page).Header_getByRef);
    expectType<Header | undefined>((this as Page).tag('Header'));
    expectType<Header | undefined>((this as Page).getByRef('Header'));
  }

  protected Content_tag = this.tag('Content')!
  protected Content_getByRef = this.getByRef('Content')!;

  protected Header_tag = this.tag('Header')!
  protected Header_getByRef = this.getByRef('Header')!;
}


class List extends lng.Component {
  listSpecificProperty = true
}

export class Discovery extends Page<typeof List> {
  static override _template(): lng.Component.Template<IPageTemplateSpec<typeof List>> {
    // Must assert the specific template type to the type of the template spec
    // because `super._template()` isn't/can't be aware of List
    const pageTemplate = super._template() as lng.Component.Template<
      IPageTemplateSpec<typeof List>
    >

    pageTemplate.Content = {
      type: List,
    }

    return pageTemplate
  }

  override _init() {
    /// Content (in sub-class)
    expectType<List>(this.Content_tag);
    expectType<List>(this.Content_getByRef);
    expectType<List | undefined>(this.tag('Content'));
    expectType<List | undefined>(this.getByRef('Content'));
    expectType<boolean>(this.Content_tag.listSpecificProperty);
    expectType<boolean>(this.Content_getByRef.listSpecificProperty);

    /// Header (in sub-class)
    expectType<Header>(this.Header_tag);
    expectType<Header>(this.Header_getByRef);
    expectType<Header | undefined>(this.tag('Header'));
    expectType<Header | undefined>(this.getByRef('Header'));
  }
}
