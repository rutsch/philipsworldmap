var LocalStorageStore = function(successCallback, errorCallback) {
    var store = window.localStorage;
    
    this.setCacheKey = function(key, value, callback) {
        store.setItem(key, value);
        callLater(callback, 'success');
    }
    this.findCacheKey = function(key, callback) {
        callLater(callback, store.getItem(key));
    }
    this.getUserSettings = function(callback){
        callLater(callback, store.getItem('usersettings'));
    }
    this.clearCache = function(callback){
        for (var i = 0; i < store.length; i++){
            var key = localStorage.key(i);
            if(key !== 'usersettings'){
                store.removeItem(key);                
            }
        }       
        callLater(callback);    
    }
    
    
    // Used to simulate async calls. This is done to provide a consistent interface with stores (like WebSqlStore)
    // that use async data access APIs
    var callLater = function(callback, data) {
        if (callback) {
            setTimeout(function() {
                callback(data);
            });
        }
    }


    callLater(successCallback);

}