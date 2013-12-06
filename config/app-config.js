// The idea here is to keep all configuration in one place.
// I should really be using environment variables, which I could set on each environment,
// which Elastic Beanstalk makes easy.

var AppConfig = {}

AppConfig.videoViewCache = {};
AppConfig.videoViewCache.maxNumViews = 8;
AppConfig.videoViewCache.maxAgeMillis = 300000;   // 5 minutes sounds about right

AppConfig.videoDataHostAddress = 'boonesoculusvideosdata.elasticbeanstalk.com';
AppConfig.videoDataHostPort = 80;

module.exports = AppConfig;