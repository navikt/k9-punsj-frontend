FROM nginx as builder
ARG OIDC_AUTH_PROXY

# Copy necessary files for envsubst
COPY dist/envVariablesForEnvSubst.json /
COPY server.nginx /

# Set and substitute environment variables
RUN envsubst '$OIDC_AUTH_PROXY' < server.nginx > default.conf \
    && envsubst < envVariablesForEnvSubst.json > env.json

# Use security hardened nginx image
FROM cgr.dev/chainguard/nginx:latest

# Copy assets and configurations
COPY dist /usr/share/nginx/html/dist
COPY dist/index.html /usr/share/nginx/html/index.html
COPY --from=builder default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder env.json /tmp/k9-punsj/env.json
