// This handles rendering and caching views of the video data.

var fs = require('fs');
var jade = require('jade');
var LRU = require('lru-cache');
var videoDataClient = require('./video-data-client');
var AppConfig = require("./config/app-config");

module.exports = function(viewDir) {
    // Create the LRU cache
    var videoViewCacheOptions = { 
            max: AppConfig.videoViewCache.maxNumViews, 
            length: function (n) { return 1 },
            maxAge: AppConfig.videoViewCache.maxAgeMillis };
            
    var videoViewCache = LRU(videoViewCacheOptions);
    
    var compiledTemplates = {};
    
    // Compile the views
    fs.readdir(viewDir, function(err, files){
        // Filter the jade files
        files.filter(function(fileName){
            return fileName.indexOf('.jade') != -1;
        }); 
        
        // Compile each file
        files.forEach(function(fileName){
            var viewName = fileName.substr(0, fileName.indexOf('.jade'));
            var filePath = viewDir + '/' + fileName;
            fs.readFile(filePath, 'utf8', function (err, data) {
                console.log("Compiling view: " + viewName + ", " + filePath);
                compiledTemplates[viewName] = jade.compile(data, { filename: filePath });
            });
        });
    });
    
    // This will be called to render video views. It will cache the rendered
    // views, because they don't change often.
    return function(view, sort, time, callback) {
        var viewKey = view + '_' + sort + '_' + time;
        
        // Try the cache firt
        var cachedRenderedView = videoViewCache.get(viewKey);
        
        // If it was in the cache, that's great. Return the result.
        if (typeof cachedRenderedView !== 'undefined' && cachedRenderedView) {
            // Return the rendered view
            callback(cachedRenderedView);
        }
        else {
            // If it wasn't in the cache, then it needs to be rendered
            videoDataClient.getVideoInfoJson(sort, time, function(data){
                // Render the view
                var renderedView = compiledTemplates[view]({videoInfo: data, sortType: sort+'_'+time });
                
                // Return the rendered view
                callback(renderedView);
                
                // Add the rendered view to the cache
                videoViewCache.set(viewKey, renderedView);
            });
        };
    };
};