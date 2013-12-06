//
// This simple Express app serves up videos related to the Oculus Rift.
//

var express = require('express');
var videoViews = require('./video-views');
var jade = require('jade');

var app = express();

// This will cache the rendered video views
var renderedVideoViews = videoViews('./views/video');

app.configure('development', function(){
    console.log('Running in devo');
});

app.configure('production', function(){
    console.log('Running in prod');
});

// Serve up static content
app.use(express.static(__dirname + '/public'));

// Pre-render the index page. This is just a body and scripts.
var indexHtml = jade.renderFile('./views/index.jade');

// Return the body html. The video player will call back to get videos.
app.get('/', function (req, res) {
    res.send(200, indexHtml);
})

// Return the video player, with initial video list.
app.get('/player', function (req, res) {
    renderedVideoViews('video-player', 'hot', 'week', function(html) {
        res.send(200, html);
    });
})

// Return this week's hot videos
app.get('/videos/hotthisweek', function (req, res) {
    renderedVideoViews('video-list', 'hot', 'week', function(html) {
        res.send(200, html);
    });
})

// Return today's hot videos
app.get('/videos/hottoday', function (req, res) {
    renderedVideoViews('video-list', 'hot', 'day', function(html) {
        res.send(200, html);
    });
})

app.listen(process.env.PORT, process.env.IP);