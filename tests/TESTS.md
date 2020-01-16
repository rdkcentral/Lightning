## Setup
Tests are run against bundled Lightning. To run them, build distribution using `npm run build` first,
then run tests against bundle of choice by modifying `test.html`.

## Tests
Tests are constructed to run on web browser.
To perform them, host Lightning's root directory using webserver of choice, e.g:
```javascript
http-server -c-1
```
and enter url in your browser, e.g:
`http://localhost:8080/tests/test.html`