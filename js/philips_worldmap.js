
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
    },
    // Deviceready event handler
    onDeviceReady: function() {
        // Open database
        app.openDatabase(function(){
            // Load initial page - Intro screen shown until first page loaded
            app.loadPage(config.general.homepage_id);           
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
    // Opens the database and checks for new data. If found, clears the local storage cache before proceeding
    openDatabase: function(cb){
        app.store = new WebSqlStore();
        // Database opened - Check availability of new data
        app.checkNewData(function(err, hasNewData){
            // if new data clear cache table
            if(hasNewData){
                app.store.clearCache(cb());    
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
                data: {}
            }).done(function( result ) {
                cb(null, result);
            }).fail(function(xhr, err){
                cb(err);
            });              
        }else{
            cb(false);
        }
      
    },    
    
    loadPage: function(pageId){
        app.getPageData(pageId, function(err, data){
            if(err){
                app.renderView(config.general.errorpage_id, err);
            }else{
                app.renderView(pageId, data);    
            }
        });
    },
    
    getPageData: function(pageId, cb){
        // Check localstorage first 
        //app.store.findCacheKey();
        // if not found in cache
        $.ajax({
            type: "POST",
            url: config.general.data_url,
            data: {
                pageId: pageId,
                dataType: 'json'
            }
        }).done(function( result ) {
            cb(null, result);
        }).fail(function(xhr, err){
            cb(err);
        });
    },
    
    renderView: function(pageId, data){
        // Use EJS to render view with provided data, update correct div and hide all other page divs
        $('div.page').addClass('hidden');
        var strId = '#'+pageId;
        $(strId).html(new EJS({url: 'ejs/'+pageId+'.ejs'}).render({data:data}));
        $(strId).removeClass('hidden');
    }    
};
