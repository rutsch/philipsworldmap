
var app = {
    online: true,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        // Check if we're mobile or not
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
			document.addEventListener("deviceready", this.onDeviceReady, false);
			document.addEventListener("offline", this.onOffline, false);
			document.addEventListener("online", this.onOnline, false);
		} else {
			this.onDeviceReady(); //this is the browser
		}
		$(window).bind('orientationchange', this.onResize);
		$(window).bind('resize', this.onResize);
    },
    // Deviceready event handler
    onDeviceReady: function() {
        // Open database
        app.openDatabase(function(){
            // Load user settings
            app.store.getUserSettings(function(results){
                var filters = {};
                if(results.rows.length > 0){
                    filters = JSON.parse(results.rows.item(0).value)
                }
                // Set filters based on user settings
                app.setUserSettings(filters, function(hash){
                    // Get app data based on filters or hash
                    app.getData(hash, filters, function(err, data){
                        // Load initial page - Intro screen shown until first page loaded

                        worldmap.mapData = data;
                        worldmap.init();
                        app.loadPage(config.general.homepage_id);                         
                    });
                });
            });
            
            
            
            
            // Get data for worldmap (if present in localstorage then serve that, else do ajax call)
            
         
        })

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
    onResize: function() {
        worldmap.init();    
    },    
    // Opens the database and checks for new data. If found, clears the local storage cache before proceeding
    openDatabase: function(cb){
        app.store = new WebSqlStore();
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
    
    checkNewData: function(cb){
        if(app.online){
            $.ajax({
                type: "GET",
                url: config.general.newdata_url,
                data: {
                    dataType: 'json'
                }
            }).done(function( result ) {
                cb(null, JSON.parse(result).newdata === 'true');
            }).fail(function(xhr, err){
                cb(err);
            });              
        }else{
            cb(false);
        }
    },    
    
    setUserSettings: function(settings, cb){
        // Sets the filters for the filter page to the last used settings and reurns a hash of the settings
        // Calculate filter hash based on set filters 
        console.log(settings);
        cb("");        
    },
    
    loadPage: function(pageId){
        app.showPage(pageId);   
    },
    
    getData: function(key, filters, cb){
        // Check localstorage first 
        app.store.findCacheKey(key, function(result){
            if(result.rows.length > 0){
                cb(null, JSON.parse(result.rows.item(0).value));
            }else{
                 // if not found in cache
                $.ajax({
                    type: "GET",
                    url: config.general.data_url,
                    data: {
                        filters: filters,
                        dataType: 'json'
                    }
                }).done(function( result ) {
                    app.store.setCacheKey(key, JSON.stringify(JSON.parse(result).data), function(){
                        cb(null, JSON.parse(result).data);
                    });
                    
                }).fail(function(xhr, err){
                    cb(err);
                });               
            }
        });
    },
    
    showPage: function(pageId){
        $('div.page').hide();
        var strId = '#'+pageId;

        var height = $(window).height() - $('#header').height() - $('#footer').height();
        var width = $(window).width();
        $(strId).css({
            height: height,
            width: width
        });
        $(strId).fadeIn(500);
    }    
};
