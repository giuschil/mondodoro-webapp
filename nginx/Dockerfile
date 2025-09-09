FROM nginx:alpine

# Copia la configurazione personalizzata
COPY nginx.conf /etc/nginx/nginx.conf
COPY mondodoro.conf /etc/nginx/conf.d/default.conf

# Crea directory per static e media files
RUN mkdir -p /app/staticfiles /app/media

# Esponi porta 80
EXPOSE 80

# Comando di default
CMD ["nginx", "-g", "daemon off;"]
