#!/bin/sh
set -eu

mkdir -p /tmp/nginx/client_body /tmp/nginx/proxy /tmp/nginx/fastcgi /tmp/nginx/uwsgi /tmp/nginx/scgi

DNS="$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf)"
if [ -z "${DNS}" ]; then
  DNS="127.0.0.11"
fi
printf 'resolver %s valid=10s ipv6=off;\n' "${DNS}" > /tmp/nginx/resolvers.conf

exec nginx -g 'daemon off;'
