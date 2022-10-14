# Tags


Tags are used to reference objects inside a template.


For example, if you have defined the following object:


```
static _template(){
    return {
        MyObject:{ x: 0, y: 0, w: 50, h: 50, rect: true }
    }
}
```


You can refer to it with `this.tag()`, as shown below:


```
const myObject = this.tag('MyObject');
```