import lng from '../index.js';
/**
 * Basic tests for the Application class
 */
export class MyApp extends lng.Application {

}

/// Can be constructed with options
new MyApp({
  debug: true,
  enablePointer: true,
  keys: {
    1: 'Enter',
    2: 'Back',
    3: 'Rewind'
  },
  stage: {
    w: 1920,
    h: 1080,
    useImageWorker: true,
  }
});

new MyApp({
  debug: false,
  enablePointer: false,
  stage: {}
});
