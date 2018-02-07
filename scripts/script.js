const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const generatePassword = require('password-generator');

const students = require('./students.json');

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log('Database created!');
  const dbo = db.db('puppy');
  const results = students.map((s) => {
    return {
      _id: s.i,
      name: s.n,
      email: s.u,
      image: '',
      gender: s.g === 'M' ? '1' : '0',
      passHash: 'aaaa',
      privKey: '',
      pubKey: '',
      authCode: generatePassword(15),
      data: '',
      submitted: false,
      matches: '',
      voted: 0,
      dirty: true,
      savepass: ''
    };
  });
  dbo.collection('user').insertMany(results , function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });
});
