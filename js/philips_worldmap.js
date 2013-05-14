
var app = {
    online: false,
    currentfilter: '',
    mapdata: {},
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        // Check if we're running on PhoneGap
        if (window.cordova) {
            document.addEventListener("load", this.onLoad, false);
			document.addEventListener("deviceready", this.onDeviceReady, false);
			document.addEventListener("offline", this.onOffline, false);
			document.addEventListener("online", this.onOnline, false);
			window.addEventListener("orientationchange", this.onResize, true);
		} else {
		    // Regular browser
		    this.restyleForWeb();
		    this.online = true;
		    $(window).bind('resize', this.onResize);
			this.onDeviceReady(); 
		}
        $('#filter-data input').change(function() {
            app.currentfilter = $(this).val();
            app.getWorldmapData(app.currentfilter, app.currentfilter, function(err, data){
                app.mapdata = data;
                //app.showPage(config.general.homepage_id);      
            });
        });		
    
        $('#settingstoggle').click(function(){
            
        });
    },
    // Load event handler
    onLoad: function(){
         
    },
    // Deviceready event handler
    onDeviceReady: function() {
        // Open local database
        app.openDatabase(function(){
            // Load user settings
            app.store.getUserSettings(function(results){
                // load startpage
                app.currentfilter = $('#filter-data input:checked').val();
                app.getWorldmapData(app.currentfilter, app.currentfilter, function(err, data){
                    app.mapdata = data;
                    app.showPage(config.general.homepage_id);                 
                });
            });
        });
    },
    // Online event handler
    onOnline: function() {
        app.online = true;
    },
    // Offline event handler
    onOffline: function() {
        app.online = false;
    },    
    // Offline event handler
    onResize: function(event) {
        var height, width;
        if(event.orientation){
            if(event.orientation == 'portrait'){
                //do something
                height = $(window).height() - $('#header').height();
                width = $(window).width();        
            }
            else if(event.orientation == 'landscape') {
                //do something
                height = $(window).width() - $('#header').height();
                width = $(window).height();      
            }
        } else{
            height = $(window).height() - $('#header').height();
            width = $(window).width();                 
        }       

        $('#mypanel').css({
            height: height,
            width: width,
            left: 0 -width
        });

        $('div.page').css({
            height: height,
            width: width
        });        
        worldmap.init(width, height);    
    },    
    restyleForWeb: function(){
        $('#header').addClass('ui-bar-b').removeClass('ui-bar-a');
    },
    // Opens the database and checks for new data. If found, clears the local storage cache before proceeding
    openDatabase: function(cb){
        app.store = new LocalStorageStore();
        // Database opened - Check availability of new data
        app.checkNewData(function(err, hasNewData){
            // if new data clear cache table
            if(hasNewData){
                app.store.clearCache(cb);    
            }else{
                cb();
            }
        });        
    },
    // Checks for newer data on the server, returns a boolean
    checkNewData: function(cb){
        if(app.online){
            $.ajax({
                type: "GET",
                url: config.general.newdata_url,
                dataType: 'jsonp',
                data: {
                    
                }
            }).done(function( result ) {
                cb(null, result.newdata === 'true');
            }).fail(function(xhr, err){
                cb(null, false);
            });              
        }else{
            cb(null, false);
        }
    },    

    setUserSettings: function(filters, cb){
        // Sets the filters for the filter page to the last used settings and reurns a hash of the settings
        // Calculate filter hash based on set filters 
        console.log(filters);
        cb(filters);        
    },
   
    // Get data for worldmap (if present in localstorage then serve that, else do ajax call)
    getWorldmapData: function(key, filters, cb){
        // Check localstorage first 
        app.store.findCacheKey(key, function(result){
            
            if(result){
                cb(null, JSON.parse(result));
            }else{
                // if not found in cache
                if(app.online){
                    $.ajax({
                        type: "GET",
                        url: config.general.data_url,
                        dataType: 'jsonp',
                        data: {
                            filters: filters
                        }
                    }).done(function( result ) {
                        app.store.setCacheKey(key, JSON.stringify(result.data), function(){
                            cb(null, result.data);
                        });
                        
                    }).fail(function(xhr, err){
                        cb(err);
                    });                                
                }else{
                    cb(null, []);
                }
   
            }
        });
    },
    
    showPage: function(pageId){
        
        $('div.page').hide();
        var strId = '#'+pageId;

        var height = $(window).height() - $('#header').height();
        var width = $(window).width();
        $(strId).css({
            height: height,
            width: width
        });
        $(strId).fadeIn(500, function(){
            if(pageId==='map'){
                worldmap.mapVariation = app.currentfilter;
                worldmap.mapData = app.mapdata;
                worldmap.init(width, height);    
            }
        });
        $('#mypanel').css({
            height: height,
            width: width,
            left: 0 -width
        });
    },

    toggleSettings: function(){
        var left = parseInt($('#mypanel').css('left')) < 0 ? 0 : - $(window).width();
        if (left === 0){
            $('#settingstoggle').find('.ui-icon').addClass('ui-icon-arrow-l').removeClass('ui-icon-arrow-r')
        }else{
            $('#settingstoggle').find('.ui-icon').addClass('ui-icon-arrow-r').removeClass('ui-icon-arrow-l')
        }
        $('#mypanel').animate({
            left: left
        });      
        $('#map').show(); 
        worldmap.mapVariation = app.currentfilter;
        worldmap.mapData = app.mapdata;
        worldmap.init();            
    } 
};
