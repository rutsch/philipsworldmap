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
    window: {
    	width: 0,
    	height: 0,
    	optionswidth: '0px'
    },
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
        $('#select-choice-1').change(function() {
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
                worldmap.mapVariation = app.currentfilter;
                worldmap.mapData = data;
              
                worldmap.init(app.window.width, app.window.height);  
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
        	// get producttree for generating the filter component
            $.ajax({
                type: "GET",
                url: 'http://95.97.163.236/philips/producttree',
                dataType: 'html',
                data: {
                    
                }
            }).done(function( result ) {
            	$('#producttree_temp').html(result);
            	// render the top level of the tree
            	var topelement = $('#producttree_temp').find('li').first();
            	
            	$('#producttree').append('<li data-role="list-divider">Current filter: <span id="current_filter"></span></li>');
            	$("#producttree").append('<li onclick="app.showNextLevel(\''+$(topelement).attr('id')+'\');"><span><input data-value="'+$(topelement).attr('id')+'" style="margin-left: 10px;" class="select_mru" type="checkbox" /></span><a href="#'+$(topelement).attr('id')+'">'+$(topelement).find('div').html()+'</a></li>');
            	$("#producttree").listview();     
            	
            	$('.select_mru').click(function(e){
            		e.stopPropagation();
            		$('span#current_filter').html($(this).attr('data-value'));
            	});
                // Load user settings
                /*
                 * Not used for now but idea is to store the last filter combination in there and maybe
                 * some more options. 
                 */
                app.store.getUserSettings(function(results){
                    // Load worldmap
                    // Get selected filter
                    app.currentfilter = $('#select-choice-1').val();
                    // Get worldmapdata and call showpage to show the homescreen
                    app.getWorldmapData(app.currentfilter, app.currentfilter, function(err, data){
                        app.mapdata = data;
                        app.onResize();              
                    });
                });                
            }).fail(function(xhr, err){
                cb(null, false);
            });            	
        	

        });
        app.menuStatus = '0px';

        $("a.showMenu").click(function(){
            if(app.menuStatus == "0px"){
            	$(".ui-page-active").animate({
            		marginLeft: "-" + app.window.optionswidth
	            }, 300, function(){
	            	app.menuStatus = app.window.optionswidth
	            });
	            return false;
        	} else {
				$(".ui-page-active").animate({
					marginLeft: "0px",
				}, 300, function(){
					app.menuStatus = "0px"
				});
				return false;
            }
        });
     
        $('.showMenu').on("swipeleft", function(){
        	$(".ui-page-active").animate({
        		marginLeft: "-" + app.window.optionswidth
        	}, 300, function(){
        		app.menuStatus = app.window.optionswidth
        	});
        });
     
        $('.showMenu, #menu').on("swiperight", function(){
        	$(".ui-page-active").animate({
        		marginLeft: "0px"
        	}, 300, function(){
        		app.menuStatus = "0px"
        	});
        });
        $('#info').on("swipedown", function(){
        	$(this).animate({
        		bottom: "-250px"
        	}, 300, function(){
        		app.menuStatus = "0px"
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
    // OnResize event handler
    onResize: function(event) {
        app.window.height = $(window).height();
        app.window.width = $(window).width();        
        app.window.optionswidth = app.window.width - ($("a.showMenu").width() + 20) + 'px';
        $('#menu').css({
        	width: app.window.optionswidth
        });
        $(".ui-page-active").css({
        	marginLeft: '0px'
        });
        app.menuStatus = '0px';
        // Re-init worldmap to rescale the svg
        app.initMap(); 
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
    initMap: function(){
        worldmap.mapVariation = app.currentfilter;
        worldmap.mapData = app.mapdata;
        worldmap.init(app.window.width, app.window.height);
        $('#menu').css({
        	display: 'block'
        })
    },
    /*
     * Helpers for the MRU navigation
     */
    renderFilterListLevel: function(){
    	
    },
    hasParents: function(el){
    	return $(el).parents('li') > 0;
    },
    hasChildren: function(el){
    	return $(el).find('ul') > 0;
    },
    showNextLevel: function(clicked_id){
    	console.log(clicked_id);
    	var selector = 'li#'+clicked_id+ ' >ul > li';
    	$("#producttree").html('');
    	$('#producttree').append('<li data-role="list-divider">Current filter: <span id="current_filter"></span></li>');
    	
    	$.each($(selector), function(index, el){
    		$("#producttree").append('<li onclick="app.showNextLevel(\''+$(el).attr('id')+'\');"><span><input data-value="'+$(el).attr('id')+'" style="margin-left: 10px;" class="select_mru" type="checkbox" /></span><a href="#'+$(el).attr('id')+'">'+$(el).find('div').html()+'</a></li>');
    	});
    	$('.select_mru').click(function(e){
    		e.stopPropagation();
    		$('span#current_filter').html($(this).attr('data-value'));
    	});    	
    	$("#producttree").listview('refresh'); 
    },
    showPreviousLevel: function(){
    	
    }
};
function applyFilter(){}