FROM gcr.io/distroless/nodejs18-debian11:nonroot

ENV TZ="Europe/Oslo"
ENV NODE_ENV production

WORKDIR /app

COPY ./dist ./dist
COPY ./src/build/webpack/nais.js ./dist/js/nais.js
COPY ./node_modules ./node_modules
COPY server ./

EXPOSE 8080
CMD ["./server.js"]