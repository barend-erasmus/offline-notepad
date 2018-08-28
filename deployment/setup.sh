
apt-get install -y letsencrypt
letsencrypt certonly --standalone --agree-tos --email developersworkspace@gmail.com -d offline-notepad.com

apt-get install -y nginx
ufw allow 'Nginx Full'
systemctl enable nginx
systemctl start nginx

# cp nginx.conf /etc/nginx/sites-enabled/offline-notepad.com

