# State Switching


You can switch states with `this._setState('MyStateName')`.


The following example visualizes how state switching works, using a blue and green cube as an example.

## Live Demo


```
//Press left or right to switch the states of the blue and green cube.

class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            ExamplanationText:{ x: 50, y: 28, text:{ text: 'Press left for MyBlueState,\n press right for MyGreenState \n', fontSize: 22, wordWrap: true, wordWrapWidth: 450, lineHeight: 30 }},
            MyBlueCube:{
               x: 100, y: 200, w: 100, h: 100, rect: true, color: 0xFF0034DD
            },
            MyGreenCube:{
               x: 400, y: 200, w: 100, h: 100, rect: true, color: 0xFF24DD00
            }
        }
    }
    
    _handleLeft(){
        this._setState('MyBlueState');
    }
    
    _handleRight(){
        this._setState('MyGreenState');
    }
    
    _init(){
        this._blueCubeAnimation = this.tag('MyBlueCube').animation({
            duration: 3, repeat: -1, stopMethod: 'immediate',
            actions: [{ p: 'rotation', v: { 0: { v: 0, sm: 0 }, 1: { v: -Math.PI * 2, sm: 0 } } }]
        });
        this._greenCubeAnimation = this.tag('MyGreenCube').animation({
            duration: 3, repeat: -1, stopMethod: 'immediate',
            actions: [{ p: 'rotation', v: { 0: { v: 0, sm: 0 }, 1: { v: Math.PI * 2, sm: 0 } } }]
        });
    }
        
    static _states(){
        return [
             class MyBlueState extends this{
                $enter(event){
                    this._blueCubeAnimation.play();                    
                }
                $exit(){
                    this._blueCubeAnimation.pause();
                }                            
            },
            class MyGreenState extends this{
                $enter(){
                    this._greenCubeAnimation.play();
                }
                $exit(){
                    this._greenCubeAnimation.pause();
                }
            }
        ];
    }
}

const App = new BasicUsageExample({stage: {w: window.innerWidth, h: window.innerHeight, useImageWorker: false}});
document.body.appendChild(App.stage.getCanvas());
```