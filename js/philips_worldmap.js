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
    online: true,
    signedin: false,    
    current_oru: 3, // 1, 2, 3 or 4
    current_mru: 'philips',
    mapdata: {},
    window: {
    	width: 0,
    	height: 0,
    	optionswidth: '0px'
    },
    currentsnapshotid: '2013-01-01',
    orudata: {},
    snapshotdata: {},
    snapshothistory: {},
    //JT: shouldn't we do something like objPageElements (in AR) and fill this object onload with very specific selectors?
    $body: $('body'),
    $page: $('#home'),
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
        self.sql = new WebSqlStore();
        
        if ("ontouchend" in document){
            include('cordova-2.7.0.js', function() {
            	self.bindEvents();
            });        	
        }
        else{
        	self.bindEvents();
        }    	
    },
    bindEvents: function(){
    	var self = this;
        // Check if we're running on PhoneGap (cordova)
        if (window.cordova) {
            // PhoneGap
            document.addEventListener("load", self.onLoad, false);
			document.addEventListener("deviceready", self.startApp, false);
			document.addEventListener("offline", self.onOffline, false);
			document.addEventListener("online", self.onOnline, false);
		} else {
		    // Regular browser
		    // Assume browser is online
		    self.online = true;
			self.startApp();                                                                    
		}
        $(window).bind('resize', self.onResize);
        // removed the onclick from the button because the button itself is copied when a favourite is stored.
        // we therefore need the exact clicked element for the code to run and passing (this) in onclick does not work on ios
        app.$body.on('click', 'div.add_favourite', function(e){
        	//debugger;
        	e.preventDefault();
        	e.stopPropagation();
        	app.addFavourite($(e.currentTarget));
        });
        
        // Swipe events
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
        		bottom: "-250px"
        	}, 300, function(){
        		//app.menuStatus = "0px"
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
    onResize: function(){
    	var self =this;
    	app.sizeElements();
    	app.initWorldMap(worldmap.mapData);
    },
    startApp: function(){
    	var self = this;
    	/* Init plugins */
    	app.store = new LocalStorageStore();
    	app.store.clearCache(function(){
    		
    	});
        app.myScroll = new iScroll('menu', {lockDirection: true }); 
        app.myScrollFavs = new iScroll('favourites', {lockDirection: true });
     

    	// parallel async
    	async.parallel({
    		// load everything needed to start rendering all html parts
    		// load bookmarks from storage
    	    bookmarksHtmlArray: function(callback){
    			app.getBookmarksData(function(err, data){
    				//if(err) callback(err);
    				callback(null, data);
    			});
    	    },
    	    // load mru HTML for latest snapshot id
    	    mruHtml: function(callback){
    			app.getMruData(function(err, data){
    				//if(err) callback(err);
    				callback(null, data);
    			});
    	    },
    	    // load mru HTML for latest snapshot id
    	    oruJson: function(callback){
    			app.getOruData(function(err, data){
    				//if(err) callback(err);
    				callback(null, data);
    			});
    	    },
    	    // get translations js
    	    /*translationsJs: function(callback){
    			app.getTranslationsData(function(err, data){
    				//if(err) callback(err);
    				console.log(data);
    				callback(null, data);
    			});
    	    },*/
    	    snapshotConfig: function(callback){
    	    	app.getSnapshotConfig(function(err, data){
    	    		callback(null, data);
    	    	});
    	    }
    	},
    	// all done
    	function(err, results) {
    		if(err) self.handleAppError(err);
    		// prepare html for the app (mru filter, bookmarks panel etc)
    		app.snapshotconfig = results.snapshotConfig;
    		//app.appendTranslationsJS(results.translationsJs);
    		app.renderProductTreeTemp(results.mruHtml);
        	var selector = 'li#philips';//'li#philips >ul > li';
        	app.renderSelectList(selector, false);    		
        	app.renderBookmarksHtml(results.bookmarksHtmlArray);
        	app.orudata = results.oruJson;
    		// size all elements
        	app.sizeElements();
    		// load worldmap in initial state    
        	app.getWorldmapData(app.current_oru, app.current_mru, function(err, data){
    			if(err) app.handleAppError(err);
    			//console.log(data);
    			app.initWorldMap(data); 
    		});
    	});    		
    },
    /* Data functions */
    getSnapshotConfig: function(cb){
    	var self = this;
    	var objData = {
            type: 'json'
        };
    	var objRequest = $.ajax({
            type: "POST",
            url: config.general.auth_1_url,
            dataType: 'jsonp',
            data: objData,
            cache: false,
            timeout: 40000
        });    
    	objRequest.done(function (response) {

    		cb(response.snapshotconfig);
                  		
    	});
        objRequest.fail(function (objRequestStatus) {

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
        }); 
    },
    getBookmarksData: function(cb){
    	var self = this;
    	app.store.findFavourites(function(result){
    		cb(null, result);
    	});                    	
    },
    getMruData: function(cb){
        // Check localstorage first 
        app.store.findCacheKey('mru_tree', function(result){
            
            if(result){
            	
                cb(null, result);
            }else{
                // if not found in cache
                if(app.online){
                	var objData = {};
                    var objRequest = $.ajax({
                        type: "GET",
                        url: config.general.mru_url,
                        dataType: 'jsonp',
                        data: objData,
                        cache: false,
                        timeout: 40000
                    });

                    objRequest.done(function (response) {
                    	//debugger;
                        app.store.setCacheKey('mru_tree', response.html, function(){
                            cb(null, response.html);
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
                    cb(null, '');
                }
   
            }
        });    	 
    },
    getOruData: function(cb){
        // Check localstorage first 
        app.store.findCacheKey('oru_tree', function(result){
            
            if(result){
            	
                cb(null, JSON.parse(result));
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
                            cb(null, response);
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
                    cb(null, {});
                }
   
            }
        });    	    	
    },
    getTranslationsData: function(cb){
        // Check localstorage first 
        /*app.store.findCacheKey('arr_translations', function(result){
            
            if(result){
            	console.log('translations from cache');
                cb(null, result);
            }else{
                // if not found in cache
            	console.log('translations not in cache');
                if(app.online){
                	console.log('app online');
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
                            cb(null, response);
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
                    cb(null, '');
                }
            }
        }); */
    	
    	
    	cb(null, arrTranslations);
    },
    getSnapshotData: function(oru, mru, cb){
    	console.log('getting worldmap data');
    	var objData = {
    		oru: oru,
    		mru: mru,
    		token: app.token,
    		type: 'json',
    		snapshotid: 1
    	};         
    	var key = app.currentsnapshotid+'_'+oru+'_'+mru;
    	app.store.findCacheKey(key, function(result){
            if(result){
            	console.log('serving cached data');
                cb(null, JSON.parse(result));
                
            }else{
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
                	//console.log(response);
                    app.store.setCacheKey(key, JSON.stringify(response), function(){
                        
                    });                	
                    cb(null, response);
                });

                objRequest.fail(function (objRequestStatus) {
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
                });               	
            }
        });
    },
    // Get data for worldmap (if present in localstorage then serve that, else do ajax call)
    getWorldmapData: function(oru, mru, cb){
    	var self = this;
    	app.getSnapshotData(oru, mru, function(err, result){
    		//console.log(result.arrRegions);
    		app.snapshotdata = result.snapshotdata;
            // get countries from oru json based on passed oru level
        	//var result = jF('*[guid=dach]', app.orudata).get();

        	var arrRegions = [];

            //colors to be defined in config.js? or maybe even in base_configuration.xml on the server (that might avoid the need to publish the app each time tis changes...)
        	var colors = {
        		'emea': {
        			low: '#99EAF0',
        			middle: '#5BCCD4',
        			high: '#30B6BF'
        		},
        		'asia': {
        			low: '#BE67E9',
        			middle: '#A359C8',
        			high: '#8737B0'    			
        		},
        		'north_america': {
        			low: '#7DABF1',
        			middle: '#5C95EA',
        			high: '#3D7FDF'    			
        		},
        		'north america_bmc': {
        			low: '#7DABF1',
        			middle: '#5C95EA',
        			high: '#3D7FDF'    			
        		},    		
        		'latam': {
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
    			//console.log(arrRegions);
    			////debugger;
    			cb(null, arrRegions);
    		//}   	

    		
    	});

    },    
    /* Click functions */
    menuButtonClick: function(js){
    	//alert(app.menuStatus);
        if(app.menuStatus == 'closed'){
        	//JT: selector should be made generic (and more specific) to improve performance
            app.$worldmappage.css({
        		marginLeft: "-" + app.window.optionswidth
            });
            app.menuStatus = 'open'
            return false;
    	} else {
			app.$worldmappage.css({
				marginLeft: "0px",
			});
			app.menuStatus = 'closed'
			return false;
        }
    }, 
    btnSignInClick: function(){
    	// do the actual signin
    	var un, pw;
    	un = $('#un').val();
    	pw = $('#pw').val();

        //call1 - get a session
        var objData = {
            type: 'json'
        };        
        var objRequest = $.ajax({
            type: "GET",
            url: config.general.auth_1_url,
            dataType: 'jsonp',
            data: objData,
            cache: false,
            timeout: 40000
        });

        objRequest.done(function (response) {
        	
            //call2 - get snapshot config data
            var objDataNested = {
                type: 'json',
                stay: 'true'
            }; 
            var objRequestNested = $.ajax({
                type: "GET",
                url: config.general.auth_1_url,
                dataType: 'jsonp',
                data: objDataNested,
                cache: false,
                timeout: 40000
            });    
        	objRequestNested.done(function (response) {
        		app.token = response.token;
            	
                //call3 - get token
                var objDataNestedNested = {
                    type: 'json',
                    method: 'generatejsvarsjson'
                }; 
                var objRequestNestedNested = $.ajax({
                    type: "GET",
                    url: config.general.auth_2_url,
                    dataType: 'jsonp',
                    data: objDataNestedNested,
                    cache: false,
                    timeout: 40000
                });   
                objRequestNestedNested.done(function(response){
                    app.token = response.token;

                    //call4 - perform authentication with the token we just retrieved
                    var objDataAuthenticate = {
                        username: un,
                        password: pw,
                        url: '/index.aspx',
                        token: response.token,
                        type: 'json'
                    }; 
                    console.log('before sending authentication request');
                    var objAjax={
                        type: "POST",
                        url: config.general.auth_3_url,
                        dataType: 'json',
                        data: objDataAuthenticate,
                        cache: false,
                        timeout: 40000                      
                    }
                    
                    //this is not required when it's running the the app
                    if (!window.cordova){
                        objAjax.xhrFields={withCredentials: true};
                        objAjax.crossDomain=true;
                        objDataAuthenticate.fulldomain=location.protocol+"//"+location.hostname;                      
                    }

                    var objRequestAuthenticate = $.ajax(objAjax);
                    objRequestAuthenticate.done(function (response) {
                        //alert(JSON.stringify(response));
                        app.token = response.token;
                        
                        //when successfull
                        app.signedin = true;
                        app.$signin.hide();
                        app.$signedin.show();
                        app.$orubuttons.removeClass('disabled');
                        app.renderSelectList('li#philips', false);
                        app.closeLoginScreen();                 
                    });
                    objRequestAuthenticate.fail(function (objRequestStatus) {
                        var strErrorMessage;
                        switch (objRequestStatus.status) {
                            case 0:
                                //timeout
                                strErrorMessage = 'Timeout has occurred while retrieving: ' + config.general.auth_3_url;
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
                        console.log('authentication failed - '+strErrorMessage);
                        console.log(objRequestStatus);
                    });  

                })
                
                //call3 - failed
                objRequestNestedNested.fail(function(objRequestStatus){
                    var strErrorMessage;
                    switch (objRequestStatus.status) {
                        case 0:
                            //timeout
                            strErrorMessage = 'Timeout has occurred while retrieving: ' + config.general.auth_2_url;
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
                })





        	});

            //call2 - failed
            objRequestNested.fail(function (objRequestStatus) {
                var strErrorMessage;
                switch (objRequestStatus.status) {
                    case 0:
                        //timeout
                        strErrorMessage = 'Timeout has occurred while retrieving: ' + config.general.auth_1_url;
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
            });         	
      	
            
        });
        
        //call1 - failed
        objRequest.fail(function (objRequestStatus) {
            var strErrorMessage;
            switch (objRequestStatus.status) {
                case 0:
                    //timeout
                    strErrorMessage = 'Timeout has occurred while retrieving: ' + config.general.auth_1_url;
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
        });    

    }, 
    btnOpenSignInClick: function(){
    	
    	app.showLoginScreen();
    }, 
    signOut: function(){
    	app.signedin = false;
		app.$signin.show();
		app.$signedin.hide();
		app.$orubtnright.addClass('disabled');
		app.renderSelectList('li#philips', false);    	
    },
    oruSelected: function(el){ 
    	
    	var $el = $(el);
    	if(!$el.hasClass('disabled')){
        	app.$body.toggleClass('loading');    	
        	$el.parent().find('div').removeClass('selected');
        	$el.addClass('selected');
        	app.current_oru = $el.attr('data-value');

            app.getWorldmapData(app.current_oru, app.current_mru, function(err, data){
            	worldmap.map.remove();
                worldmap.mapVariation = 'lives_improved';
                worldmap.mapData = data;
              
                worldmap.init(app.window.width, app.window.height);  
                app.$body.toggleClass('loading');
            });       		
    	}else{
    		alert('Please sign in.')
    	}
 	
    },
    mruSelected: function(el){
    	app.$body.toggleClass('loading');
    	var $spancurrentfilter = app.$producttree.find('span#current_filter'),
    		$arrselect = app.$producttree.find('.cbxoverlay');
    	//alert(id);	
		var elClicked = $(el);// $el.parent('li').find('input');
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
        	worldmap.map.remove();
            worldmap.mapVariation = 'lives_improved';
            worldmap.mapData = data;
          
            worldmap.init(app.window.width, app.window.height);  
            app.$body.toggleClass('loading');
        });    	        
    },    
    /* HTML functions */
    appendTranslationsJS: function(js){
    	var self = this;
    	self.$body.append('<script type="text/javascript">'+js+'</script>');
    },
    renderProductTreeTemp: function(html){
    	var self= this;
    	self.$producttreetemp.html(html);
    },
    renderBookmarksHtml: function(arrFavs){
    	var self = this,
			html= '';
    	
		for(var i=0;i<arrFavs.length;i++){
			html += arrFavs[i] + '<br/>'
		}
		
		self.$favourites.find('div.menu_inner').html(html);
		self.$favourites.find('.add_favourite').addClass('selected');
		self.myScrollFavs.refresh();
		
		// attach click event to each stored favourite
		self.$favourites.find('div.favourite_wrapper li').click(function(){
			app.$body.toggleClass('loading');
			var key = $(this).parent().find('li.selected_region').attr('data-key');
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
	        self.getWorldmapData(app.current_oru, app.current_mru, function(err, data){
	        	self.initWorldMap(data);
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
					app.$body.toggleClass('loading');
                }	        	
	        });   
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
    	var cls = app.signedin ? '' : 'disabled';
    	$.each($(selector), function(index, el){
    		var $el = $(el),
    			id = $el.attr('id'),
    			name = $el.find('div').html();
    		
    		if(app.$producttreetemp.find('li[id="'+id+'"]').find('ul').length > 0){
    			app.$producttree.append('<li data-id="'+id+'" data-inverse="true"><div data-value="'+id+'" class="cbxoverlay" onclick="app.mruSelected(this);"></div><div class="li_name">'+name+'</div><div class="li_shownext '+cls+'" onclick="app.showNextLevel(\''+id+'\');"></div></li>');	
    		}else{
    			app.$producttree.append('<li data-id="'+id+'" data-icon="false"><div data-value="'+id+'" class="cbxoverlay" onclick="app.mruSelected(this);"></div><div class="li_name">'+name+'</div></li>');
    		}
    	});      

    	$('div[data-value='+app.current_mru+'].cbxoverlay').addClass('checked');    
    	
        var event = "ontouchend" in document ? 'tap' : 'click';     
        
    	self.myScroll.refresh(); 
    },
    renderFavouritePanel: function(regionData){
    	var self = this;
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
        app.$bottomcarousel.iosSlider('destroy');
		app.$bottomcarousel.iosSlider({
			snapToChildren: true,
            scrollbar: false,
    		navSlideSelector: '.slideSelectors .item',
    		onSlideChange: self.slideChange,                
            desktopClickDrag: true,
            keyboardControls: true,
            responsiveSlideContainer: true,
            responsiveSlides: true,
            onSliderResize: app.resizeSlider
		}); 
		    	
    } ,   
    sizeElements: function(){
    	var self = this;
    	app.window.height = $(window).height();
    	app.window.width = $(window).width();   
        //alert('width: ' + app.window.width + ' height: ' + app.window.height);
        var temp = self.window.width - ($("a.showMenu").width() + 20);
        app.window.intoptionswidth = temp > 400 ? 400 : temp;
        app.window.optionswidth = app.window.intoptionswidth + 'px';
        
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
        app.menuStatus = 'closed';

        app.myScroll.refresh();
        app.myScrollFavs.refresh();
        
        app.$bottomcarousel.iosSlider('destroy');
		app.$bottomcarousel.iosSlider({
			snapToChildren: true,
            scrollbar: false,
    		navSlideSelector: '.slideSelectors .item',
    		onSlideChange: self.slideChange,                
            desktopClickDrag: true,
            keyboardControls: true,
            responsiveSlideContainer: true,
            responsiveSlides: true,
            onSliderResize: app.resizeSlider
		}); 
		
        app.$slideselectors.css({
    		left: (app.window.width / 2) - 30
    	});

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
           
        app.menuStatus = 'closed';    	
    },
    /* helper functions */
	slideChange: function(args) {
		var self = this;
		//JT: elements need to be found "onload"	
		app.$slideselectors.find('.item').removeClass('selected');
		app.$slideselectors.find('.item:eq(' + (args.currentSlideNumber - 1) + ')').addClass('selected');

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
    showNextLevel: function(clicked_id){
    	var self = this,
    		selector = 'li#'+clicked_id+ ' >ul > li';
    	if(!app.$menu.find('li[data-id="'+clicked_id+'"]').find('div.li_shownext').hasClass('disabled')){
    		
    		self.renderSelectList(selector, true);
    	}else{
    		alert('Please sign in.')
    	}
    	
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
    showLoginScreen: function(){
    	var $loginScreen = $('#popupLogin');
    	$loginScreen.css({
    		display: 'block',
    		opacity: 1
    	});
    	app.$page.css({
    		opacity: 0.2
    	});
    },
    closeLoginScreen: function(){
    	var $loginScreen = $('#popupLogin');
    	$loginScreen.css({
    		display: 'none',
    		opacity: 0
    	});
    	app.$page.css({
    		opacity: 1
    	});
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
    addFavourite: function($el){

    	var self= this;
    	//var $el = app.$btnaddfavourite;
        //console.log('in addFavourite - '+$el);
    	//debugger;
    	if($el.hasClass('selected')){
    		var key = $el.parent('div').find('ul li.selected_region').attr('data-key');
    		$el.removeClass('selected');
    		app.removeFavourite(key, function(){
            	app.arrfavourites = app.store.findFavourites(function(result){

            		app.renderBookmarksHtml(result);
            	});         			
    		});
    		

    	}else{
        	$el.addClass('selected');
        	var selected_region = $('#current_favourite li.selected_region').attr('data-guid');
        	var key = app.current_oru+'_'+app.current_mru+'_'+selected_region; 	
        	key = 'fav_' + key;
        	var value = $('#current_favourite').html();
        	
            app.store.setCacheKey(key, value, function(){
            	app.arrfavourites = app.store.findFavourites(function(result){
            		
            		app.renderBookmarksHtml(result);
            	});                
            });      		
    	}
  	
    },
    removeFavourite: function(key, cb){
        app.store.removeCacheKey(key, function(){
        	$('li[data-key='+key+']').parent().parent().find('div.add_favourite').removeClass('selected');
        	cb();
        });       
    },    
    /* Worldmap functions */
    initWorldMap: function(data){
    	var self = this;
    	worldmap.mapVariation = 'lives_improved';
        worldmap.mapData = data;
        
        worldmap.init(self.window.width, self.window.height);  	
        app.$menu.css({
        	display: 'block'
        });
        app.$favourites.css({
        	display: 'block'
        });
        app.$body.click().click().click();
        if (window.cordova) window.cordova.exec(null, null, "SplashScreen", "hide", []);
        

    },
    /* Error handling */
    handleAppError: function(err){
    	alert(err);
    }
};
/* Click functions */



/* Helper functions */
function include(script, callback) {
    var e = document.createElement('script');
    e.onload = callback;
    e.src = script;
    e.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(e);
}
function applyFilter(){
	
}