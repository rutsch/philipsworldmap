
var app = {
    online: true,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
   /* isPhoneGap: function () {
        return (cordova || PhoneGap || phonegap) 
        && /^file:\/{3}[^\/]/i.test(window.location.href) 
        && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
    },*/
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        // Check if we're mobile or not
        if (window.PhoneGap) {
			document.addEventListener("deviceready", this.onDeviceReady, false);
			document.addEventListener("offline", this.onOffline, false);
			document.addEventListener("online", this.onOnline, false);
			$(window).bind('orientationchange', this.onResize);
		} else {
		    $(window).bind('resize', this.onResize);
			this.onDeviceReady(); //this is the browser
		}
    },
    // Deviceready event handler
    onDeviceReady: function() {
        // Open database
        app.openDatabase(function(){
            // Load user settings
            app.store.getUserSettings(function(results){
                var filters = 'lives_improved';//{};
                //if(results.rows.length > 0){
                //    filters = JSON.parse(results.rows.item(0).value)
                //}
                // Set filters based on user settings
                app.setUserSettings(filters, function(hash){
                    // Get app data based on filters or hash
                    app.getData(hash, filters, function(err, data){
                        // Load initial page - Intro screen shown until first page loaded
                        worldmap.mapVariation = filters;
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
    
    loadPage: function(pageId){
        app.showPage(pageId);   
    },
    
    getData: function(key, filters, cb){
        // Check localstorage first 
        app.store.findCacheKey(key, function(result){
            
            if(result){
                cb(null, JSON.parse(result));
            }else{
                 // if not found in cache
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
