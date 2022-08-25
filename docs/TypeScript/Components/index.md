# Components

Much of the time when writting a Lightning application, you're writting [Components](../../Components/index.md). Within each Component you define a [Template](../../Templates/index.md) which defines the starting properties, structure of children and properties of the children. There are

## Template Specs
For TypeScript to be aware of the structure of a Component's Template, you define what we call a [**Template Spec**](TemplateSpecs.md).

## Type Configs
There are also other type structures that can optionally be defined for your component. This includes primarily the events/signals your Component produces. These types are defined as part of a [**Type Config**](TypeConfigs.md).

## Subclassable Components
If you want to write Components that you intend to be extended / subclassed by other Components see [**Subclassable Components**](SubclassableComponents.md).
