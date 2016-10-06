Puppy Love
==========

The modern and better avatar of [valentine puppy-love](https://github.com/pclubiitk/valentine) in the making.

Algorithm designed from the ground up, with a completely secure computation model which guarantees the following:

* Even the server admin cannot figure out your choices.
* The identities of your choices are never, *ever*, exposed in plain text. Not even at the server.
* The server, even while matching couples, can *not* know what the choices were.
* Even if the server is compromised or not trusted, there can be no leak of information.
* The other person will only know whether you liked him/her or not if that person liked you as well.

Implementation will be using the following platforms:

* Node.js
* Express.js
* JavaScript
* Sass
* Bootstrap

## Running
For frontend:
```
gem install sass
sudo npm install -g bower
# Now add /home/saksham/.gem/ruby/<version>/bin to your path

cd frontend
bower install
sass --watch css

# Use either of these
python3 -m http.server
python2 -m SimpleHTTPServer
```
You can open the local website on [localhost:8000](localhost:8000)

**Note**: Course project for CS252, by [Saksham Sharma](https://github.com/sakshamsharma/) and [Vinayak Tantia](https://github.com/vtantia).
