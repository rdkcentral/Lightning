# Remote and Keyboard Control Interaction


Remote controls and keyboards function very similarly, a user presses a button and that button press is sent to the UI as a keypress with an ASCII code, which is mapped to a name. When working on a computer with a keyboard, most keypresses are sent directly to the browser for handling. A remote control may operate differently, some keypresses may not be sent to the UI such as Volume control. Additionally, how the remote control sends multiple keypresses or holding down a key may vary by TV device. For instance, holding down a button on a remote may send the keypress right away, and then repeat a keypress every 500ms.

Now that you know how we receive input, learn more about how to handle key presses and focus:

* [Key Handling](KeyHandling.md)
* [Focus](Focus.md)
