var WebSqlStore = function(successCallback, errorCallback) {

    this.initializeDatabase = function(successCallback, errorCallback) {
        var self = this;
        this.db = window.openDatabase("PhilipsWorldMap", "1.0", "Philips Worldmap Application Database", 20000000);
        this.db.transaction(
                function(tx) {
                    self.createSnapshotTable(tx);
                    self.createSettingsTable(tx);
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
        var sql = "CREATE TABLE IF NOT EXISTS snapshot ( " +
            "key VARCHAR(250), " +
            "population INT, " +
            "gdp INT, " +
            "lives_improved INT)";
        tx.executeSql(sql, null,
                function() {
                    console.log('Create table success');
                },
                function(tx, error) {
                    alert('Create table error: ' + error.message);
                });
    }
    
    this.createSettingsTable = function(tx) {
        var sql = "CREATE TABLE IF NOT EXISTS settings ( " +
            "settingkey VARCHAR(250) PRIMARY KEY, " +
            "value VARCHAR(1000000))";
        tx.executeSql(sql, null,
                function() {
                    console.log('Create table success');
                },
                function(tx, error) {
                    alert('Create table error: ' + error.message);
                });
    }    
    
    this.clearCache = function(callback){
        this.db.transaction(
            function(tx) {
                var sql = "DELETE FROM cache";
                tx.executeSql(sql, [], function(tx, results) {
                    callback();
                });
            },
            function(error) {
                alert("Transaction Error: " + error.message);
            }
        );
    }
    
    this.clearSettings = function(callback){
        this.db.transaction(
            function(tx) {
                var sql = "DELETE FROM settings";
                tx.executeSql(sql, function(tx, results) {
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
    
    this.getUserSettings = function(callback){
        this.db.transaction(
            function(tx) {

                var sql = "SELECT * " +
                    "FROM settings ";

                tx.executeSql(sql, [], function(tx, results) {
                    callback(results);
                });
            },
            function(error) {
                alert("Transaction Error: " + error.message);
            }
        );        
    };

    this.findCacheKey = function(key) {
        this.db.transaction(
            function(tx) {

                var sql = "SELECT value " +
                    "FROM snapshot " +
                    "WHERE key = ?";

                tx.executeSql(sql, [key], function(tx, results) {
                	//console.log(results);
                    return(results);
                });
            },
            function(error) {
                return("Transaction Error: " + error.message);
            }
        );
    };
    
    this.hasRecords = function(callback) {
        this.db.transaction(
            function(tx) {

                var sql = "SELECT count(*) as count " +
                    "FROM snapshot ";

                tx.executeSql(sql, [], function(tx, results) {
                	console.log(results);
                    callback(results);
                });
            },
            function(error) {
                alert("Transaction Error: " + error.message);
            }
        );
    };

    this.setCacheKey = function(key, population, gdp, lives_improved) {
        this.db.transaction(
            function(tx) {

                var sql = "INSERT INTO snapshot (key, population, gdp, lives_improved) " +
                    "VALUES(:key, :population, :gdp, :lives_improved)";

                tx.executeSql(sql, [key, population, gdp, lives_improved], function(tx, results) {
                    return results;
                });
            },
            function(error) {
                return '';
            }
        );
    };
    this.initializeDatabase(successCallback, errorCallback);

}
