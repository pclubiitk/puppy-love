Puppy Love
==========

The modern and better avatar of [valentine puppy-love](https://github.com/pclubiitk/valentine) in the making.

Algorithm designed from the ground up, with a completely secure computation model which guarantees the following:

* The identities of your choices are never, *ever*, exposed in plain text. Not even at the server.
* The server, even while matching couples, can *not* know what the choices were.
* The other person will only know whether you liked him/her or not if that person liked you as well.
* The server will know whether you matched with some person or not, but no more.

Posts describing the algorithm:
* [Part 1](https://sakshamsharma.com/2016/10/puppy1/)
* [Part 2](https://sakshamsharma.com/2016/11/puppy2/)

Implementation using:

* Golang (iris)
* TypeScript
* Angular2
* Bootstrap
* Docker

# Requirements
* golang
* NPM
* Nginx
* Redis
* MongoDB

# Set up nginx
You need to set up nginx to allow both server and backend to respond to the queries.
```
sudo cp puppy.nginx.conf /etc/nginx/sites_enabled/

# For people using systemd
sudo systemctl start nginx

# For people using upstart (do not use if you have systemd)
sudo service nginx start

# Edit /etc/hosts file
# Map puppy.pclub.in to 127.0.0.1

# Remember to remove the /etc/hosts entry when you want to visit the actual website.
```

## Running
```
# Run Mongodb
mongod --dbpath=$HOME/.mongodata

# Run redis for session management
redis-server

# Get dependencies
sudo npm install -g yarn

cd views
yarn install

# Run frontend
npm run start

# Now run the backend
cd ..
go run puppy.go
```
You can open the local website at [puppy.pclub.in](puppy.pclub.in)
The backend will be listening on the printed port number.

**Note**: Course project for CS252, by [Saksham Sharma](https://github.com/sakshamsharma/) and [Vinayak Tantia](https://github.com/vtantia).

**Note**: Docker support will come soon.
