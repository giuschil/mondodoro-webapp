#!/bin/bash

echo "🔍 ANALISI VPS HOSTINGER - srv823643.hstgr.cloud"
echo "================================================="
echo ""
echo "📋 Esegui questi comandi sul tuo VPS:"
echo ""
echo "# Connettiti al VPS:"
echo "ssh root@168.231.85.166"
echo ""
echo "# Poi esegui questi comandi uno per uno:"
echo ""

echo "1. 🐳 Controlla Docker e containers attivi:"
echo "   docker --version"
echo "   docker ps -a"
echo "   docker-compose --version"
echo ""

echo "2. 🌐 Controlla porte in uso:"
echo "   netstat -tlnp | grep LISTEN"
echo ""

echo "3. 📁 Vedi struttura directory:"
echo "   ls -la /var/www/"
echo "   ls -la ~/"
echo ""

echo "4. 🔧 Controlla web server:"
echo "   systemctl status nginx"
echo "   systemctl status apache2"
echo ""

echo "5. 🏷️ Controlla domini/virtual hosts:"
echo "   ls -la /etc/nginx/sites-available/ 2>/dev/null || echo 'Nginx non trovato'"
echo "   ls -la /etc/apache2/sites-available/ 2>/dev/null || echo 'Apache non trovato'"
echo ""

echo "6. 🔥 Controlla firewall:"
echo "   ufw status"
echo ""

echo "7. 📊 Risorse sistema:"
echo "   free -h"
echo "   df -h"
echo ""

echo "🎯 Copia e incolla tutti i risultati qui!"
echo "Così posso consigliarti la strategia migliore per Mondodoro."

