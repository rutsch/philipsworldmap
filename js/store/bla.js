/*
 * {
	"philips_world": { "l": 482, "p": 477, "g": 1681},
	"PD0200_world": { "l": 530, "p": 441, "g": 850},
	"BS6911_world": { "l": 272, "p": 103, "g": 3721},
	"BS9042_world": { "l": 140, "p": 116, "g": 2423},
	"BS9044_world": { "l": 450, "p": 49, "g": 2299},
	"BS9050_world": { "l": 517, "p": 211, "g": 3449},
	"BS9051_world": { "l": 326, "p": 389, "g": 4746}
}
 * 
 */

var objInput = {
		"philips_world": { "l": 482, "p": 477, "g": 1681},
		"PD0200_world": { "l": 530, "p": 441, "g": 850},
		"BS6911_world": { "l": 272, "p": 103, "g": 3721},
		"BS9042_world": { "l": 140, "p": 116, "g": 2423},
		"BS9044_world": { "l": 450, "p": 49, "g": 2299},
		"BS9050_world": { "l": 517, "p": 211, "g": 3449},
		"BS9051_world": { "l": 326, "p": 389, "g": 4746}
	};
objInput = JSON.parse(objInput);
var counter=0;
var arrKeys=[];

for(var key in objInput){
	arrKeys.push(key)
}

function insertDatabase(key){
	this.db.transaction(
        function(tx) {
        	var obj = objInput[key],
    		date_start = '01-01-2012',
    		date_end = '31-12-2012',
    		guid = key + '_' + date_start + '_' + date_end;

        	var sqlUpdate = "UPDATE snapshot SET lives_improved=?, population=?, gdp=? WHERE guid=?";
        	var arrUpdate = [obj.lives_improved, obj.population, obj.gdp, guid];
            var sqlInsert = "INSERT INTO snapshot (guid, key, date_from, date_to, lives_improved, population, gdp) " +
							"VALUES(?, ?, ?, ?, ?, ?, ?)";        	
            var arrInsert = [guid, key, date_start, date_end, obj.lives_improved, obj.population, obj.gdp];
        	
        	var sqlTest = "SELECT COUNT(*) FROM snapshot where guid=?";
        	tx.executeSql(sql, [guid], function(tx, result){
        		var intCount=result.rows.item(0);
        		var sql = (intCount == 0) ? sqlInsert : sqlUpdate;
        		var arrInput = (intCount == 0) ? arrInsert : arrUpdate;
        		tx.executeSql(sql, arrInput, insertSuccess);
        	}
        },
        function(error) {
        	alert("Transaction Error: " + error.message);
        	callback();
        }
	);	
}

function insertSuccess() {
	//console.log(cnt + ' updated');
    counter++;   
    if(counter == arrKeys.length){
    	//stop
    	console.log("all inserted or updated");
    	callback();
    }else{
    	var nextKey=arrKeys[counter];
    	insertDatabase(nextKey)
    }
}


insertDatabase(arrKeys[0]);