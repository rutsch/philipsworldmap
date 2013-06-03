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
    current_mru: 'Philips',
    mapdata: {},
    window: {
    	width: 0,
    	height: 0,
    	optionswidth: '0px'
    },
    // Application Constructor
    initialize: function() {
        var self = this;
        
        function include(script, callback) {
            var e = document.createElement('script');
            e.onload = callback;
            e.src = script;
            e.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(e);
        }

        if ("ontouchend" in document){
            include('cordova-2.7.0.js', function() {
            	self.bindEvents();
            });        	
        }
        else{
        	self.bindEvents();
        }
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
        $('#select-oru').change(function() {
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
    	var self = this;
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
            	var selector = 'li#philips >ul > li';
            	app.renderSelectList(selector, false);
            	$("#bottomcarousel").touchCarousel({

                });

            	
                // Load user settings
                /*
                 * Not used for now but idea is to store the last filter combination in there and maybe
                 * some more options. 
                 */
                app.store.getUserSettings(function(results){
                    // Load worldmap
                    // Get selected filter
                    app.currentfilter = $('#select-oru').val();
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
        
        app.myScroll = new iScroll('menu', {lockDirection: true });  
        
        app.menuStatus = '0px';
        app.infoStatus = '0px';

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
        		bottom: "-200px"
        	}, 300, function(){
        		//app.menuStatus = "0px"
        	});
        });    
        //TODO: hier die onderste paneeltjes animeren.
    
    
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
        $('#carousel-single-image, #carousel-single-image .touchcarousel-item, #carousel-single-image div.placeholder').css({
	    	width: app.window.width
	    });
        $('#details').css({
	    	width: app.window.width - 20
	    });	
        $(".ui-page-active").css({
        	marginLeft: '0px'
        });

		$("#carousel-single-image").touchCarousel({
			pagingNav: true,
			scrollbar: false,
			directionNavAutoHide: false,				
			itemsPerMove: 1,				
			loopItems: true,				
			directionNav: false,
			autoplay: false,
			autoplayDelay: 2000,
			useWebkit3d: true,
			transitionSpeed: 400
		});      
        app.myScroll.refresh();
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
        });
        
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
    itemSelected: function(id){
    	var $spancurrentfilter = $('span#current_filter'),
    		$arrselect = $('.select_mru');
    	//alert(id);	
		var elClicked = id.parent('div').find('input');
        if(!elClicked.is(":checked")) {  
        	$arrselect.prop('checked', false);
    		app.current_mru = elClicked.attr('data-value');
    		elClicked.prop('checked', true);
    		$spancurrentfilter.html(app.current_mru); 
        }else{
        	if($spancurrentfilter.html() == elClicked.attr('data-value')) {
        		app.current_mru = 'philips';
        		$spancurrentfilter.html(app.current_mru);
        	}
        	$arrselect.prop('checked', false);
        }
        
		
    },
    renderSelectList: function(selector, showBackbutton){
    	var self = this,
    		backbutton = '<a id="btn_back" onclick="app.showPreviousLevel();" href="#" data-role="button" data-icon="back" data-iconpos="notext">Back</a></div>',
    		$producttree = $("#producttree");
    	
    	$producttree.html('');
    	$('.cbxoverlay').remove();
    	if(!showBackbutton){
    		$producttree.append('<li data-theme="c" data-role="list-divider"><span id="current_filter">'+app.current_mru+'</span></li>');
    	}else{
    		$producttree.append('<li data-theme="c" data-role="list-divider">'+backbutton+'<span id="current_filter">'+app.current_mru+'</span></li>');    	
    	}
    	$.each($(selector), function(index, el){
    		var $el = $(el);
    		if($('#producttree_temp li[id="'+$el.attr('id')+'"]').find('ul').length > 0){
    			$producttree.append('<li data-id="'+$el.attr('id')+'" data-inverse="true" onclick="app.showNextLevel(\''+$el.attr('id')+'\');"><div data-id="'+$el.attr('id')+'" class="cbxoverlay"></div><input data-value="'+$el.attr('id')+'" style="margin-left: 20px;" class="select_mru" type="radio" /><a href="#'+$el.attr('id')+'">'+$el.find('div').html()+'</a></li>');	
    		}else{
    			$producttree.append('<li data-id="'+$el.attr('id')+'" data-icon="false"><div data-id="'+$el.attr('id')+'" class="cbxoverlay"></div><input data-value="'+$el.attr('id')+'" style="margin-left: 20px;" class="select_mru" type="radio" /><a href="#'+$el.attr('id')+'">'+$el.find('div').html()+'</a></li>');
    		}
    	});

    	$('[data-role=button]').button();
    	
    	var isTouchSupported = "ontouchend" in document;
    	var event = isTouchSupported ? 'tap' : 'click';

    	$('.cbxoverlay').bind(event, function(e){
    		if( e.target.tagName.toUpperCase() === 'DIV' ) {
	        	e.stopPropagation();
	    		e.stopImmediatePropagation();
	    		e.preventDefault();    		
	    		app.itemSelected($(this));
    		}
    	});    	
    	$('#select-oru').selectmenu('close');
    	
    	$producttree.listview(); 
    	$producttree.listview('refresh');
    	var height = $('.ui-controlgroup-controls').height() + 120;
    	$('#wrapper form').css({height: height});
    	    	
    	app.myScroll.refresh(); 
    },
    showNextLevel: function(clicked_id){
    	var self = this,
    		selector = 'li#'+clicked_id+ ' >ul > li';
    	
    	self.renderSelectList(selector, true);
    },
    showPreviousLevel: function(){
    	var self = this,
    		// get id from second item from current list (first one is the header)
    		id = $($("#producttree").find('li')[1]).attr('data-id'),
	    	// find first parent ul of parent ul in temp producttree
    		selector = $('#producttree_temp li#'+id).parent('ul').parents('ul').first().find('>li');

    	if($('#producttree_temp li#'+id).parent('ul').parents('ul').first().find('>li').first().parent('ul').parents('ul').first().find('>li').length > 1){
    		self.renderSelectList(selector, true);
    	}else{
    		self.renderSelectList(selector, false);
    	}
    }
};
function applyFilter(){}