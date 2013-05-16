/* Please keep this list for requesting new features for now:
 * 
 * TODO:    Add more global variables (height and width for example)
 *          Create navigation logic for selecting data for worldmap (Johan)
 *          Create function to set height and with on elements (now done in multiple places)
 *          Add more device functionality (getGeoLocation for example and maybe think of more 'fun' stuff to use)
 *              - In future maybe have customers show pictures of how their lives are improved by philips ?
 *          
 */
var app = {
    /*
     * Some global variables
     */
    online: false,
    currentfilter: '',
    mapdata: {},
    // Application Constructor
    initialize: function() {
        var self = this;
        self.bindEvents();
    },
    // Bind Event Listeners
    bindEvents: function() {
        var self = this;
        // Check if we're running on PhoneGap (cordova)
        if (window.cordova) {
            // PhoneGap
            document.addEventListener("load", self.onLoad, false);
			document.addEventListener("deviceready", self.onDeviceReady, false);
			document.addEventListener("offline", self.onOffline, false);
			document.addEventListener("online", self.onOnline, false);
			/*
			 * TODO: Somehow the orientationchange event messes up in Android with Phonegap. 
			 * Have to find out why, for now binding to window.resize seems to do the trick on both OS's. 
			 */
			//window.addEventListener("orientationchange", this.onResize, true);
			$(window).bind('resize', self.onResize);
		} else {
		    // Regular browser
		    
		    // Restyle
		    self.restyleForWeb();
		    // Assume browser is online
		    self.online = true;
		    // Bind resize event
		    $(window).bind('resize', self.onResize);
		    // Kickoff device ready (dont't have to call any "dom ready" event 
		    // because all JS is loaded in the bottom of the page so the dom is loaded before the JS )
			self.onDeviceReady(); 
		}
		
		// Bind filter change event, refreshes the worldmap
		/*
		 * TODO: maybe don't call this at input changed in future when more filter options are added
		 * Should be called then when the close button on the filter screen has been clicked
		 */
        $('#filter-data input').change(function() {
            /*
             * For now currentfilter is only a string value, this has to be extended to become a whole object 
             * We need to build an object from a combination of all form fields
             */ 
            app.currentfilter = $(this).val();
            /* 
             * Because currentfilter is string, now send it for key and value
             * When currentfilter becomes object we need to create a function that 
             * generates a key based on a object and send that as first param to getWorldmapData
             */
            app.getWorldmapData(app.currentfilter, app.currentfilter, function(err, data){
                app.mapdata = data;     
            });
        });		
        
        /*
         * TODO: Johan, you can add event listeners for hierarchy navigation click events here
         * all html for the navigation should be in the options panel div
         */
    },
    // Load event handler
    onLoad: function(){
         
    },
    // Deviceready event handler
    onDeviceReady: function() {
        // Open local database
        app.openDatabase(function(){
            // Load user settings
            /*
             * Not used for now but idea is to store the last filter combination in there and maybe
             * some more options. 
             */
            app.store.getUserSettings(function(results){
                // Load worldmap
                // Get selected filter
                app.currentfilter = $('#filter-data input:checked').val();
                // Get worldmapdata and call showpage to show the homescreen
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
        var orientation='portrait';
        if(window.orientation == -90 || window.orientation == 90) orientation = 'landscape';        
        /*
         * For now this seems to work best on Android as well as on iOs. 
         * Android somehow does not handle orientation correctly??  
         */
         
        //if(orientation == 'portrait'){
            //do something
            height = $(window).height() - $('#header').height();
            width = $(window).width();        
        //}
        //else if(orientation == 'landscape') {
            //do something
        //    height = $(window).width() - $('#header').height();
        //    width = $(window).height();      
        //}
   
        // Adjust size of options panel
        $('#optionspanel').css({
            height: height,
            width: width,
            left: 0 -width
        });
        
        // Adjust size of page div(s)
        $('div.page').css({
            height: height,
            width: width
        });        
        
        // Re-init worldmap to rescale the svg
        worldmap.init(width, height);    
    },    
    // Function that restyles the interface where needed when running in "web mode"
    restyleForWeb: function(){
        /*
         * Temporary just change header color to show difference between web and app
         * Can be extended later
         */
        
        $('#header').addClass('ui-bar-b').removeClass('ui-bar-a');
    },
    // Opens the database and checks for new data. If found, clears the local storage cache before proceeding
    openDatabase: function(cb){
        // Init localstorage
        app.store = new LocalStorageStore();
        // Database opened - Check availability of new data on server
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
    // Shows a page (div element with class "page") based on an ID
    showPage: function(pageId){
        // Hide all "page's"
        $('div.page').hide();
        var strId = '#'+pageId;

        var height = $(window).height() - $('#header').height();
        var width = $(window).width();
        // Set correct width and height for "page" div
        $(strId).css({
            height: height,
            width: width
        });
        // Fade in the page div
        $(strId).fadeIn(500, function(){
            // If we are on the map page init the worldmap
            if(pageId==='map'){
                worldmap.mapVariation = app.currentfilter;
                worldmap.mapData = app.mapdata;
                worldmap.init(width, height);    
            }
        });
        // set height and with for options panel
        $('#optionspanel').css({
            height: height,
            width: width,
            left: 0 -width -10
        });
    },
    // Toggles the settings panel for the map. Calls re-init on the worldmap
    /*
     * Maybe also should get the actual data here so we only do one ajax call once done with filter screen
     */ 
    toggleSettings: function(){
        var left = parseInt($('#optionspanel').css('left')) < 0 ? 0 : - $(window).width() -10;
        // Set the correct icon for the settings button
        if (left === 0){
            $('#settingstoggle').find('.ui-icon').addClass('ui-icon-arrow-l').removeClass('ui-icon-arrow-r')
        }else{
            $('#settingstoggle').find('.ui-icon').addClass('ui-icon-arrow-r').removeClass('ui-icon-arrow-l')
        }
        // Animate the optionspanel in or out
        $('#optionspanel').animate({
            left: left
        });      
        // If options panel is dissappearing then re-init worldmap
        if (left < 0){
            $('#map').show(); 
            worldmap.mapVariation = app.currentfilter;
            worldmap.mapData = app.mapdata;
            worldmap.init();             
        }
          
    } 
};
