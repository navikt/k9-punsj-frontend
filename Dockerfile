FROM nginx as builder

# Copy necessary files for envsubst
COPY dist/envVariablesForEnvSubst.json /dist/
COPY server.nginx /

# Set and substitute environment variables
RUN export APP_HOSTNAME="${HOSTNAME:-localhost}" \
    && export APP_PORT="${APP_PORT:-443}" \
    && export APP_NAME="${APP_NAME:-devimg}" \
    && envsubst '$APP_PORT $APP_HOSTNAME $APP_NAME $OIDC_AUTH_PROXY' < server.nginx > default.conf \
    && envsubst < /dist/envVariablesForEnvSubst.json > env.json

# Use security hardened nginx image
FROM cgr.dev/chainguard/nginx:latest

# Copy assets and configurations
COPY dist /usr/share/nginx/html/dist
COPY dist/index.html /usr/share/nginx/html/index.html
COPY --from=builder default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder env.json /tmp/k9-punsj/env.json
