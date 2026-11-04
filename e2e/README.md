# Playwright

The Chromium smoke suite runs the frontend with its existing MSW test handlers. It does not call the backend.

Install Chromium once:

```sh
yarn exec playwright install chromium
```

Run the suite:

```sh
yarn test:pw
yarn test:pw --workers=1
yarn test:pw -g "viser inngangen"
yarn test:pw:ui
```

Playwright starts `yarn start:e2e`, waits for `/health/isReady`, and stops the server after the run. The app uses port 8080, which it shares with local development and Cypress; only one server can use that port at a time. If the port is occupied, stop the server you started before running the suite.
