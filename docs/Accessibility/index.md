# Accessibility

As with all interfaces, Accessibility starts with good design choices. We recommend reading [Designing for Web Accessibility](https://www.w3.org/WAI/tips/designing/) from the W3C for an extensive list of best practices for creating an accessible UI.

Since Lightning is a WebGL rendering library, we can't take advantage of the standard HTML components and the browser's built-in ARIA attributes. Instead, we recommend using the [Lightning UI Component library](https://github.com/rdkcentral/Lightning-UI-Components) which also includes a [withAnnouncer mixin](https://rdkcentral.github.io/Lightning-UI-Components/?path=/docs/mixins-withannouncer--basic) that allows for relevant information to be voiced along the [focus path](../HandlingInput/RemoteControl/Focus.md) of the application. By default, it uses the [speechSynthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis), but can be customized to use any speech engine available on the device.

## How `withAnnouncer` works

Lightning applications use a concept called the [focus path](../RemoteControl/Focus.md) and each component can delegate focus to a child component. This creates a hierarchy like the following table shows:

| Index | Component | Property | Value |
| --- | ---- | ------------ | ------------- |
| 0 | BrowsePage-1 | Title | Free to Me
| 1 | Grid | Title |
| 2 | Column | Title |
| 3 | Row | Title | Popular Movies - Free to Me
| 4 | Items | Title |
| 5 | TileItem | Title | Teenage Mutant Ninja Turtles: Out of the Shadows
| 6 | Metadata | Announce | Promise
| 7 | Metadata | No Context |
| 8 | TileItem | Context | 1 of 5
| 9 | Items | No Context |
| 10 | Row | No Context |
| 11 | Rows | No Context |
| 12 | Grid | No Context |
| 13 | BrowsePage-1 | Context |  PAUSE-2 press LEFT or RIGHT to review items...

The `withAnnouncer` mixin will travel through the `_focusPath` looking for `component.announce` then `component.title` then `component.label` properties. After collecting those properties it reverses the `_focusPath` looking for `component.announceContext` properties. This allows for fine grain controls on what should be spoken out to the user. Please review the documentation for [withAnnouncer](https://rdkcentral.github.io/Lightning-UI-Components/?path=/docs/mixins-withannouncer--basic) for more information.


## Example Apps

To get a better understanding of `withAnnouncer`, we've built a sample application you can check out: https://github.com/ComcastSamples/lightning-ui-tmdb - Be sure to turn on *Announcer* by pressing `V` and debug by `D` and opening developer tools.
