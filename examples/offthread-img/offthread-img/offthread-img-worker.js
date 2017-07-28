/*!
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
!function e(t,r,n){function u(i,s){if(!r[i]){if(!t[i]){var a="function"==typeof require&&require;if(!s&&a)return a(i,!0);if(o)return o(i,!0);var f=new Error("Cannot find module '"+i+"'");throw f.code="MODULE_NOT_FOUND",f}var c=r[i]={exports:{}};t[i][0].call(c.exports,function(e){var r=t[i][1][e];return u(r?r:e)},c,c.exports,e,t,r,n)}return r[i].exports}for(var o="function"==typeof require&&require,i=0;i<n.length;i++)u(n[i]);return u}({1:[function(e,t,r){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var u=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),o=(self.console.log.bind(self.console),function(){function e(t){n(this,e),this.queue=[],this.workerContext=t}return u(e,[{key:"enqueue",value:function(e){this.queue.indexOf(e)>=0||(this.queue.push(e),this.processQueue())}},{key:"processQueue",value:function(){var e=this;if(0!==this.queue.length){var t=this.queue.shift();return fetch(t).then(function(r){return e.workerContext.postMessage({url:t,load:!0}),200!==r.status?e.workerContext.postMessage({error:"Unable to load resource with url "+t}):r.blob()}).then(function(e){return createImageBitmap(e)}).then(function(r){e.workerContext.postMessage({url:t,imageBitmap:r},[r])},function(t){e.workerContext.postMessage({error:t.toString()})}).then(function(){return e.processQueue()})["catch"](function(){return e.processQueue()})}}}]),e}()),i=new o(self);self.onmessage=function(e){return i.enqueue(e.data)}},{}]},{},[1]);