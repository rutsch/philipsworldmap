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
    current_oru: 3, // 1, 2, 3 or 4
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
        self.sql = new WebSqlStore();
        
        if ("ontouchend" in document){
            include('cordova-2.7.0.js', function() {
            	self.startApp();
            });        	
        }
        else{
        	self.startApp();
        }    	
    },
    startApp: function(){
    	var self = this;
    	
    	// parallel async
    	async.parallel({
    		snapshotJson: function(callback){
    			self.getSnapShotData(function(err, data){
    				if(err) callback(err);
    				callback(null, data);
    			});
    	    },
    		// load bookmarks from storage
    	    bookmarksHtmlArray: function(callback){
    	        setTimeout(function(){
    	            callback(null, 1);
    	        }, 200);
    	    },
    	    // load mru html for latest snapshot id
    	    mruHtml: function(callback){
    	        setTimeout(function(){
    	            callback(null, 2);
    	        }, 100);
    	    },
    	    // load oru json for latest snapshot id
    	    oruJson: function(callback){
    	        setTimeout(function(){
    	            callback(null, 2);
    	        }, 100);
    	    },
    	    // get translations js
    	    translationsJs: function(callback){
    	        setTimeout(function(){
    	            callback(null, 1);
    	        }, 200);
    	    }
    	 
    	},
    	// all done
    	function(err, results) {
    		// prepare html for the app (mru filter, bookmarks panel etc)
    		// load worldmap in initial state    
    		var start = new Date().getTime();
    		//self.sql.setSnapshotData(results.snapshotJson, function(){
    		self.sql.test(results.snapshotJson, function(){
    			console.log('insert data done');
    			var end = new Date().getTime();
    			var time = end - start;
    			console.log('Execution time: ' + time);
    		})
    	});    		
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
    },    
};
function include(script, callback) {
    var e = document.createElement('script');
    e.onload = callback;
    e.src = script;
    e.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(e);
}
function applyFilter(){
	
}