FROM cgr.dev/chainguard/node:18

WORKDIR /usr/src/app

COPY dist ./dist
COPY server.js .
COPY node_modules ./node_modules
COPY package.json .
COPY src/build/envVariables.js ./envVariables.js

EXPOSE 8080
CMD ["/usr/bin/npm", "run", "start-express"]
