FROM nginxinc/nginx-unprivileged:1.23.2-alpine

COPY dist /usr/share/nginx/html/dist
COPY dist/index.html /usr/share/nginx/html/index.html
COPY server.nginx /etc/nginx/conf.d/app.conf.template
COPY start-server.sh /start-server.sh

CMD sh /start-server.sh

