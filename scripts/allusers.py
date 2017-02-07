import requests as r
import sys

with open(sys.argv[1]) as f:
    text = f.readlines()

if len(sys.argv) >= 3:
    host = sys.argv[2]
else:
    host = 'http://localhost:3000'

url = host + '/admin/user/new'
loginurl = host + '/session/login'
logouturl = host + '/session/logout'

ROLLNUM=0
NAME=2
EMAIL=7
GENDER=9
IMAGE=10

s = r.Session()
print("Logging in")
logininfo = {}
logininfo["username"] = "admin"
logininfo["password"] = "passhash"
resp = s.post(loginurl, json=logininfo)
print(resp.status_code)
print("Cookie: ", end='')
print(s.cookies)

if resp.status_code != 200:
    print("Could not login")
    exit()

for person in text:
    data = list(map(lambda x: x.strip(), person.split(',')))

    payload = {}

    payload['roll'] = data[ROLLNUM]
    payload['name'] = data[NAME][1:-1]
    payload['email'] = data[EMAIL].split('@')[0]
    payload['image'] = data[IMAGE]
    if payload['email'] == "\"Not Available\"":
        continue

    if data[GENDER] == 'M':
        payload['gender'] = "1"
    elif data[GENDER] == 'F':
        payload['gender'] = "0"
    else:
        print("ERROR: finding gender of person {}".format(payload[roll]))
        continue

    print(payload)

    resp = s.post(url, json=payload)
    print("Code: " + str(resp.status_code))
    if resp.status_code > 299:
        print(resp.text)

print("Logging out... ", end='')
print(s.get(logouturl).status_code)
