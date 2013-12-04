// Here is the client for the video data server. It handles retrieving data from
// that server, and caching the results. The results can easily be cached for 5
// minutes or so, because it doesn't change often.

var http = require("http");
var LRU = require("lru-cache");
var AppConfig = require("./config/app-config");

// Create the LRU cache
var videoInfoCacheOptions = { 
        max: AppConfig.videoInfoCache.maxSizeBytes, 
        length: function (n) { return 1 },
        maxAge: AppConfig.videoInfoCache.maxAgeMillis };
        
var videoInfoCache = LRU(videoInfoCacheOptions);

// Takes sort type parameters and returns the video info object.
exports.getVideoInfoJson = function(sort, time, callback)
{
    var sortType = 'sort=' + sort + '&time=' + time;
    
    // Try the cache firt
    var videoInfo = videoInfoCache.get(sortType);
    
    // If it was in the cache, that's great. Return the result.
    if (typeof videoInfo !== 'undefined' && videoInfo) {
        // Return the video info
        callback(videoInfo)
    }
    else {
        // If it wasn't in the cache, we need to get retrieve it from the data host
        var options = {
            hostname: AppConfig.videoDataHostAddress,
            port: AppConfig.videoDataHostPort,
            path: '/videos?' + sortType,
            method: 'GET' 
        };
        
        // Make the request
        var req = http.request(options, function(res) {
            // output buffer
            var output = '';
            res.setEncoding('utf8');
    
            res.on('data', function (chunk) {
                output += chunk;
            });
    
            res.on('end', function() {
                // Return the video info
                videoInfo = JSON.parse(output);
                callback(videoInfo);
                
                // Cache the video info
                videoInfoCache.set(sortType, videoInfo);
            });
        });
    
        req.on('error', function(e) {
            console.log(e.message);
        });
    
        req.end();
    }
};