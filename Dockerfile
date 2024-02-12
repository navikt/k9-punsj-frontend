FROM gcr.io/distroless/nodejs18-debian11:nonroot

ENV TZ="Europe/Oslo"
ENV NODE_ENV production


COPY ./dist ./dist
COPY server ./

EXPOSE 8080
CMD ["./server.js"]