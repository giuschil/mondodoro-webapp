#!/bin/bash

echo "🔍 ANALISI SETUP HOSTINGER VPS"
echo "================================="
echo ""

echo "📋 Comandi da eseguire sul tuo VPS Hostinger:"
echo ""

echo "1. 🐳 Controlla Docker containers attivi:"
echo "   docker ps"
echo ""

echo "2. 🌐 Controlla porte in uso:"
echo "   netstat -tlnp | grep LISTEN"
echo "   # oppure"
echo "   ss -tlnp | grep LISTEN"
echo ""

echo "3. 📁 Vedi struttura directory:"
echo "   ls -la ~/"
echo "   ls -la /var/www/ (se esiste)"
echo ""

echo "4. 🔧 Controlla Nginx/Apache:"
echo "   systemctl status nginx"
echo "   systemctl status apache2"
echo "   nginx -t (se nginx è attivo)"
echo ""

echo "5. 🏷️ Controlla domini configurati:"
echo "   ls -la /etc/nginx/sites-available/ (se nginx)"
echo "   ls -la /etc/apache2/sites-available/ (se apache)"
echo ""

echo "6. 🐳 Controlla Docker networks:"
echo "   docker network ls"
echo ""

echo "7. 📊 Risorse disponibili:"
echo "   free -h"
echo "   df -h"
echo ""

echo "🎯 RISULTATI:"
echo "Copia e incolla i risultati di questi comandi"
echo "così posso consigliarti la strategia migliore!"

