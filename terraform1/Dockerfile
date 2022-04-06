FROM nginx:stable-alpine
EXPOSE 80
RUN echo "<h1>Hello tampadevs</h1>" > /usr/share/nginx/html/index.html
# -g 'daemon off;' sets nginx to run in the foreground
# for better docker logs visibility
CMD ["nginx", "-g", "daemon off;"]