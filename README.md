Puppy Love
==========

The modern and better avatar of Programming Club's [puppy-love](https://github.com/pclubiitk/valentine) in the making.

![alt tag](https://raw.githubusercontent.com/pclubiitk/puppy-love/master/cover.jpg)

Algorithm designed from the ground up, with a completely secure computation model which guarantees the following:

* The identities of your choices are never, *ever*, exposed in plain text. Not even at the server.
* The server, even while matching couples, can *not* know what the choices were.
* The other person will only know whether you liked him/her or not if that person liked you as well.
* The server will know whether you matched with some person or not, but no more.
* The above guarantees are independent of the code running on the server, and can be verified on the browser.

Blog posts describing the algorithm:
* [Part 1 - Introduction](https://sakshamsharma.com/2016/10/puppy1/)
* [Part 2 - Matching choices](https://sakshamsharma.com/2016/11/puppy2/)
* [Part 3 - Restricting number of choices to 4 anonymously](https://sakshamsharma.com/2016/12/puppy3/)

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
* Docker

# Installation / Setup

## First time setup
You shall need docker, golang, nodejs, nginx and npm for the following steps.

**Note**: Arch users often have gccgo installed. Please use the package `go` from the main repositories instead.

```
mkdir -p $HOME/go/src

# Change .bashrc to .zshrc depending on your shell
echo "export GOPATH=$HOME/go:$GOPATH" >> $HOME/.bashrc
source $HOME/.bashrc
```

Get the source code.

You can later symlink the following folder into a convenient location.
Just make sure that the actual folder (not symlink) is in the go directory.
```
git clone https://github.com/pclubiitk/puppy-love $HOME/go/src/github.com/pclubiitk/puppy-love
```

Install glide
We use `glide` to maintain dependencies. `go get` is not recommended.
```
curl https://glide.sh/get | sh
cd $HOME/go/src/github.com/pclubiitk/puppy-love
```

Set up nginx
```
sudo cp puppy.nginx.conf /etc/nginx/sites_enabled/
```

Edit /etc/hosts file
```
# Map dev.puppy.pclub.in to 127.0.0.1
# It should have a line saying:
# 127.0.0.1 <something> <more> dev.puppy.pclub.in
```

Get the essential dockers
```
sudo systemctl start docker
docker run --name puppy-redis -p 6379:6379 -d redis
docker run --name puppy-mongo-db -p 27017:27017 -d mongo 

# Optional (in place of the above command):
# docker run --name puppy-mongo-db -p 27017:27017 -v $HOME/.mongodata:/data/db -d mongo 
```

Get dependencies for backend
```
glide install
```

Get dependencies for frontend
```
cd views
sudo npm install -g yarn
yarn install
```

## Run services
```
sudo systemctl start nginx

# These are not required if you just finished the above steps
docker start puppy-mongo-db
docker start puppy-redis
```

## Run puppy-love
### Frontend
```
# Run frontend (inside folder views)
yarn start

# IFF production, use
yarn build && python -m http.serve 8091
```

### Backend
```
# Build (inside puppy-love folder)
go build

# Optional: These are needed for email verification to work
export EMAIL_USER=<your_iitk_username>
export EMAIL_PASS=<your_iitk_email_password>
./puppy-love
```

# Setting up basic services
### Log in
You should first log in as admin. A simple way to do that is the following:
```
cd scripts
. ./login.sh admin passhash
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
Once you've created the users, you will need to register them. Open the UI at dev.puppy.pclub.in, and go to signup. You can only register for users which you have created. Get your auth token via email, and then fill up the remaining fields.

### Notes
* You cannot login as admin on the frontend UI.
* You can also check mongoDB's data for the auth token for the user.

You can open the local website at [dev.puppy.pclub.in](dev.puppy.pclub.in)
The backend will be listening on the printed port number.

**Note**: Course project for CS252, by [Saksham Sharma](https://github.com/sakshamsharma/) and [Vinayak Tantia](https://github.com/vtantia).

**Note**: Docker support will come soon.
