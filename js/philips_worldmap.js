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
    current_mru: 'philips',
    mapdata: {},
    window: {
    	width: 0,
    	height: 0,
    	optionswidth: '0px'
    },
    orudata: {},
    snapshotdata: {},
    snapshothistory: {},
    //JT: shouldn't we do something like objPageElements (in AR) and fill this object onload with very specific selectors?
    $producttree: $('#producttree'),
    $producttreetemp: $('#producttree_temp'),
    $selectoru: $('#select-oru'),
    $bottomcarousel: $('#carousel-single-image'),
    $menu: $('#menu'),
    $signin: $('#signin'),
    $signedin: $('#signedin'),
    $slideselectors: $('.slideSelectors'),
    $buttons: $('.btn'),
    $orubuttons: $('div.oru-button'),
    $orubtnleft: $('div.oru-button.left'),
    $orubtnright: $('div.oru-button.right'),
    $favourites: $('#favourites'),
    $ulfavourites: $('.ulfavourite'),
    $worldmappage: $('#wrapper'),
    $selectoru: $('#select-oru'),
    $infopanel: $('#info'),
    $showmenu: $('.showMenu'),
    $currentfilter: $('#current_favourite ul'),
    $btnaddfavourite: $('div.add_favourite'),
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
		} else {
		    // Regular browser
		    // Restyle for web
		    self.restyleForWeb();
		    // Assume browser is online
		    self.online = true;

		    // Kickoff device ready (dont't have to call any "dom ready" event 
		    // because all JS is loaded in the bottom of the page so the dom is loaded before the JS )
			self.onDeviceReady();                                                                    
		}
        // Bind to resize event always because we're not using onOrientationChanged for the app now
        $(window).bind('resize', self.onResize);
		// Bind filter change event, refreshes the worldmap
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
                worldmap.mapVariation = 'lives_improved';
                worldmap.mapData = data;
              
                worldmap.init(app.window.width, app.window.height);  
            });
        });		
        
        self.menuStatus = 'closed';
        app.infoStatus = '0px';

        app.$showmenu.click(function(){

            if(self.menuStatus == 'closed'){
            	//JT: selector should be made generic (and more specific) to improve performance
                app.$worldmappage.css({
            		marginLeft: "-" + app.window.optionswidth
	            });
	            self.menuStatus = 'open'
	            return false;
        	} else {
				app.$worldmappage.css({
					marginLeft: "0px",
				});
				self.menuStatus = 'closed'
				return false;
            }
        });
     
        app.$showmenu.on("swipeleft", function(){
            //JT: selector should be made generic (and more specific) to improve performance
        	app.$worldmappage.css({
        		marginLeft: "-" + app.window.optionswidth
            });
            self.menuStatus = 'open'
        });
     
        app.$showmenu.on("swiperight", function(){
            //JT: selector should be made generic (and more specific) to improve performance
			app.$worldmappage.css({
				marginLeft: "0px",
			});
			self.menuStatus = 'closed'
        });
        
        app.$menu.on("swiperight", function(){
            //JT: selector should be made generic (and more specific) to improve performance
			app.$worldmappage.css({
				marginLeft: "0px",
			});
			self.menuStatus = 'closed'
        });        
        app.$favourites.on("swiperight", function(){
            //JT: selector should be made generic (and more specific) to improve performance
			app.$worldmappage.css({
				marginLeft: "0px",
			});
			self.menuStatus = 'closed'
        });          
        app.$infopanel.on("swipedown", function(){
        	//JT: should we consider a css3 animation here to improve performance
            $(this).css({
        		bottom: "-200px"
        	}, 300, function(){
        		//app.menuStatus = "0px"
        	});
        }); 

    },
    // Load event handler
    onLoad: function(){
    	var self = this;

    },
    // Deviceready event handler
    onDeviceReady: function() {
    	var self = this;
    	if(app.signedin){
    		//JT: signin functionality/fields need to be added...
            // hide signin panel
    		app.$signin.hide();
    		app.$signedin.show();
    	}    	

    	//console.log('getting snapshot data');
    	if (window.cordova) {
    		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.gotFS, app.fail);
    	}else{
    		app.getSnapShotData(function(err, data){
    			if(err){
    				//JT: decent error handing needs to be inserted and handled here - common error handling routine is missing
    			}else{
    				////debugger;
                	app.snapshotdata = data;
                	app.process();   				
    			}
    		});

    	}
    	
        // Open local database
    	  
    },
    gotFS:  function(fileSystem) {
    	app.fileSystem = fileSystem;
    	console.log('got file system');
        fileSystem.root.getFile("snapshotdata.json", null, app.gotFileEntry, app.failOpenSnapshot);
    },
    gotFileEntry: function(fileEntry) {
    	console.log('got file entry');
        fileEntry.file(app.gotFile, app.fail);
    },

    gotFile: function(file){
    	console.log('got file');
        app.readAsText(file);
    },
    gotFileWriter: function(writer){
    	console.log('got file writer');
        writer.onwriteend = function(evt) {
        	console.log('written to end');
        	app.process();
        };	
        //test comment
        if(app.online){
        	app.getSnapShotData(function(err, data){
        		if(err){
        			cb(err);
        		}
                writer.write(JSON.stringify(data));
                //console.log('after writer.write');
                app.snapshotdata = data;
                app.process();        		
        	});
        	
                            
        }else{
            cb({});
        }    
    },    
    gotFileEntryForWriting: function(fileEntry){
    	console.log('got file entry for writing');
    	fileEntry.createWriter(app.gotFileWriter, app.fail);
    },
    readAsText: function(file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            if(!evt.target.result){
            	//window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.gotFSforWriting, app.fail);
            	console.log('read to end failed');
                //JT: filenames need to be made specific for a snapshot... Think we need to add logic to the generation of the filename below.
            	app.fileSystem.root.getFile("snapshotdata.json", {create: true, exclusive: false}, app.gotFileEntryForWriting, app.fail);
            }else{
            	console.log('read to end');
            	app.snapshotdata = JSON.parse(evt.target.result);
            	app.process();
            }
               
        };
        reader.readAsText(file);
    },
    getSnapShotData: function(cb){
    	console.log('getting snapshot data');
    	var objData = {};
        var objRequest = $.ajax({
            type: "GET",
            url: config.general.snapshot_url,
            dataType: 'jsonp',
            data: objData,
            cache: false,
            timeout: 40000
        });

        objRequest.done(function (response) {
        	console.log('getting snapshot data complete');
        	cb(null, response);
        });

        objRequest.fail(function (objRequestStatus) {
            //500 status from server, timeout of request or json parse error
            //console.log('fail - ' + JSON.stringify(objRequestStatus));
        	//debugger;
            var strErrorMessage;
            switch (objRequestStatus.status) {
                case 0:
                    //timeout
                    strErrorMessage = 'Timeout has occurred while retrieving: ' + config.general.snapshot_url;
                    break;
                case 200:
                    //json parse error
                    strErrorMessage = 'JSON parse error has occurred. raw= ' + objRequestStatus.responseText;
                    break;
                default:
                    //server error
                    strErrorMessage = 'server error has occured. Details' + objRequestStatus.responseText;
                    break;
            }
            cb(strErrorMessage);
            //JT: error handling needs to be implemented here...

            //alert("strErrorMessage="+strErrorMessage);
            //show the error message
            //console.log(strErrorMessage);
        });     	
    },

    process: function(){
    	//console.log(app.snapshotdata['lives-improved_PD0200_world'].g);
        app.myScroll = new iScroll('menu', {lockDirection: true }); 
        app.myScrollFavs = new iScroll('favourites', {lockDirection: true });
    	
        app.openDatabase(function(){
        	//console.log('openend database');

            //JT: we can retrieve this array one time only - should be stored in a generic variable "onload" - assuming that this routine will be called multiple times this will improve performance
        	// This is done only once at startup
        	app.getArrTranslations(function(result){
        		//console.log('got translations');
            	$('body').append('<script type="text/javascript">'+result+'</script>');
            	// get mru tree for generating the filter component
            	//JT: we can retrieve this data one time only - "onload"?
                app.getMruData(function(result){
                	app.$producttreetemp.html(result);
                	// render the top level of the tree
                	console.log('got mru');
                	var selector = 'li#philips';//'li#philips >ul > li';
                	app.renderSelectList(selector, false);
                	
                    //JT: create a generic selector "onload"
                    $('#menu').css({
                    	width: app.window.optionswidth
                    });    
                	// get the oru json data
                	app.getOruData(function(result){
                		console.log('got oru');
                    	// get the snapshot data
                		app.orudata = result;
                    	
                		app.current_oru = 3;
                        // Get worldmapdata and call showpage to show the homescreen
                        app.onResize();   		
                	});                       
            	});
            	
            	self.arrfavourites = app.store.findFavourites(function(result){
            		app.renderFavourites(result);
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
                	//JT: this works already??
                	// Idea for version 2 might be to store the user's last zoom settings, last selected country etc in a json objct that we can then pass to the worldmap init function
                });          		
        	});

        });                  	
    },
    failOpenSnapshot: function(evt) {
    	app.fileSystem.root.getFile("snapshotdata.json", {create: true, exclusive: false}, app.gotFileEntryForWriting, app.fail);
    },      
    fail: function(evt) {
        //JT: handle errors here?
    	//console.log(evt);
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
        var temp = app.window.width - ($("a.showMenu").width() + 20);
        app.window.intoptionswidth = temp > 400 ? 400 : temp;
        app.window.optionswidth = app.window.intoptionswidth + 'px';
        
        // Re-init worldmap to rescale the svg
        
    	

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
        app.myScrollFavs.refresh();
        //app.menuStatus = '0px';
        
        app.$bottomcarousel.iosSlider('destroy');
    	setTimeout(function() {
            app.$bottomcarousel.iosSlider({
    			snapToChildren: true,
                scrollbar: false,
        		navSlideSelector: '.slideSelectors .item',
        		onSlideChange: slideChange,                
                desktopClickDrag: true,
                keyboardControls: true,
                responsiveSlideContainer: true,
                responsiveSlides: true,
                onSliderResize: app.resizeSlider
    		}); 
    	}, 200);

    	app.$slideselectors.css({
    		left: (app.window.width / 2) - 30
    	});
    	function slideChange(args) {
    		//JT: elements need to be found "onload"	
    		app.$slideselectors.find('.item').removeClass('selected');
    		app.$slideselectors.find('.item:eq(' + (args.currentSlideNumber - 1) + ')').addClass('selected');

    	}
        //JT: elements need to be found "onload"
		app.$orubuttons.css({
    	    width: ((app.window.intoptionswidth - 40) / 3)  -1
        });
		
        app.$producttree.corner();
        //JT: elements need to be found "onload"
        app.$buttons.corner();
        app.$ulfavourites.corner();
        app.$orubtnleft.corner('left');
        app.$orubtnright.corner('right');

        // Get worldmapdata and call showpage to show the homescreen
        app.current_oru = $('div.oru-button.selected').attr('data-value');
        app.current_mru = $('#current_filter').html();        
        console.log('before get worldmap data');
        app.getWorldmapData(app.current_oru, app.current_mru, function(err, data){
        	////debugger;
            app.mapdata = data;
            app.initMap();             
        });            
        self.menuStatus = 'closed';
        
    },
    resizeSlider: function(){

  	
    },
    // Function that restyles the interface where needed when running in "web mode"
    restyleForWeb: function(){
        /*
         * Temporary just change header color to show difference between web and app
         * Can be extended later
         */
        
    },
    // Opens the database and checks for new data. If found, clears the local storage cache before proceeding
    openDatabase: function(cb){
        // Init localstorage
        app.store = new LocalStorageStore();
        //app.sql = new WebSqlStore();
        
        // Database opened - Check availability of new data on server
        app.checkNewData(function(err, hasNewData){
            // if new data clear cache table-webkit-transition: right 0.3s ease-in-out;
            if(hasNewData){
                app.store.clearCache(cb);   
                //app.sql.clearCache(cb);
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
                	var objData = {};
                    var objRequest = $.ajax({
                        type: "GET",
                        url: config.general.js_url,
                        dataType: 'text',
                        data: objData
                    });

                    objRequest.done(function (response) {
                    	////debugger;
                        app.store.setCacheKey('arr_translations', response, function(){
                            cb(response);
                        });
                    });

                    objRequest.fail(function (objRequestStatus) {
                        //500 status from server, timeout of request or json parse error
                        //console.log('fail - ' + JSON.stringify(objRequestStatus));
                    	////debugger;
                        var strErrorMessage;
                        switch (objRequestStatus.status) {
                            case 0:
                                //timeout
                                strErrorMessage = 'Timeout has occurred while retrieving: ' + objRequest.url;
                                break;
                            case 200:
                                //json parse error
                                strErrorMessage = 'JSON parse error has occurred. raw= ' + objRequestStatus.responseText;
                                break;
                            default:
                                //server error
                                strErrorMessage = 'server error has occured. Details' + objRequestStatus.responseText;
                                break;
                        }      
                        
                        cb(strErrorMessage);
                    });    
                               
                }else{
                    cb('');
                }
            }
        });

    },    
    // Get data for worldmap (if present in localstorage then serve that, else do ajax call)
    getWorldmapData: function(oru, mru, cb){
    	var self = this;
        // get countries from oru json based on passed oru level
    	//var result = jF('*[guid=dach]', app.orudata).get();

    	var arrRegions = [];

        //colors to be defined in config.js? or maybe even in base_configuration.xml on the server (that might avoid the need to publish the app each time tis changes...)
    	var colors = {
    		'europe': {
    			low: '#99EAF0',
    			middle: '#5BCCD4',
    			high: '#30B6BF'
    		},
    		'asia': {
    			low: '#BE67E9',
    			middle: '#A359C8',
    			high: '#8737B0'    			
    		},
    		'north_america_region': {
    			low: '#7DABF1',
    			middle: '#5C95EA',
    			high: '#3D7FDF'    			
    		},
    		'north america_bmc': {
    			low: '#7DABF1',
    			middle: '#5C95EA',
    			high: '#3D7FDF'    			
    		},    		
    		'south_america': {
    			low: '#CBF277',
    			middle: '#A6D542',
    			high: '#98C833'    			
    		},
    		'latin_america': {
    			low: '#CBF277',
    			middle: '#A6D542',
    			high: '#98C833'    			
    		}
    	};
    	////debugger;
    	// [{"name":"DACH","color":"#d5eff0","value_total_population":"98","value_total_gdp":"4384","code":["DE","AT","CH"],"categories":[{"name":"Philips","code":"PH","value":"87"}]}]
    	if(oru == 1){
    		var region = app.orudata.unit;
    		var color = {
    			low: '#BE67E9',
    			middle: '#A359C8',
    			high: '#8737B0' 
    		}
    		var objRegion = {
    	    		name: region.name,
    	    		guid: region.guid,
    	    		color: color,
    	    		value_total_population: 0,
    	    		value_total_gdp: 0,
    	    		code: [],
    	    		categories: [{
    	    			name: 'Philips',
    	    			code: 'PH',
    	    			value: 0
    	    		}]
    	    	}; 
    		//console.log(jsonPath(region, '$..subunits[?(@.level==4)]'));
    		if(oru < 4){
    			//JT: join and then split?
    			//Don't know of another way to convert a whole array to uppercase ;-)
                objRegion.code = jsonPath(region, '$..subunits[?(@.level==4)].guid').join(',').toUpperCase().split(',');
    		}else{
    			objRegion.code = region.guid.toUpperCase();
    		}
    		
    		var guid = mru + '_' + region.guid;
    		//console.log(guid);
    		var data = app.snapshotdata[guid];//app.sql.findCacheKey(guid);
    		
    		if(data){
    			objRegion.categories[0].value = data.l;
    			objRegion.value_total_population = data.p;
    			objRegion.value_total_gdp = data.g;   			
    		}


	
			arrRegions.push(objRegion);    		
    	}else{
        	var regions = jsonPath(app.orudata, '$..subunits[?(@.level==2)]');

            //JT: here we need to be careful: loops within loops can be a performance killer... the "smallest" loop needs to be the nested loop...
        	$.each(regions, function(index, el){
        		//console.log(el.guid);
        		var color = colors[el.guid];
        		//console.log(color);
        		var arrUnits = jsonPath(el, '$..subunits[?(@.level=='+oru+')]');
        		if(arrUnits){
    	        	$.each(arrUnits, function(index, region){
    	        		////debugger;
    	        		var objRegion = {
    	        	    		name: region.name,
    	        	    		guid: region.guid,
    	        	    		color: color,
    	        	    		value_total_population: 0,
    	        	    		value_total_gdp: 0,
    	        	    		code: [],
    	        	    		categories: [{
    	        	    			name: 'Philips',
    	        	    			code: 'PH',
    	        	    			value: 0
    	        	    		}]
    	        	    	}; 
    	        		//console.log(jsonPath(region, '$..subunits[?(@.level==4)]'));
    	        		if(oru < 4){
    	        			objRegion.code = jsonPath(region, '$..subunits[?(@.level==4)].guid').join(',').toUpperCase().split(',');
    	        		}else{
    	        			objRegion.code = region.guid.toUpperCase();
    	        		}
    	        		
    	        		var guid = mru + '_' + region.guid;
    	        		//console.log(guid);
    	        		var data = app.snapshotdata[guid];//app.sql.findCacheKey(guid);
    	        		
    	        		if(data){
    	        			objRegion.categories[0].value = data.l;
    	        			objRegion.value_total_population = data.p;
    	        			objRegion.value_total_gdp = data.g;   			
    	        		}
    	
    	
    	    	
    	    			arrRegions.push(objRegion);
    	    	    		
    	
    	
    	        		
    	        	}); 
        		}else{
            		var objRegion = {
            	    		name: el.name,
            	    		guid: el.guid,
            	    		color: color,
            	    		value_total_population: 0,
            	    		value_total_gdp: 0,
            	    		code: [],
            	    		categories: [{
            	    			name: 'Philips',
            	    			code: 'PH',
            	    			value: 0
            	    		}]
            	    	}; 
            		//console.log(jsonPath(region, '$..subunits[?(@.level==4)]'));
            		objRegion.code = jsonPath(el, '$..subunits[?(@.level==4)].guid').join(',').toUpperCase().split(',');
            		var guid = mru + '_' + el.guid;
            		//console.log(guid);
            		var data = app.snapshotdata[guid];//app.sql.findCacheKey(guid);
            		
            		if(data){
            			objRegion.categories[0].value = data.lives_improved;
            			objRegion.value_total_population = data.population;
            			objRegion.value_total_gdp = data.gdp;   			
            		}


        	
        			arrRegions.push(objRegion);    			
        		}
        	});    		
    	}

    	////debugger;
		//if(arrRegions.length == arrUnits.length){
			//console.log('processed all');
			////debugger;
			cb(null, arrRegions);
		//}   	


    },
    getMruData: function(cb){
        // Check localstorage first 
        app.store.findCacheKey('mru_tree', function(result){
            
            if(result){
            	
                cb(result);
            }else{
                // if not found in cache
                if(app.online){
                	var objData = {};
                    var objRequest = $.ajax({
                        type: "GET",
                        url: config.general.mru_url,
                        dataType: 'html',
                        data: objData,
                        cache: false,
                        timeout: 40000
                    });

                    objRequest.done(function (response) {
                    	//debugger;
                        app.store.setCacheKey('mru_tree', response, function(){
                            cb(response);
                        });
                    });

                    objRequest.fail(function (objRequestStatus) {
                        //500 status from server, timeout of request or json parse error
                        //console.log('fail - ' + JSON.stringify(objRequestStatus));
                    	////debugger;
                        var strErrorMessage;
                        switch (objRequestStatus.status) {
                            case 0:
                                //timeout
                                strErrorMessage = 'Timeout has occurred while retrieving: ' + objRequest.url;
                                break;
                            case 200:
                                //json parse error
                                strErrorMessage = 'JSON parse error has occurred. raw= ' + objRequestStatus.responseText;
                                break;
                            default:
                                //server error
                                strErrorMessage = 'server error has occured. Details' + objRequestStatus.responseText;
                                break;
                        }      
                        
                        cb(strErrorMessage);
                    });                    	
                               
                }else{
                    cb('');
                }
   
            }
        });
    },  
    getOruData: function(cb){
        // Check localstorage first 
        app.store.findCacheKey('oru_tree', function(result){
            
            if(result){
            	
                cb(JSON.parse(result));
            }else{
                // if not found in cache
                if(app.online){
                	var objData = {};
                    var objRequest = $.ajax({
                        type: "GET",
                        url: config.general.oru_url,
                        dataType: 'jsonp',
                        data: objData,
                        cache: false,
                        timeout: 40000
                    });

                    objRequest.done(function (response) {
                    	//debugger;
                        app.store.setCacheKey('oru_tree', JSON.stringify(response), function(){
                            cb(response);
                        });
                    });

                    objRequest.fail(function (objRequestStatus) {
                        //500 status from server, timeout of request or json parse error
                        //console.log('fail - ' + JSON.stringify(objRequestStatus));
                    	////debugger;
                        var strErrorMessage;
                        switch (objRequestStatus.status) {
                            case 0:
                                //timeout
                                strErrorMessage = 'Timeout has occurred while retrieving: ' + objRequest.url;
                                break;
                            case 200:
                                //json parse error
                                strErrorMessage = 'JSON parse error has occurred. raw= ' + objRequestStatus.responseText;
                                break;
                            default:
                                //server error
                                strErrorMessage = 'server error has occured. Details' + objRequestStatus.responseText;
                                break;
                        }      
                        
                        cb({err: strErrorMessage});
                    });                 	
                                
                }else{
                    cb({});
                }
   
            }
        });    	
    },
    // Shows a page (div element with class "page") based on an ID
    initMap: function(){
    	////debugger;'
    	console.log('init map');
        worldmap.mapVariation = 'lives_improved';
        worldmap.mapData = app.mapdata;
        worldmap.init(app.window.width, app.window.height);
        app.$menu.css({
        	display: 'block'
        });
        app.$favourites.css({
        	display: 'block'
        });
        if (window.cordova) window.cordova.exec(null, null, "SplashScreen", "hide", []);
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

        app.getWorldmapData(app.current_oru, app.current_mru, function(err, data){
            worldmap.mapVariation = 'lives_improved';
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
    		app.current_mru = 'philips';
    		$spancurrentfilter.html(app.current_mru);
    		elClicked.removeClass('checked');
        }
        app.getWorldmapData(app.current_oru, app.current_mru, function(err, data){
            worldmap.mapVariation = 'lives_improved';
            worldmap.mapData = data;
          
            worldmap.init(app.window.width, app.window.height);  
        });    	        
    },
    renderSelectList: function(selector, showBackbutton){
    	var self = this,
    		backbutton = '<a id="btn_back" onclick="app.showPreviousLevel();" href="#"></a></div>';
    	//debugger;
        //JT: destroy() here? do not quite remember, but you probably want to make sure that the associated events are killed as well
    	app.$producttree.find('li').remove();
    	//$('.cbxoverlay').remove();
    	if(!showBackbutton){
    		app.$producttree.append('<li data-theme="c" data-role="list-divider"><span id="current_filter">'+app.current_mru+'</span></li>');
    	}else{
    		app.$producttree.append('<li data-theme="c" data-role="list-divider">'+backbutton+'<span id="current_filter">'+app.current_mru+'</span></li>');    	
    	}
    	//debugger;
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

    	$('div[data-value='+app.current_mru+'].cbxoverlay').addClass('checked');    
    	
        var event = "ontouchend" in document ? 'tap' : 'click';   
        //JT: selector can be much more specific i think     
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
            //JT: can we use globally defined selector here?
    		id = $($("#producttree").find('li')[1]).attr('data-id'),
	    	// find first parent ul of parent ul in temp producttree
    		selector = $('#producttree_temp li#'+id).parent('ul').parents('ul').first().find('>li');
    	

    	
    	if($('#producttree_temp li#'+id).parent('ul').parents('ul').first().find('>li').first().parent('ul').first().find('>li').length > 1){
    		self.renderSelectList(selector, true);
    	}else{
    		self.renderSelectList(selector, false);
    	}
    	//app.$producttree.find('.cbxoverlay').removeClass('checked');
    		
    },
    closeInfoPanel: function(){
    	worldmap.map.clearSelectedRegions();
    	app.$infopanel.css({
    		bottom: "-220px"
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
        //JT: consider using CSS3 animation here to improve performance?
    	//This is a css3 animation.....
    	self.$favourites.css({
    		right: 0
    	}, 300, function(){
    		//app.menuStatus = "0px"
    		
    	});
    	self.myScrollFavs.refresh();
    },
    hideFavourites: function(){
    	var self = this;
        //JT: consider using CSS3 animation here to improve performance?
    	//This is a css3 animation.....
    	self.$favourites.css({
    		right: - self.window.intoptionswidth 
    	}, 300, function(){
    		//app.menuStatus = "0px"
    		
    	});
    },
    addFavourite: function(){   	
    	var self= this;
    	var $el = app.$btnaddfavourite;
        //console.log('in addFavourite - '+$el);
    	////debugger;
    	if($el.hasClass('selected')){
    		var key = $el.parent('div').find('ul li.selected_region').attr('data-key');
    		app.removeFavourite(key);
        	self.arrfavourites = self.store.findFavourites(function(result){
        		self.renderFavourites(result);
        	});     
    	}else{
        	$el.addClass('selected');
        	var selected_region = $('#current_favourite li.selected_region').attr('data-guid');
        	var key = app.current_oru+'_'+app.current_mru+'_'+selected_region; 	
        	key = 'fav_' + key;
        	var value = $('#current_favourite').html();
            app.store.setCacheKey(key, value, function(){
            	self.arrfavourites = self.store.findFavourites(function(result){
            		self.renderFavourites(result);
            	});                
            });      		
    	}
  	
    },
    removeFavourite: function(key){
        app.store.removeCacheKey(key); 
        $('li[data-key='+key+']').parent().parent().find('div.add_favourite').removeClass('selected');
    },
    renderFavourites: function(arrFavs){
    	var self = this,
    		html= '';
    	for(var i=0;i<arrFavs.length;i++){
    		html += arrFavs[i] + '<br/>'
    		
    	}
    	self.$favourites.find('div.menu_inner').html(html);
    	self.$favourites.find('.add_favourite').addClass('selected');
    	self.myScrollFavs.refresh();
    	
    	// attach click event to each stored favourite
    	self.$favourites.find('div.favourite_wrapper').click(function(){
    		var key = $(this).find('li.selected_region').attr('data-key');
    		key = key.replace('fav_', '');
    		var arr = key.split('_');
    		var oru = arr[0];
    		var mru = arr[1];
    		var arrTemp = [];
    		for(var i=2;i<arr.length;i++){
    			arrTemp.push(arr[i]);
    		}
    		var region = arrTemp.join('_');
    		app.current_oru = oru;
    		app.current_mru = mru;
    		
    		$('.oru-button').removeClass('selected');
    		$('.oru-button[data-value='+app.current_oru+']').addClass('selected');
    		$('#current_filter').html(app.current_mru);
    		$('div[data-value='+app.current_mru+'].cbxoverlay').addClass('checked'); 
    		////debugger;
            app.getWorldmapData(app.current_oru, app.current_mru, function(err, data){
                worldmap.mapVariation = 'lives_improved';
                worldmap.mapData = data;
              
                worldmap.init(app.window.width, app.window.height);  
                ////debugger;
    			var regionData = $.grep(worldmap.mapData, function (obj, index) {
    				// Found when map.regions.key is in the regionData.code array
    				return obj.guid.toUpperCase() == region.toUpperCase();
    			})[0];                
                if(regionData){
                	var code = regionData.code[0];
                	
                	if(code.length == 1) code = regionData.code;
                	
					worldmap.handleRegionMouseOver(null, code);
					worldmap.showCountryDetails(null, null, code);	
					app.$showmenu.click();
					app.$bottomcarousel.iosSlider('goToSlide', 1);					
                }
    			/*if ($.inArray(code, worldmap.mapData[i].code) > -1 || self.mapData[i].code === code) {
    				////debugger;
    				self.map.setSelectedRegions(self.getMapCodes(self.mapData[i].code));
    				break;
    			} */               
                //
               ////debugger;
            });   
    	});
    	//self.$favourites.    	
    },
    checkFavouriteSelected: function(){
    	var key = app.$currentfilter.find('li.selected_region').attr('data-key');
    	var $favs = $('#favourites');
    	$favs.find('.ulfavourite').removeClass('selected');
    	if($favs.find('li.selected_region[data-key="'+key+'"]').length > 0){
    		
    		$favs.find('li.selected_region[data-key="'+key+'"]').parent().addClass('selected');
    		app.$currentfilter.parent().find('div.add_favourite').addClass('selected');
    	}
    },
    renderFavouritePanel: function(regionData){
    	var key = 'fav_' +app.current_oru+'_'+app.current_mru+'_'+regionData.guid,
    		groupedBy = $('div.oru-button.selected').html(),
    		filterdBy = $('#current_filter').html();
    	////debugger;
    	app.$currentfilter.parent().find('div.add_favourite').removeClass('selected');
    	
    	app.$currentfilter.html('');
    	app.$currentfilter.append('<li class="selected_region" data-key="'+key+'" data-guid="'+regionData.guid+'">'+regionData.name+'</li>');
    	app.$currentfilter.append('<li>Grouped by '+groupedBy+'</li>');
    	app.$currentfilter.append('<li>Filtered by '+filterdBy+'</li>');
    	app.checkFavouriteSelected();
    }
};
function applyFilter(){}