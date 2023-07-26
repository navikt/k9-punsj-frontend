#!/usr/bin/env bash
set -e



[ -d /tmp/k9-punsj/] && echo "Feature toggle-directory finnes fra før, tilbakestiller" && rm -r /tmp/k9-punsj/* || mkdir -p  /tmp/k9-punsj/
envsubst < /usr/share/nginx/html/dist/envVariablesForEnvSubst.json > /tmp/k9-punsj/env.json
export APP_HOSTNAME="${HOSTNAME:-localhost}"
export APP_PORT="${APP_PORT:-443}"
export APP_NAME="${APP_NAME:-devimg}"
export OIDC_AUTH_PROXY="${OIDC_AUTH_PROXY:-http://localhost:8080}"

envsubst '$APP_PORT $APP_HOSTNAME $APP_NAME $OIDC_AUTH_PROXY' < /etc/nginx/conf.d/app.conf.template > /etc/nginx/conf.d/default.conf


echo "### Nginx conf ###"
cat /etc/nginx/conf.d/default.conf
