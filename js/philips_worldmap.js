/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
			document.addEventListener("deviceready", this.onDeviceReady, false);
		} else {
			this.onDeviceReady(); //this is the browser
		}
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        // Open database
        app.openDatabase(function(){
            // Load initial page - Intro screen shown until first page loaded
            app.loadPage(config.general.homepage_id);           
        })

    },
    
    openDatabase: function(cb){
        app.store = new WebSqlStore(cb());
    },
    
    loadPage: function(pageId){
        app.getPageData(pageId, function(err, data){
            if(err){
                app.renderView(config.general.errorpage_id, err);
            }else{
                app.renderView(pageId, data);    
            }
        });
    },
    
    getPageData: function(pageId, cb){
        // Check localstorage first 
        
        // if not found in cache
        $.ajax({
            type: "POST",
            url: config.general.data_url,
            data: {
                pageId: pageId,
                dataType: 'json'
            }
        }).done(function( result ) {
            cb(null, result);
        }).fail(function(xhr, err){
            cb(err);
        });
    },
    
    rendeView: function(pageId, data){
        // Use HAML to render view with provided data, update correct div and hide all other app divs
        
    }    
};
