/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
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

describe('Event Emitter', function() {
    let TestObj;
  
    beforeEach(() => {
      TestObj = new lng.EventEmitter();
    });
  
    it('should have initial values', function() {
      chai.assert(TestObj._hasEventListeners === false);
      chai.assert(TestObj._eventFunction === undefined);
      chai.assert(TestObj._eventListeners === undefined);
    });
  
    it('should emit on events', function() {
      let called1 = false;
      let called2 = false;
      let called3 = false;
      TestObj.on('test', () => {
        called1 = true;
      });
      TestObj.on('test', () => {
        called2 = true;
      });
      TestObj.on('test2', () => {
        called3 = true;
      });
      TestObj.emit('test');
      chai.assert(TestObj._hasEventListeners === true);
      chai.assert(TestObj.listenerCount('test') === 2);
      chai.assert(called1 === true);
      chai.assert(called2 === true);
      chai.assert(called3 === false);
      called1 = false;
      called2 = false;
      called3 = false;
      TestObj.emit('test');
      chai.assert(called1 === true);
      chai.assert(called2 === true);
      chai.assert(called3 === false);
    });

    it('should be able to detach itself [one listener]', function() {
      let called1 = false;
      const cb1 = () => {
        called1 = true;
        TestObj.off('test', cb1)
      };
      TestObj.on('test', cb1)
      TestObj.emit('test');
      chai.assert(called1 === true);
      called1 = false;
      TestObj.emit('test');
      chai.assert(called1 === false);
      chai.assert(TestObj.listenerCount('test') === 0);
    });

    it('should be able to detach itself [multiple listeners]', function() {
      let called1 = false;
      let called2 = false;
      let called3 = false;
      const cb1 = () => {
        called1 = true;
        TestObj.off('test', cb1)
      };
      const cb2 = () => {
        called2 = true;
      };
      const cb3 = () => {
        called3 = true;
      };
      TestObj.on('test', cb1)
      TestObj.on('test', cb2)
      TestObj.on('test', cb3)
      TestObj.emit('test');
      chai.assert(called1 === true);
      chai.assert(called2 === true);
      chai.assert(called3 === true);
      called1 = false;
      called2 = false;
      called3 = false;
      TestObj.emit('test');
      chai.assert(called1 === false);
      chai.assert(called2 === true);
      chai.assert(called3 === true);
    });

    it('should emit once events just once [one listener]', function() {
      let called1 = false;
      TestObj.once('test', () => {
        called1 = true;
      });
      TestObj.emit('test');
      chai.assert(called1 === true);
      called1 = false;
      TestObj.emit('test');
      chai.assert(called1 === false);
    });

    it('should emit once events just once [multiple listeners]', function() {
      let called1 = false;
      let called2 = false;
      let called3 = false;
      TestObj.on('test', () => {
        called1 = true;
      });
      TestObj.once('test', () => {
        called2 = true;
      });
      TestObj.once('test2', () => {
        called3 = true;
      });
      TestObj.emit('test');
      chai.assert(called1 === true);
      chai.assert(called2 === true);
      chai.assert(called3 === false);
      called1 = false;
      called2 = false;
      called3 = false;
      TestObj.emit('test');
      chai.assert(called1 === true);
      chai.assert(called2 === false);
      chai.assert(called3 === false);
    });

    it('should be able to use same callback for multiple events', function() {
      let called1 = 0;
      let cb = () => {
          called1 += 1;
      };
      TestObj.once('test2', cb);
      TestObj.on('test', cb);
      TestObj.once('test3', cb);

      TestObj.emit('test');
      TestObj.emit('test');
      TestObj.emit('test2');
      TestObj.emit('test2');
      TestObj.emit('test3');
      chai.assert(called1 === 4);
    });

    it('should emit once per registration', function() {
      // This behavior is questionable, perhaps redundant registrations should be dismissed.
      let called1 = 0;
      let cb = () => {
          called1 += 1;
      };

      TestObj.once('test', cb);
      TestObj.once('test', cb);
      TestObj.once('test', cb);

      TestObj.emit('test');
      chai.assert(called1 === 3);
      TestObj.emit('test');
      chai.assert(called1 === 3);


    });
  
    it('has method should return correct values', function() {
      const foo1 = () => {};
      const foo2 = () => {};
      const foo3 = () => {};
      const foo4 = () => {};
      TestObj.once('test', foo1);
      TestObj.on('test', foo2);
      TestObj.once('test2', foo3);
      chai.assert(TestObj.has('test', foo1) === true);
      chai.assert(TestObj.has('test', foo2) === true);
      chai.assert(TestObj.has('test2', foo3) === true);
      chai.assert(TestObj.has('test', foo4) === false);
    });
  
    it('listenerCount should return correct values', function() {
      const foo1 = () => {};
      const foo2 = () => {};
      const foo3 = () => {};

      TestObj.once('test', foo1);
      TestObj.on('test', foo2);
      TestObj.once('test2', foo3);
      chai.assert(TestObj.listenerCount('test') === 2);
      chai.assert(TestObj.listenerCount('test2') === 1);
      chai.assert(TestObj.listenerCount('test3') === 0);

      TestObj.once('test', foo1);
      TestObj.on('test', foo2);
      TestObj.once('test2', foo3);
      chai.assert(TestObj.listenerCount('test') === 4);
      chai.assert(TestObj.listenerCount('test2') === 2);
      chai.assert(TestObj.listenerCount('test3') === 0);

      TestObj.emit('test');
      chai.assert(TestObj.listenerCount('test') === 2);
      chai.assert(TestObj.listenerCount('test2') === 2);
      chai.assert(TestObj.listenerCount('test3') === 0);

      TestObj.off('test', foo2);
      chai.assert(TestObj.listenerCount('test') === 1);
      chai.assert(TestObj.listenerCount('test2') === 2);
      TestObj.off('test', foo2);
      chai.assert(TestObj.listenerCount('test') === 0);
      chai.assert(TestObj.listenerCount('test2') === 2);

      TestObj.off('test2', foo3);
      chai.assert(TestObj.listenerCount('test2') === 1);

      TestObj.off('test2', foo3);
      chai.assert(TestObj.listenerCount('test2') === 0);
    });

    it('should preserve function context', function() {
      const ctx = {ctx: 'func'};

      const foo1 = function() {
        chai.assert(this.ctx == 'func');
      }.bind(ctx);

      class Example {
        constructor() {
          this.ctx = 'inst';
        }

        foo1() {
          chai.assert(this.ctx == 'inst');
        }
      }

      const inst = new Example();

      TestObj.on('test', foo1);
      TestObj.on('test2', foo1);
      TestObj.on('test3', () => inst.foo1());
      TestObj.once('test', foo1);
      TestObj.once('test2', foo1);
      TestObj.once('test3', () => inst.foo1());

      TestObj.emit('test');
      TestObj.emit('test2');
      TestObj.emit('test3');
    });

    it('should have proper default context', function() {
      // Perhaps it would be good to change default context to EventEmitter instance
      const foo1 = function() {
        chai.assert(this === undefined);
      }
      TestObj.on('test', foo1);
      TestObj.emit('test')

    });

    it('should remove single listener', function() {
      const foo1 = () => {};
      const foo2 = () => {};
      TestObj.once('test', foo1);
      TestObj.on('test', foo2);
      TestObj.off('test', foo1);
      chai.assert(TestObj.listenerCount('test') === 1);
      TestObj.off('test', foo2);
      chai.assert(TestObj.listenerCount('test') === 0);
    });
  
    it('should remove all listeners', function() {
      const foo1 = () => {};
      const foo2 = () => {};
      TestObj.once('test', foo1);
      TestObj.on('test', foo2);
      TestObj.removeAllListeners('test');
      chai.assert(TestObj.listenerCount('test') === 0);
    });
  }); 
  
