/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
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

describe('event-emitter', function() {
  let TestObj

  beforeEach(() => {
    TestObj = new lng.EventEmitter()
  })

  it('should have initial values', function() {
    chai.assert(TestObj._hasEventListeners === false);
    chai.assert(TestObj._eventFunction === undefined);
    chai.assert(TestObj._eventListeners === undefined);
  })

  it('should emit on events', function() {
    let called1 = false
    let called2 = false
    let called3 = false
    TestObj.on('test', () => {
      called1 = true
    })
    TestObj.on('test', () => {
      called2 = true
    })
    TestObj.on('test2', () => {
      called3 = true
    })
    TestObj.emit('test')
    chai.assert(TestObj._hasEventListeners === true);
    chai.assert(TestObj._eventFunction.test.on === lng.EventEmitter.combiner);
    chai.assert(TestObj._eventListeners.test.on.length === 2);
    chai.assert(called1 === true)
    chai.assert(called2 === true)
    chai.assert(called3 === false)
    called1 = false
    called2 = false
    called3 = false
    TestObj.emit('test')
    chai.assert(called1 === true)
    chai.assert(called2 === true)
    chai.assert(called3 === false)
  })

  it('should emit once events just once', function() {
    let called1 = false
    let called2 = false
    let called3 = false
    TestObj.once('test', () => {
      called1 = true
    })
    TestObj.once('test', () => {
      called2 = true
    })
    TestObj.once('test2', () => {
      called3 = true
    })
    TestObj.emit('test')
    chai.assert(TestObj._hasEventListeners === false);
    chai.assert(TestObj._eventFunction === undefined);
    chai.assert(TestObj._eventListeners.test === undefined);
    chai.assert(called1 === true)
    chai.assert(called2 === true)
    chai.assert(called3 === false)
    called1 = false
    called2 = false
    called3 = false
    TestObj.emit('test')
    chai.assert(called1 === false)
    chai.assert(called2 === false)
    chai.assert(called3 === false)
  })

  it('has method should return correct values', function() {
    const foo1 = () => {}
    const foo2 = () => {}
    const foo3 = () => {}
    const foo4 = () => {}
    TestObj.once('test', foo1)
    TestObj.on('test', foo2)
    TestObj.once('test2', foo3)
    chai.assert(TestObj.has('test', foo1) === true);
    chai.assert(TestObj.has('test', foo2) === true);
    chai.assert(TestObj.has('test2', foo3) === true);
    chai.assert(TestObj.has('test', foo4) === false);
  })

  it('listenerCount should return correct values', function() {
    const foo1 = () => {}
    const foo2 = () => {}
    const foo3 = () => {}
    TestObj.once('test', foo1)
    TestObj.on('test', foo2)
    TestObj.once('test2', foo3)
    chai.assert(TestObj.listenerCount('test') === 2);
    chai.assert(TestObj.listenerCount('test2') === 1);
    chai.assert(TestObj.listenerCount('test3') === 0);
  })

  it('should remove all listeners', function() {
    const foo1 = () => {}
    const foo2 = () => {}
    TestObj.once('test', foo1)
    TestObj.on('test', foo2)
    TestObj.removeAllListeners('test')
    chai.assert(TestObj.listenerCount('test') === 0);
    chai.assert(TestObj._hasEventListeners === false);
    chai.assert(TestObj._eventFunction.test === undefined);
    chai.assert(TestObj._eventListeners.test === undefined);
  })
})