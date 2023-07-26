# Stage 1: Perform environment substitution in a full-featured base image
FROM alpine:3.14 AS builder

RUN apk add --no-cache gettext
ENV OIDC_AUTH_PROXY=https://k9-punsj-oidc-auth-proxy.dev.intern.nav.no
COPY dist /usr/share/nginx/html/dist
COPY dist/index.html /usr/share/nginx/html/index.html
COPY server.nginx /etc/nginx/conf.d/app.conf.template
COPY start-server.sh /start-server.sh

RUN sh /start-server.sh

# Stage 2: Copy the resulting files into a distroless base image
FROM cgr.dev/chainguard/nginx:latest
COPY --from=builder /usr/share/nginx/html/dist /usr/share/nginx/html/dist
COPY --from=builder /tmp/k9-punsj/env.json /usr/share/nginx/html/getEnvVariables
COPY --from=builder /usr/share/nginx/html /usr/share/nginx/html
COPY --from=builder /etc/nginx/conf.d /etc/nginx/conf.d
