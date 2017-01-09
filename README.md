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

# Installation / Setup

## Getting the source
We use `glide` instead of `go get` to maintain dependencies. And thus, `go get` is not recommended.

```
mkdir -p $HOME/go/src
export GOPATH=$HOME/go:$GOPATH  # Include this in .bashrc or .zshrc
git clone https://github.com/pclubiitk/puppy-love $HOME/go/src/github.com/pclubiitk/puppy-love

# You can also clone in your favorite location and symlink inside the go directory
```

All remaining steps will be executed in that directory.

## Set up nginx
You need to set up nginx to allow both server and backend to respond to the queries.
```
sudo cp puppy.nginx.conf /etc/nginx/sites_enabled/

# For people using systemd (Ubuntu 16.04 and above, Arch, Gentoo etc)
sudo systemctl start nginx

# For people using upstart (do not use if you have systemd)
sudo service nginx start

# Edit /etc/hosts file
# Map puppy.pclub.in to 127.0.0.1

# Remember to remove the /etc/hosts entry when you want to visit the actual website.
```

## Running services needed
```
# Run Mongodb
mkdir $HOME/.mongodata
mongod --dbpath=$HOME/.mongodata

# Run redis for session management
redis-server
```

## Get frontend dependencies and run
```
# Get dependencies for frontend
cd views
sudo npm install -g yarn
yarn install

# Run frontend
npm run start

```

## Get backend dependencies and run
```
curl https://glide.sh/get | sh
glide install
go build
./puppy-love
```

You can open the local website at [puppy.pclub.in](puppy.pclub.in)
The backend will be listening on the printed port number.

**Note**: Course project for CS252, by [Saksham Sharma](https://github.com/sakshamsharma/) and [Vinayak Tantia](https://github.com/vtantia).

**Note**: Docker support will come soon.
