//
// This simple Express app serves up videos related to the Oculus Rift.
//

var express = require('express');
var videoDataClient = require('./video-data-client');

var app = express();

// I love logs
app.use(express.logger('dev'));

// Use Jade to render views
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Serve up static content
app.use(express.static(__dirname + '/public'));

// Render the index page. This is just a body and scripts.
// The video player will call back to get videos.
app.get('/', function (req, res) {
    res.render('index', {});
})

// Return the video player, with initial video list.
app.get('/player', function (req, res) {
    videoDataClient.getVideoInfoJson('hot', 'week', function(data) {
        res.render('video-player', { videoInfo : data, sortType : 'hotthisweek' });
    });
})

// Return this week's hot videos
app.get('/videos/hotthisweek', function (req, res) {
    videoDataClient.getVideoInfoJson('hot', 'week', function(data) {
        res.render('video-list', { videoInfo : data, sortType : 'hotthisweek' });
    });
})

// Return today's hot videos
app.get('/videos/hottoday', function (req, res) {
    videoDataClient.getVideoInfoJson('hot', 'day', function(data) {
        res.render('video-list', { videoInfo : data, sortType : 'hottoday' });
    });
})

app.listen(process.env.PORT, process.env.IP);