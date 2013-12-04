// The idea here is to keep all configuration in one place.
// This could be swapped out for desktop/staging/production.

var AppConfig = {}

AppConfig.videoInfoCache = {};
AppConfig.videoInfoCache.maxNumberOfSorts = 2; // Right now there's only 2 sort types
AppConfig.videoInfoCache.maxAgeMillis = 300000;   // 5 minutes sounds about right

AppConfig.videoDataHostAddress = 'boonesoculusvideosdata.elasticbeanstalk.com';
AppConfig.videoDataHostPort = 80;

module.exports = AppConfig;