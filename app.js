var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');

var app = express();

app.set('port', (process.env.PORT || 1234));

const MONGO_URL = "mongodb://lingfei:yamaxun1121008@ds161175.mlab.com:61175/lingfei_freecodecamp";
const SITE_URL = "https://lingfei-urlshortener.herokuapp.com/";

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/url', (req, res) => {
    mongo.connect(MONGO_URL, (err, db) => {
        var collection = db.collection('urlshortener');
        collection.find().toArray((err, data) => {
            if(err) throw err;
            res.send(JSON.stringify(data));
            db.close();
        });
    });
});


app.get('/new/:url*', (req, res) => {
    var original_url = req.url.split('/').slice(2).join('/');
    if(!original_url.startsWith('http://') && !original_url.startsWith('https://')) {
        res.writeHead(400, {'Content-Type':'text/html'});
        res.end("<h2>Invalid URL. http:// or https:// is needed for the given URL</h2>");
    }
    else {
        mongo.connect(MONGO_URL, (err, db) => {
            var collection = db.collection('urlshortener');
            var urlId = Math.floor(Math.random()*10000);
            var obj = {
                original_url,
                short_url: SITE_URL + urlId
            };
            collection.insert(obj, (err, data)=>{
                if(err) throw err;
                console.log("success: " + JSON.stringify(obj));
                res.send("success: " + JSON.stringify(obj));
                db.close();
            });
        });
    }
});

app.get('/:url', (req, res) => {
    var short_url = SITE_URL + req.url.substr(1);
    mongo.connect(MONGO_URL, (err, db) => {
        var collection = db.collection('urlshortener');
        collection.find({
            short_url
        }).toArray((err, data) => {
            if(err) throw err;
            if(data.length === 0) {
                res.writeHead(404, {'Content-Type':'text/plain'});
                res.end();
            } 
            else if(data.length > 1) {
                res.writeHead(500, {'Content-Type':'text/plain'});
                res.send("More than one records found. Please RIP.");
            }
            else {
                console.log("data:", data);
                res.writeHead(301, {Location: data[0].original_url} );
                res.end();
            }
            db.close();
        });
    });
});


app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

