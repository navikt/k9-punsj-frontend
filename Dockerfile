FROM gcr.io/distroless/nodejs20-debian12:nonroot

ENV TZ="Europe/Oslo"
ENV NODE_ENV=production

WORKDIR /app

COPY ./dist ./dist
COPY ./src/build/webpack/faroConfig.js ./dist/js/nais.js
COPY ./node_modules ./node_modules
COPY server ./

EXPOSE 8080
CMD ["./server.js"]