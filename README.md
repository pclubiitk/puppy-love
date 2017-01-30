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
* [Part 3](https://sakshamsharma.com/2016/12/puppy3/)

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

# You can later symlink the above folder into your project directory.
# Just make sure that the actual folder (not symlink) is in the go directory.
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
# It should have a line saying:
# 127.0.0.1 <something> <more> puppy.pclub.in

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

# These are needed for email verification to work
export EMAIL_USER=<your_iitk_username>
export EMAIL_PASS=<your_iitk_email_password>
./puppy-love
```

## Setting up basic services
### Log in
You should first log in as admin. A simple way to do that is the following:
```
cd scripts
. login.sh admin passhash
# Use curl / http normally, but use $CADMIN cookie at the end of your command
# Example: http get 'localhost:3000/admin/...' $CADMIN
```

### Add a user
Note: This requires you to be logged in as $CADMIN
```
cd scripts
./newuser.sh
# Follow the commands
# For testing, use your own IITK email address for all users
```

### Set up compute table
Do this AFTER setting up all users. Whenever you add a new user, this has to be run.
```
http get 'localhost:3000/compute/prepare' $CADMIN
```

### Using the frontend
Once you've created the users, you will need to register them.

**Warning**: This has not yet been tested ever since mailer was added. Please mark any bugs as issues.

Open the UI at puppy.pclub.in, and go to register. You can only register for users which you have created. Get your auth token via email, and then fill up the remaining fields.

### Notes
* You cannot login as admin on the frontend UI.
* You can also check mongoDB's data for the auth token for the user.

You can open the local website at [puppy.pclub.in](puppy.pclub.in)
The backend will be listening on the printed port number.

**Note**: Course project for CS252, by [Saksham Sharma](https://github.com/sakshamsharma/) and [Vinayak Tantia](https://github.com/vtantia).

**Note**: Docker support will come soon.
