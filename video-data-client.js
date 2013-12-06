// Here is the client for the video data server. It handles retrieving video 
// info data from that server.

var http = require("http");
var AppConfig = require("./config/app-config");

// Takes sort type parameters and returns the video info object.
exports.getVideoInfoJson = function(sort, time, callback)
{
    // Request parameters
    var options = {
        hostname: AppConfig.videoDataHostAddress,
        port: AppConfig.videoDataHostPort,
        path: '/videos?sort=' + sort + '&time=' + time,
        method: 'GET' 
    };
    
    // Make the request
    var req = http.request(options, function(res) {
        // output buffer
        var output = '';
        res.setEncoding('utf8');

        // Add chunks to the buffer
        res.on('data', function (chunk) {
            output += chunk;
        });

        // The data is complete
        res.on('end', function() {
            // Parse the data and return it
            var videoInfo = JSON.parse(output);
            callback(videoInfo);
        });
    });

    req.on('error', function(e) {
        console.log(e.message);
    });

    req.end();
};