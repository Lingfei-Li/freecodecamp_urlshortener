var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');

var app = express();

app.set('port', (process.env.PORT || 1234));


var mongourl = "mongodb://lingfei:yamaxun1121008@ds161175.mlab.com:61175/lingfei_freecodecamp";

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/url', (req, res) => {
    mongo.connect(mongourl, (err, db) => {
        var collection = db.collection('urlshortener');
        collection.find().toArray((err, data) => {
            if(err) throw err;
            res.json(data);
            db.close();
        });
    });
});

app.get('/new/:url*', (req, res) => {
    var original_url = req.url.split('/').slice(2).join('/');
    mongo.connect(mongourl, (err, db) => {
        var collection = db.collection('urlshortener');
        var urlId = Math.floor(Math.random()*10000);
        var obj = {
            original_url,
            short_url: "https://lingfei-urlshortener.herokuapp.com/"+urlId
        };
        collection.insert(obj, (err, data)=>{
            if(err) throw err;
            console.log(collection.count());
            res.send(collection.count());
            db.close();
        });
    });
});

app.get('/:url*', (req, res) => {
    var shortenedUrl = req.url.substr(1);
    res.send(shortenedUrl);
});


app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

