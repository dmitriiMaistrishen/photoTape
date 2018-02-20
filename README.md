# photoTape
tape-shape CRUD app using Angular &amp; Node.js

# requirements

1.reverse-proxy web server, im using nginx;
2.node.js (v9.0.0);
3.mogodb(v3.2.18);

#nginx configuration

nginx.config should contain something like: ;

location /src/ {
			proxy_pass http://localhost:8080/;
		}

		location / {
			root /path/to/files/server/static/;
		}
