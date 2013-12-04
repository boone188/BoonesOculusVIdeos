/**
 * 
 * Dynamically loaded video player and gallery. When attached to an element, 
 * it will pull in everything it needs. Right now, it only supports Youtube 
 * videos. When switching between videos, it will keep previously viewed
 * videos in a cache. It will also cache the different video lists.
 * 
 */

var OculusVideoPlayer = {

    isYoutubeApiLoaded: false,
    isPlayerBodyLoaded: false,
    currentSortType: '',
    currentPlayerType: '',
    currentVideoId: '',
    
    // Default values
    videoWidth: 900,
    videoHeight: 550,
    
    // Cache youtube players
    youtubePlayerCache: {},
    
    //
    // Given a sort type, this will switch the view to that sort type.
    // If the sort type isn't already cached, it will load it with a
    // GET call.
    //
    sortVideoList: function(sortType) {
        // If the list is already using that sort, do nothing
        if (sortType == OculusVideoPlayer.currentSortType) {
            return;
        }
        
        // Set the current sort type
        OculusVideoPlayer.currentSortType = sortType;
        
        // Try to find a gallery with the desired sort type
        var desiredSortGallery;
        $('.video-gallery').each(function(index, videoGallery) {
            var sortT = $(videoGallery).data('sort-type');
            if (sortT == sortType) {
                desiredSortGallery = $(videoGallery);
            }
        });
        
        // If there is already a gallery for this sort type, just show it
        if (typeof(desiredSortGallery) != 'undefined') {
            // Hide galleries
            $('.video-gallery').hide();
            
            // Show the desired gallery
            desiredSortGallery.show();

            // done
            return;
        }
        
        // Will have to retrieve the gallery for this sort type
        $.get('/videos/' + sortType, function(galleryHtml) {
            // After the gallery is loaded
            // hide galleries
            $('.video-gallery').hide();
            
            // Add the new gallery
            var newGallery = $(galleryHtml);
            newGallery.appendTo('#video-galleries');
            OculusVideoPlayer.onVideoGalleryLoaded(newGallery);
        });
    },
    
    //
    // Given a player type and video ID, this will load a video and optionally
    // begin playing it. It stores the videos in a cache, so they can be
    // quickly retrieved again.
    //
    loadVideo: function(playerType, videoId, playOnLoad) {
        OculusVideoPlayer.currentPlayerType = playerType;
        OculusVideoPlayer.currentVideoId = videoId;

        // Only Youtube is supported ATM
        if (playerType == 'YOUTUBE' && OculusVideoPlayer.isYoutubeApiLoaded) {
            // Hide the current video frames
            $('#active-video-frame').children().hide();

            // Stop players
            for (cachedVideoId in OculusVideoPlayer.youtubePlayerCache) {
                OculusVideoPlayer.youtubePlayerCache[cachedVideoId].pauseVideo();
            }
            
            // If there isn't a cached player for this video, create one
            var cachedPlayer = OculusVideoPlayer.youtubePlayerCache[videoId];
            if (typeof(cachedPlayer) === 'undefined') {
                // Create a new frame for the video
                var playerFrameId = 'yt-frame-' + videoId;
                $('#active-video-frame').append('<div id="'+playerFrameId+'"></div>');
                
                // Create a new youtube player object for the video
                var player = new YT.Player(playerFrameId, {
                    height: OculusVideoPlayer.videoHeight,
                    width:  OculusVideoPlayer.videoWidth,
                    videoId: videoId,
                    events: {
                        // Start playing when ready, if requested
                        onReady: playOnLoad ? function(){player.playVideo();} : function(){}
                    }
                });
                
                // Add the player to the cache
                OculusVideoPlayer.youtubePlayerCache[videoId] = player;
            }
            else if (playOnLoad) {
                cachedPlayer.playVideo();
            }
            
            // Show the video frame
            $('#yt-frame-' + videoId).show();
        }
    },
    
    //
    // Handles loaded a video from a gallery item.
    //
    loadVideoFromGallery: function(galleryItem) {
        var playerType = galleryItem.data('player-type');
        var videoId = galleryItem.data('video-id');
        
        // Load the video
        OculusVideoPlayer.loadVideo(playerType, videoId, true);
        
        // Copy the title into the active video area
        var videoTitle = galleryItem.find('.video-gallery-title').text();
        $('#active-video-title').text(videoTitle);
        
        // Copy the stats into the active video area
        $('#active-video-stat-list').empty();
        galleryItem.find('.video-stat-list').children().clone(true).appendTo('#active-video-stat-list');
        
        // Scroll on up to see the video
        $('html, body').animate({
                scrollTop: $("#active-video-frame").offset().top
            }, 
            1000
        );
    },
    
    //
    // Loads the initial video.
    //
    loadInitialVideo: function() {
        var playerType = $('#active-video').data('player-type');
        var videoId = $('#active-video').data('video-id');
        OculusVideoPlayer.loadVideo(playerType, videoId);
    },
    
    //
    // This gets called by the Youtube API when it is done loading.
    //
    onYouTubeApiLoaded: function() {
        OculusVideoPlayer.isYoutubeApiLoaded = true;
        
        // If the player body is loaded, and the inital video type is Youtube, then play it
        if (OculusVideoPlayer.isPlayerBodyLoaded && OculusVideoPlayer.currentPlayerType == 'YOUTUBE') {
            OculusVideoPlayer.loadInitialVideo();
        }
    },
    
    //
    // This should be called after a video gallery is loaded. It sets up
    // click events.
    //
    onVideoGalleryLoaded: function(videoGallery) {
        // Add on click for each gallery item to play video
        videoGallery.find('.video-gallery-item').each(function(galleryIndex, galleryItem) {
            $(galleryItem).children('.video-trigger').each(function(triggerIndex, trigger) {
                $(trigger).click(function() {
                    OculusVideoPlayer.loadVideoFromGallery($(galleryItem));
                });
            });
        });
        
        // Set up all the links
        videoGallery.find('.link').each(function(linkIndex, link) {
            var linkHref = $(link).data('link-href');
            $(link).click(function() {
                window.open(linkHref); 
            });
        });
    },
    
    //
    // This gets called after the body of the player is loaded. If the Youtube
    // player is ready at that time, then it will load the initial video.
    //
    onPlayerBodyLoaded: function() {
        OculusVideoPlayer.isPlayerBodyLoaded = true;

        // Get the initial player type
        OculusVideoPlayer.currentPlayerType = $('#active-video').data('player-type');
        
        $('#active-video-frame').load(function(){
            OculusVideoPlayer.onPlayerBodyLoaded(); 
        });
        
        // Get the video dimensions
        var width = $('#active-video-frame').width();
        var height = $('#active-video-frame').height();
        
        if (width > 0) {
            OculusVideoPlayer.width = width;
        }
        if (height > 0) {
            OculusVideoPlayer.height = height;
        }
        
        // If the initial player type is Youtube, and the Youtube API is loaded, then play it
        if (OculusVideoPlayer.currentPlayerType == 'YOUTUBE' && OculusVideoPlayer.isYoutubeApiLoaded) {
            OculusVideoPlayer.loadInitialVideo();
        }
        
        // The gallery was also loaded
        OculusVideoPlayer.onVideoGalleryLoaded($('.video-gallery'));
        
        // Set up sort buttons
        $('.sort-list-item').each(function(index, sortListItem) {
            var sortType = $(sortListItem).data('sort-type');
            
            if ($(sortListItem).hasClass('selected')) {
                OculusVideoPlayer.currentSortType = sortType;
            }
            
            // On click sort the list
            $(sortListItem).click(function(){
                // Make selected
                $('.sort-list-item.selected').removeClass('selected');
                $(this).addClass('selected');
                
                // Sort the video list
                OculusVideoPlayer.sortVideoList(sortType); 
            });
        });
        
        // Make the stat links work
        $('#active-video-stat-list > .link').each(function(linkIndex, link) {
            var linkHref = $(link).data('link-href');
            $(link).click(function() {
                window.open(linkHref); 
            });
        });
    },
    
    //
    // Attaches the video player to a container. This causes it to be
    // loaded dynamically.
    //
    attachToContainer: function(container) {
        // Load the sytles
        $('head').append( $('<link href="/stylesheets/video-player.css" rel="stylesheet" type="text/css" />') );
        
        // Load the videos
        container.load("/player", function() {
            OculusVideoPlayer.onPlayerBodyLoaded();
        });
        
        // Load the Youtube API
        if (typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined') {
            // If the Youtube API isn't loaded, get it now
            window.onYouTubeIframeAPIReady = function() {
                OculusVideoPlayer.onYouTubeApiLoaded();
            };

            $.getScript('//www.youtube.com/iframe_api');
        } 
        else {
            // The Youtube API is already loaded
            OculusVideoPlayer.onYouTubeApiLoaded();
        }
    }
};

$( document ).ready(function() {
    OculusVideoPlayer.attachToContainer($('body'));
});