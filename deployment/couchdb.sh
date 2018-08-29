https://hub.docker.com/_/couchdb

http://couchdb.offline-notepad.com:5984/_utils

ufw allow 80

apt-get install -y letsencrypt
letsencrypt certonly --standalone --agree-tos --email developersworkspace@gmail.com -d couchdb.offline-notepad.com

apt-get install -y nginx
ufw allow 'Nginx Full'
systemctl enable nginx
systemctl start nginx

# cp nginx.conf /etc/nginx/sites-enabled/couchdb.offline-notepad.com