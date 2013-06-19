var WebSqlStore = function(successCallback, errorCallback) {
	var _objInput;
	var counter=0;
	var arrKeys=[];
	var _tx;
	var _callback;
	
    this.initializeDatabase = function(successCallback, errorCallback) {
        var self = this;
        this.db = window.openDatabase("PhilipsWorldMapLivesImproved", "1.0", "Philips Worldmap Application Database", 20000000);
        this.db.transaction(
                function(tx) {
                    self.createSnapshotTable(tx);
                },
                function(error) {
                    console.log('Transaction error: ' + error);
                    if (errorCallback) errorCallback();
                },
                function() {
                    console.log('Transaction success');
                    if (successCallback) successCallback();
                }
        )
    }

    this.createSnapshotTable = function(tx) {
    	var self = this;
        var sql = "CREATE TABLE IF NOT EXISTS snapshotstest ( " +
            "guid VARCHAR(300) PRIMARY KEY, " +
            "key VARCHAR(50), " +
            "date_from DATE, " +
            "date_to DATE, " +
            "lives_improved INT, " +
            "population INT, " +
            "gdp INT)";
        tx.executeSql(sql, null,
                function() {
                    console.log('Create table success');
                },
                function(tx, error) {
                    alert('Create table error: ' + error.message);
                });
    }
    
    this.test = function(objInput, callback){
    	var self = this;
    	_callback = callback;
    	_objInput = objInput;
    	//objInput = JSON.parse(objInput);


    	for(var key in objInput){
    		arrKeys.push(key)
    	}    	
    	this.db.transaction(
            function(tx) {
            	_tx = tx;
            	self.insertDatabase(arrKeys[0]);
            },
            function(error) {
            	alert("Transaction Error: " + error.message);
            	//callback();
            });
    	
    }
    
    this.insertDatabase = function(key){
    	var self = this;

    	var obj = _objInput[key],
		date_start = '01-01-2012',
		date_end = '31-12-2012',
		guid = key + '_' + date_start + '_' + date_end;

    	var sqlUpdate = "UPDATE snapshotstest SET lives_improved=?, population=?, gdp=? WHERE guid=?";
    	var arrUpdate = [obj.l, obj.p, obj.g, guid];
        var sqlInsert = "INSERT INTO snapshotstest (guid, key, date_from, date_to, lives_improved, population, gdp) " +
						"VALUES(?, ?, ?, ?, ?, ?, ?)";        	
        var arrInsert = [guid, key, date_start, date_end, obj.l, obj.p, obj.g];
    	
    	var sqlTest = "SELECT COUNT(*) as cnt FROM snapshotstest where guid=?";
    	
    	_tx.executeSql(sqlTest, [guid], function(tx, result){
    		var intCount=result.rows.item(0).cnt;
    		var sql = (intCount == 0) ? sqlInsert : sqlUpdate;
    		var arrInput = (intCount == 0) ? arrInsert : arrUpdate;
    		_tx.executeSql(sql, arrInput, function() {
    			if(counter%500 == 0){
    				console.log(counter);
    			}
    	    	
    	        counter++;   
    	        if(counter == arrKeys.length){
    	        	//stop
    	        	console.log("all inserted or updated");
    	        	_callback();
    	        }else{
    	        	var nextKey=arrKeys[counter];
    	        	self.insertDatabase(nextKey);
    	        }
    	    });
    	});


    }
   
    
    
    
    this.clearCache = function(callback){
        this.db.transaction(
            function(tx) {
                var sql = "DELETE FROM snapshot";
                tx.executeSql(sql, [], function(tx, results) {
                    callback();
                });
            },
            function(error) {
                alert("Transaction Error: " + error.message);
            }
        );
    }
   
    this.findByName = function(searchKey, callback) {
        this.db.transaction(
            function(tx) {

                var sql = "SELECT e.id, e.firstName, e.lastName, e.title, count(r.id) reportCount " +
                    "FROM employee e LEFT JOIN employee r ON r.managerId = e.id " +
                    "WHERE e.firstName || ' ' || e.lastName LIKE ? " +
                    "GROUP BY e.id ORDER BY e.lastName, e.firstName";

                tx.executeSql(sql, ['%' + searchKey + '%'], function(tx, results) {
                    var len = results.rows.length,
                        employees = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        employees[i] = results.rows.item(i);
                    }
                    callback(employees);
                });
            },
            function(error) {
                alert("Transaction Error: " + error.message);
            }
        );
    };

    this.findCacheKey = function(key, callback) {
        this.db.transaction(
            function(tx) {

                var sql = "SELECT value " +
                    "FROM cache " +
                    "WHERE cachekey = ?";

                tx.executeSql(sql, [key], function(tx, results) {
                    callback(results);
                });
            },
            function(error) {
                alert("Transaction Error: " + error.message);
            }
        );
    };

    this.setSnapshotData = function(objInput, callback) {

        this.db.transaction(
            function(tx) {
            	
                var sql = "UPDATE snapshotstest SET lives_improved=?, population=?, gdp=? WHERE guid=?";
                
                      
                var total = size(objInput),
                	cnt = 0;
                for (var key in objInput) {
                	var obj = objInput[key],
                		date_start = '01-01-2012',
                		date_end = '31-12-2012',
                		guid = key + '_' + date_start + '_' + date_end;
                    tx.executeSql(sql, [guid, obj.l, obj.p, obj.g], 
                    	function(tx, results) {
                    		//console.log(cnt + ' updated');
	            			if(cnt%500 == 0){
	            				console.log(cnt);
	            			}                    	
	                        cnt++;
	                        if(cnt == total){
	                        	console.log("all inserted or updated");
	                        	callback();
	                        }
	                    }
	                    , function(error){
	                    	var sql = "INSERT INTO snapshotstest (guid, key, date_from, date_to, lives_improved, population, gdp) " +
	            			"VALUES(?, ?, ?, ?, ?, ?, ?)";
	              	
	                        tx.executeSql(sql, [guid, key, date_start, date_end, obj.lives_improved, obj.population, obj.gdp], function(tx, results) {
	                        	//console.log(cnt + ' inserted');
		            			if(cnt%500 == 0){
		            				console.log(cnt);
		            			}        	                        	
	                            cnt++;
	                            if(cnt == total){      	    
	                            	console.log("all inserted or updated");
	                            	callback();
	                            }
	                        });                    	
	                    }
                    );
                }
                

            },
            function(error) {
            	alert("Transaction Error: " + error.message);
            	callback();
            }
        );
    };
    
    this.setSnapshotRow = function( callback) {

        this.db.transaction(
            function(tx) {

                var sql = "INSERT INTO snapshot (guid, date_from, date_to, lives_improved, population, gdp) VALUES('dsfsd', '01-01-2013', '31-12-2013', 15, 18, 2568),('dsfsd', '01-01-2013', '31-12-2013', 15, 18, 2568)";

                

                tx.executeSql(sql, [], function(tx, results) {
                    callback();
                });
            },
            function(error) {
                alert("Transaction Error: " + error.message);
            }
        );
    };
    this.initializeDatabase(successCallback, errorCallback);

}
function size(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};