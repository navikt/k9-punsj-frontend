FROM nginxinc/nginx-unprivileged:1.23.1-alpine

COPY dist /usr/share/nginx/html/dist
COPY dist/index.html /usr/share/nginx/html/index.html
COPY start-server.sh /start-server.sh
COPY server.nginx /etc/nginx/conf.d/app.conf.template
EXPOSE 8080


CMD sh /start-server.sh          
