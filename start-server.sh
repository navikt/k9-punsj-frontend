#!/usr/bin/env bash
set -e

_shutdown_() {
  # https://nav-it.slack.com/archives/C5KUST8N6/p1543497847341300
  echo "shutdown initialized, allowing incoming requests for 5 seconds before continuing"
  sleep 5
  nginx -s quit
  wait "$pid"
}

[ -d /tmp/k9-punsj/] && echo "Feature toggle-directory finnes fra før, tilbakestiller" && rm -r /tmp/k9-punsj/* || mkdir -p  /tmp/k9-punsj/
envsubst < /usr/share/nginx/html/dist/envVariablesForEnvSubst.json > /tmp/k9-punsj/env.json
export APP_HOSTNAME="${HOSTNAME:-localhost}"
export APP_PORT="${APP_PORT:-443}"
export APP_NAME="${APP_NAME:-devimg}"

envsubst '$APP_PORT $APP_HOSTNAME $APP_NAME $OIDC_AUTH_PROXY $K9_PUNSJ_API_URL' < /etc/nginx/conf.d/app.conf.template > /etc/nginx/conf.d/default.conf


echo "### Nginx conf ###"
cat /etc/nginx/conf.d/default.conf

nginx -g "daemon off;" &
pid=$!
wait "$pid"
