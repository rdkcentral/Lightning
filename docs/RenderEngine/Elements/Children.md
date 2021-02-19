# Children


You use the `.children` property to set the configuration of child nodes. This property is an *Array* containing all child nodes, where every node has a `.children` property.


If so desired, you can define the children array *directly* with an array of elements, or even *patch* objects.


For example:


```
this.tag('List').children = items.map((item, index) => {
    return {
        type: ExampleListItem,
        item: item,
        x: index * 70,
    }
})
```

## ChildList Methods


The `childList` property includes several methods to change the current configuration of the children. The methods are listed in the table below.

| Name | Description |
|---|---|
| `add(item : Element)` | Append child |
| `addAt(item : Element, index : number)` | Add child at the specified index |
| `setAt(item : Element, index : number)` | Replace child at the specified index by the specified child |
| `replace(item : Element, prevItem : Element)` | Replace the previous item with the new item |
| `getAt(index : number) : Element` | Return the view at the specified index |
| `getIndex(item : Element) : number` | Return the index of the specified view |
| `remove(item : Element)` | Return the specified view |
| `removeAt(index : number)` | Return the element at the specified index |
| `clear()` | Remove all children |
| `a(o)` | Append a child or literal patch object |
| `getByRef(ref : String) : Element` | Return the child element with the specified ref |
| `get length() : number` | Return the number of children |
| `get first() : Element` | Return the first view |
| `get last() : Element` | Return the last view |
| `sort(f : Function)` | Sort the children with the sort function |





## Live Demo


```
class TemplateDemo extends lng.Application {
    static _template() {
        return {
            x: 20, y: 20,
            List: { type: ExampleList }
        }
    }
    _init() {
        // let's generate dinamically some list items 
        // and give it to our list
        this.tag('List').items = [1,2,3,4].map((i) => ({label: i }))
    }
}

class ExampleList extends lng.component {
    set items(items) {
        this.children = items.map((item, index) => {
            return {
                type: ExampleListItem,
                x: index * 70, //item width + 20px margin
                item //passing the item as an attribute
            }
        })
    }
}

class ExampleListItem extends lng.component {
    static _template() {
        return {
            rect: true, w: 50, h: 50, color: 0xffff00ff, alpha: 0.8,
            Label: {
                x: 25, y: 30, mount: .5
            }
        }
    }
    _init() {
        this.patch({ Label: { text: { text: this.item.label }}})
    }
}

const options = {stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}};
const App = new TemplateDemo(options);
document.body.appendChild(App.stage.getCanvas());
```