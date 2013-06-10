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
    current_oru: '',
    signedin: true,
    current_mru: 'Philips',
    mapdata: {},
    window: {
    	width: 0,
    	height: 0,
    	optionswidth: '0px'
    },
    $producttree: $('#producttree'),
    $producttreetemp: $('#producttree_temp'),
    $selectoru: $('#select-oru'),
    $bottomcarousel: $('#carousel-single-image'),
    $menu: $('#menu'),
    $signin: $('#signin'),
    $signedin: $('#signedin'),
    $favourites: $('#favourites'),
    $worldmappage: $('#wrapper'),
    $selectoru: $('#select-oru'),
    $infopanel: $('#info'),
    $showmenu: $('.showMenu'),
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
        app.$selectoru.change(function() {
            /*
             * For now currentfilter is only a string value, this has to be extended to become a whole object 
             * We need to build an object from a combination of all form fields
             */ 
            app.current_oru = $(this).val();
            /* 
             * Because currentfilter is string, now send it for key and value
             * When currentfilter becomes object we need to create a function that 
             * generates a key based on a object and send that as first param to getWorldmapData
             */
            app.getWorldmapData(app.current_oru, app.current_oru, function(err, data){
                worldmap.mapVariation = app.current_oru;
                worldmap.mapData = data;
              
                worldmap.init(app.window.width, app.window.height);  
            });
        });		
        
        self.menuStatus = 'closed';
        app.infoStatus = '0px';

        app.$showmenu.click(function(){

            if(self.menuStatus == 'closed'){
            	$("#wrapper").css({
            		marginLeft: "-" + app.window.optionswidth
	            });
	            self.menuStatus = 'open'
	            return false;
        	} else {
				$("#wrapper").css({
					marginLeft: "0px",
				});
				self.menuStatus = 'closed'
				return false;
            }
        });
     
        app.$showmenu.on("swipeleft", function(){
        	$("#wrapper").css({
        		marginLeft: "-" + app.window.optionswidth
            });
            self.menuStatus = 'open'
        });
     
        app.$showmenu.on("swiperight", function(){
			$("#wrapper").css({
				marginLeft: "0px",
			});
			self.menuStatus = 'closed'
        });
        
        app.$menu.on("swiperight", function(){
			$("#wrapper").css({
				marginLeft: "0px",
			});
			self.menuStatus = 'closed'
        });        
        
        app.$infopanel.on("swipedown", function(){
        	$(this).animate({
        		bottom: "-200px"
        	}, 300, function(){
        		//app.menuStatus = "0px"
        	});
        }); 
        /*
         * TODO: Johan, you can add event listeners for hierarchy navigation click events here
         * all html for the navigation should be in the options panel div
         */
    },
    // Load event handler
    onLoad: function(){
    	var self = this;

    },
    // Deviceready event handler
    onDeviceReady: function() {
    	var self = this;
    	if(self.signedin){
    		// hide signin panel
    		self.$signin.hide();
    		self.$signedin.show();
    		// show signout and favourites
    		//self.$favourites.show();
    	}    	

        // Open local database
    	app.myScroll = new iScroll('menu', {lockDirection: true }); 
    	
        app.openDatabase(function(){
        	app.getArrTranslations(function(result){
            	$('body').append('<script>'+result+'</script>');
            	// get producttree for generating the filter component
            	app.getMruData(function(result){
                	app.$producttreetemp.html(result);
                	// render the top level of the tree
                	var selector = 'li#philips >ul > li';
                	app.renderSelectList(selector, false);
                	
                    $('#menu').css({
                    	width: app.window.optionswidth
                    });        		
            	});
            	self.arrfavourites = self.store.findFavourites(function(result){
            		self.renderFavourites(result);
            	});            	
                app.$bottomcarousel.iosSlider({
        			snapToChildren: true,
                    scrollbar: false,
                    desktopClickDrag: true,
                    keyboardControls: true,
                    responsiveSlideContainer: true,
                    responsiveSlides: true,
                    onSliderResize: app.resizeSlider
        		}); 
                // Load user settings
                /*
                 * Not used for now but idea is to store the last filter combination in there and maybe
                 * some more options. 
                 */
                app.store.getUserSettings(function(results){
                	// TODO: Load favourites screen with result
                	
                    // Load worldmap
                    // Get selected filter
                    app.current_oru = $('div.oru-button.selected').attr('data-value');
                    // Get worldmapdata and call showpage to show the homescreen
                    app.getWorldmapData(app.current_oru, app.current_oru, function(err, data){
                        app.mapdata = data;
                        app.onResize();              
                    });
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
    // OnResize event handler
    onResize: function(event) {
        app.window.height = $(window).height();
        app.window.width = $(window).width();   
        //alert('width: ' + app.window.width + ' height: ' + app.window.height);
        app.window.optionswidth = app.window.width - ($("a.showMenu").width() + 20) + 'px';
        app.window.intoptionswidth = app.window.width - ($("a.showMenu").width() + 20);
        // Re-init worldmap to rescale the svg
        app.initMap();
    	

        app.$menu.css({
	    	width: app.window.optionswidth
	    }); 
        app.$favourites.css({
	    	width: app.window.optionswidth,
	    	right: - app.window.intoptionswidth
	    });         

        app.$worldmappage.css({
        	marginLeft: '0px'
        });		

        app.myScroll.refresh();
        //app.menuStatus = '0px';
        
        app.$bottomcarousel.iosSlider('destroy');
    	setTimeout(function() {
            app.$bottomcarousel.iosSlider({
    			snapToChildren: true,
                scrollbar: false,
                desktopClickDrag: true,
                keyboardControls: true,
                responsiveSlideContainer: true,
                responsiveSlides: true,
                onSliderResize: app.resizeSlider
    		}); 
    	}, 200);
    	
		$('div.oru-button').css({
    	    width: ((app.window.intoptionswidth - 40) / 3)  -1
        });
		
        app.$producttree.corner();
        $('.btn').corner();
        $('div.oru-button.left').corner('left');
        $('div.oru-button.right').corner('right');
        

      
    },
    resizeSlider: function(){

  	
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
            // if new data clear cache table-webkit-transition: right 0.3s ease-in-out;
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
    getArrTranslations: function(cb){
        // Check localstorage first 
        app.store.findCacheKey('arr_translations', function(result){
            
            if(result){
            	
                cb(result);
            }else{
                // if not found in cache
                if(app.online){
                    $.ajax({
                        type: "GET",
                        url: config.general.js_url,
                        dataType: 'text'
                    }).done(function( result ) {
                        app.store.setCacheKey('arr_translations', result, function(){
                            cb(result);
                        });
                        
                    }).fail(function(xhr, err){
                        cb(err);
                    });                                
                }else{
                    cb('');
                }
   
            }
        });
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
    getMruData: function(cb){
        // Check localstorage first 
        app.store.findCacheKey('mru_tree', function(result){
            
            if(result){
            	
                cb(result);
            }else{
                // if not found in cache
                if(app.online){
                    $.ajax({
                        type: "GET",
                        url: config.general.mru_url,
                        dataType: 'html'
                    }).done(function( result ) {
                        app.store.setCacheKey('mru_tree', result, function(){
                            cb(result);
                        });
                        
                    }).fail(function(xhr, err){
                        cb(err);
                    });                                
                }else{
                    cb('');
                }
   
            }
        });
    },    
    // Shows a page (div element with class "page") based on an ID
    initMap: function(){
        worldmap.mapVariation = app.current_oru;
        worldmap.mapData = app.mapdata;
        worldmap.init(app.window.width, app.window.height);
        $('#menu, #favourites').css({
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
    oruSelected: function(el){
    	var $el = $(el);
    	$el.parent().find('div').removeClass('selected');
    	$el.addClass('selected');
    	app.current_oru = $el.attr('data-value');
        /* 
         * Because currentfilter is string, now send it for key and value
         * When currentfilter becomes object we need to create a function that 
         * generates a key based on a object and send that as first param to getWorldmapData
         */
        app.getWorldmapData(app.current_oru, app.current_oru, function(err, data){
            worldmap.mapVariation = app.current_oru;
            worldmap.mapData = data;
          
            worldmap.init(app.window.width, app.window.height);  
        });    	
    },
    mruSelected: function($el){
    	var $spancurrentfilter = app.$producttree.find('span#current_filter'),
    		$arrselect = app.$producttree.find('.cbxoverlay');
    	//alert(id);	
		var elClicked = $el;// $el.parent('li').find('input');
        if(!elClicked.hasClass('checked')) {  
        	$arrselect.removeClass('checked');
        	elClicked.addClass('checked')
    		app.current_mru = elClicked.attr('data-value');
    		$spancurrentfilter.html(app.current_mru); 
        }else{
        	//if($spancurrentfilter.html() == elClicked.attr('data-value')) {
        		app.current_mru = 'philips';
        		$spancurrentfilter.html(app.current_mru);
        		elClicked.removeClass('checked');
        	//}
        }
    },
    renderSelectList: function(selector, showBackbutton){
    	var self = this,
    		backbutton = '<a id="btn_back" onclick="app.showPreviousLevel();" href="#"></a></div>';
    	
    	app.$producttree.find('li').remove();
    	//$('.cbxoverlay').remove();
    	if(!showBackbutton){
    		app.$producttree.append('<li data-theme="c" data-role="list-divider"><span id="current_filter">'+app.current_mru+'</span></li>');
    	}else{
    		app.$producttree.append('<li data-theme="c" data-role="list-divider">'+backbutton+'<span id="current_filter">'+app.current_mru+'</span></li>');    	
    	}
    	$.each($(selector), function(index, el){
    		var $el = $(el),
    			id = $el.attr('id'),
    			name = $el.find('div').html();
    		
    		if(app.$producttreetemp.find('li[id="'+id+'"]').find('ul').length > 0){
    			app.$producttree.append('<li data-id="'+id+'" data-inverse="true"><div data-value="'+id+'" class="cbxoverlay"></div><div class="li_name">'+name+'</div><div class="li_shownext" onclick="app.showNextLevel(\''+id+'\');"></div></li>');	
    		}else{
    			app.$producttree.append('<li data-id="'+id+'" data-icon="false"><div data-value="'+id+'" class="cbxoverlay"></div><div class="li_name">'+name+'</div></li>');
    		}
    	});      

        var event = "ontouchend" in document ? 'tap' : 'click';        
		$('.cbxoverlay').bind(event, function(e) {
			app.mruSelected($(this));
		});	        
        
    	self.myScroll.refresh(); 
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
    },
    closeInfoPanel: function(){
    	worldmap.map.clearSelectedRegions();
    	$('#info').animate({
    		bottom: "-200px"
    	}, 300, function(){
    		//app.menuStatus = "0px"
    		
    	});    	
    },
    btnSignInClick: function(el){
    	var $el = $(el),
    		$loginScreen = $('#popupLogin');
    	if($loginScreen.hasClass('open')){
    		//handle actual login
    		
    	}else{
    		$loginScreen.addClass('open');
    	}
    },
    showFavourites: function(){
    	var self = this;
    	self.$favourites.css({
    		right: 0
    	}, 300, function(){
    		//app.menuStatus = "0px"
    		
    	});
    },
    hideFavourites: function(){
    	var self = this;
    	self.$favourites.css({
    		right: - self.window.intoptionswidth 
    	}, 300, function(){
    		//app.menuStatus = "0px"
    		
    	});
    },
    addFavourite: function(key, value){   	
    	key = 'fav_' + key;
        app.store.setCacheKey(key, value, function(){
            
        });    	
    },
    removeFavourite: function(){
        app.store.removeCacheKey(key); 	
    },
    renderFavourites: function(arrFavs){
    	var self = this;
    	for(var i=0;i<arrFavs.length;i++){
    		self.$favourites.append(arrFavs[i] + '<br/>');
    	}
    }
};
function applyFilter(){}