/*
* Philips AR Worldmap application
* 
* Developer:			Rutger Scheepens
* 
* App needs an array of objects with following format
* 		{
'name': 'Asean and Pacific',
'value_total_population': '600.2',
'value_total_gdp': '900.9',
'code': ['AU', 'ID', 'KR', 'MY', 'NZ', 'PH', 'PK', 'TH', 'VN'],    	// Array with one ore more ID's. ID's should match the ID's of the vector map
'categories': [														// Array with detailed data (total is being calculated in code)
{
'name': 'Healtcare',
'code': 'HC',
'value': '38'
},
{
'name': 'Lighting',
'code': 'LI',
'value': '156'
},				
{
'name': 'Consumer Lifestyle',
'code': 'CL',
'value': '35'
}
]				
}
* 
* 
*/
//jQuery.noConflict();

// code below requires the sample_data.js file included in the page as well file (will become the result of an ajax function)

var worldmap = {
	   $ : jQuery,
	// Variables
		mapName : 'world_mill_en',
		mapVariation : 'lives_improved', //determines the type of map we like to show (currently only 'lives_improved', 'our_company')
		mapBackGroundColor : '#fff',
		mapForeGroundColor : '#efeff4',
		regionHoverColor : '#135ed5', //'#0b5ed7',	
		regionHoverOpacity : 1,
		regionScaleColors : ['#cce0fe', '#a1c7fe', '#6fa9fd', '#10315a'],
		mapData : [],
		$mapPlaceholder : null,
		allowedModes : ['grouped', 'country'],
		mode : 'grouped', // grouped or country
		showModeSwitch : false,
		map: {},
		availableCountryCodes : [],

	// HTML Templates
		popupTemplate : '', //determined by the map variation
		categoryTemplate : '<div class="sector_details">' +
									'<div class="sector_value">[category_value]</div>' +
									'<div class="sector_name">[category_name]</div>' +
								'</div>',
		modeSelectorTemplate : '<div class="mode_selector_wrapper">[selectors]</div>',
	// Helper Functions	

	// Calculates the total for the given categories					
		getCategoriesTotal : function (categories) {
			var total = 0;
			$.each(categories, function (index, cat) {
				total += +cat.value;
			});
			return total;
		},

	// Overrides the region mouseover event (set 'selected' property for all regions in mapData[i].code array)						
		handleRegionMouseOver : function (e, code) {
		    var self = this;
			for (var i = 0; i < self.mapData.length; i++) {
				if ($.inArray(code, self.mapData[i].code) > -1) {
					//debugger;
					map.setSelectedRegions(self.getMapCodes(self.mapData[i].code));
					break;
				}
			}
		},

	//returns an array of country codes that exist in the definition of the maps object
		getMapCodes : function (dataArray) {
		    var self = this;
			//console.log(dataArray);
			var outputArray = [];
			//debugger;

			if (self.availableCountryCodes.length == 0) self.availableCountryCodes = self.getAvailableCountryCodes()

			for (var i = 0; i < dataArray.length; i++) {
				var countryCodeToFind = dataArray[i];
				for (var j = 0; j < self.availableCountryCodes.length; j++) {
					var currentCoutryCode = self.availableCountryCodes[j];
					if (currentCoutryCode == countryCodeToFind) outputArray.push(currentCoutryCode);
				}

			}
			return outputArray;
		},

		getAvailableCountryCodes : function () {
			var availableCountryCodes = [];
			for (region in map.regions) {
				availableCountryCodes.push(region);
			}
			return availableCountryCodes;
		},

	// NOT USED!! Idea is to use this to give some effect to the popup appearance						
	handleRegionSelected : function (e, code, isSelected, selectedRegions) {
		//$(map.regions[code]).fadeTo('slow', 0.5);
	},

	// Overrides the default country popup (renders html based on data from the countriesData object)				
		showCountryDetails : function (e, el, code) {
		    var self = this;
			// Helper function to render details for each category in the found region
			function getCategoryDetails(categories) {
				var arrTemp = [];
				var temp = categoryTemplate;
				$.each(categories, function (index, cat) {

					temp = temp.replace(/\[category_name]/g, cat.name)
														.replace(/\[category_value]/g, cat.value);
					arrTemp.push(temp);
				});
				return arrTemp.join('');
			}

			// Get data for requested region
			var regionData = null;
			$.each(self.mapData, function (index, obj) {
				if ($.inArray(code, obj.code) > -1) {
					regionData = obj;
					return false;
				}
			});


			if (regionData != null) {

				//fill the popup template with relevant data
				var regionHtml = popupTemplate;
				switch (this.mapVariation) {
					case 'lives_improved':
						regionHtml = regionHtml.replace(/\[country_name]/g, arrTranslations[regionData.name.toLowerCase()]);
						regionHtml = regionHtml.replace(/\[total_value]/g, format(self.getCategoriesTotal(regionData.categories)));
						//regionHtml = regionHtml.replace(/\[category_details]/g, getCategoryDetails(regionData.categories));
						regionHtml = regionHtml.replace(/\[population_total]/g, format(Math.round(regionData.value_total_population)));
						regionHtml = regionHtml.replace(/\[gdp_total]/g, format(regionData.value_total_gdp));
						break;

					case 'our_company':
						regionHtml = regionHtml.replace(/\[country_name]/g, arrTranslations[regionData.name.toLowerCase()]);
						regionHtml = regionHtml.replace(/\[employees_total]/g, format(self.getCategoriesTotal(regionData.categories)));
						regionHtml = regionHtml.replace(/\[male]/g, regionData.value_female);
						regionHtml = regionHtml.replace(/\[female]/g, regionData.value_male);
						regionHtml = regionHtml.replace(/\[research]/g, regionData.value_research);
						regionHtml = regionHtml.replace(/\[manufacturing]/g, regionData.value_plants);


						break;

				}

				el.html(regionHtml);

			} else {
				// Country not found, prevent popup from showing
				e.preventDefault();
			}
		},

	// Generates the colors for the regions on the map
		generateColors : function (mapData) {
			var colors = {},
				key;
			// Loop through all regions in map
			for (region in map.regions) {
				// Get the region data from the mapData array
				var regionData = $.grep(mapData, function (obj, index) {
					// Found when map.regions.key is in the regionData.code array
					return $.inArray(region, obj.code) > -1;
				})[0];
				// If we have regionData we can fill the colors object based on the total number for the region
				if (regionData) {
					colors[region] = regionData.color;
				} else {
					// No regionData for region found so set default color
					colors[region] = this.mapForeGroundColor;
				}
			}
			return colors;
		},

	// Gets the data for the map based on the mode ('grouped' or 'country')
		getMapData : function (mode, cb) {
			var self = this;
			//alert("mapVariation=" + mapVariation);
            if(self.mapData != []){
                if (cb) cb(self.mapData);
            }else{
                var bolUseLocalUrl = true;
                var strUrl = '/tools/dynamic_resources_cached_closed.aspx';
                var strDataType = 'json';
                if (location.search.indexOf('useremote') > 0) bolUseLocalUrl = false;
                if (typeof (strPageId) === 'undefined') bolUseLocalUrl = false;
    
    
                if (!bolUseLocalUrl) {
                    strUrl = 'http://www.annualreport2012.philips.com' + strUrl;
                    strDataType = 'jsonp';
                }
    
                var objData = {
                    method: 'getWorldmapData',
                    type: 'json',
                    datatype: this.mapVariation
                }
                if (typeof (strToken) === 'undefined') {
                    objData.token = '123';
                } else {
                    objData.token = strToken;
                }
    
                var objRequest = $.ajax({
                    type: "GET",
                    dataType: strDataType,
                    url: strUrl,
                    data: objData,
                    cache: false,
                    timeout: 3000
                });
    
                objRequest.done(function (response) {
                    //console.log(response);
                    //debugger;
    
                    //fill the global mapData variable with a clone of the object we have just received
                    //mapData = jQuery.extend(true, {}, response);
    
                    //ouch.. this seems to be a better method....
                    mapData = JSON.parse(JSON.stringify(response));
    
                    if (cb) cb(mapData);
                });
    
                objRequest.fail(function (objRequestStatus) {
                    //500 status from server, timeout of request or json parse error
                    //console.log('fail - ' + JSON.stringify(objRequestStatus));
    
                    var strErrorMessage;
                    switch (objRequestStatus.status) {
                        case 0:
                            //timeout
                            strErrorMessage = 'Timeout has occurred while retrieving: ' + strUrl;
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
                    //alert("strErrorMessage="+strErrorMessage);
                    //show the error message
                    if (typeof (strPageId) === 'undefined') {
                        alert(strErrorMessage);
                    } else {
                        handleError("There was an unexpected error while retrieving the data for the worldmap.");
                    }
                });                
            }
			

			//return mode === 'grouped' ? groupedData : countryData;
		},

		generateModeSwitch : function (mode) {

			var output = modeSelectorTemplate, temp = '';

			for (var i = 0; i < allowedModes.length; i++) {
				temp += '<input type="radio" name="mode" value="' + allowedModes[i] + '" ' + (allowedModes[i] === mode ? 'checked' : '') + '>' + allowedModes[i];
			}
			output = output.replace(/\[selectors]/g, temp);
			$mapPlaceholder.append(output);

			// Attach click event to the generated radio buttons
			$('input[name="mode"]').click(function (el) {
				mode = el.target.value;

				$mapPlaceholder.fadeTo('slow', 0.5, function () {
					$mapPlaceholder.html('');
					generateMap(mode);
				}).fadeTo('slow', 1.0);
			});
		},

		generateMap : function (mode) {
		    var self = this;
			// Get the data for the map
            //prepare the placeholder which will contain the interactive world map
            var height = $(window).height() - $('#header').height() - $('#footer').height();
            var width = $(window).width();
            $mapPlaceholder.html('');
            $mapPlaceholder.css({
                width: width,
                height: height,
                display: 'inline-block'
            });
			this.getMapData(mode, function (mapData) {

				//console.log('in');
				//console.log(mapData);

				// Create the new map object
				map = new jvm.WorldMap({
					map: this.mapName,
					container: $mapPlaceholder,
					backgroundColor: self.mapBackGroundColor,
					hoverColor: true,
					focusOn: {
						x: 0.5,
						y: 0.5,
						scale: 3,
						baseScale: 1
					},
					regionStyle: {
						initial: {
							"fill-opacity": 1
						},
						selected: {
							fill: self.regionHoverColor,
							"fill-opacity": self.regionHoverOpacity
						}
					},
					onRegionOver: function (e, code) {
						self.handleRegionMouseOver(e, code);
					},
					onRegionSelected: function (e, code, isSelected, selectedRegions) {
						self.handleRegionSelected(e, code, isSelected, selectedRegions);
					},
					onRegionOut: function (e, code) {
						map.clearSelectedRegions();
					},
					onRegionLabelShow: function (e, el, code) {
						self.showCountryDetails(e, el, code);
					},
					series: {
						regions: [{
							hoverColor: true
						}]
					}
				});
				// Set the colors for the regions
				map.series.regions[0].setValues(self.generateColors(mapData));
				// Add the mode switch buttons when needed
				if (this.showModeSwitch) {
					generateModeSwitch(mode);
				}
			});
		},
		
		init: function(){
            // Code that is being executed at runtime
        
            //determine the type of map to show
            //to use the code outside the ar pages, test for the availability of strPageId
            if (typeof (strPageId) === 'undefined') {
                $mapPlaceholder = $('div.interactive_graph');
            } else {
                if (strPageId == arrPages['our_company']) mapVariation = 'our_company';
                //find the placeholder
                switch (mapVariation) {
                    case 'lives_improved':
                        $mapPlaceholder = $('span.intext_image').eq(1);
                        break;
                    case 'our_company':
                        $mapPlaceholder = $('span.intext_image').eq(0);
                        break;
                }
        
            }
        
            var title, footnote;
            switch (this.mapVariation) {
                case 'lives_improved':
                    title = '<h3 class="gill_sans purple_base">' + arrTranslations['lives_improved_header'] + '</h3>';
                    footnote = '<em>' + arrTranslations['lives_improved_footer'] + '</em>';
                    popupTemplate = '<div class="country_details">' +
                                            '<h3>[country_name]</h3>' +
                                            '<table>' +
                                            '<tr><td><div class="popup_header">' + arrTranslations['population'] + '</div></td><td><div class="country_total total_value">[population_total]</div><span>' + arrTranslations['million'] + '</span></td></tr>' +
                                            '<tr><td><div class="popup_header">' + arrTranslations['lives_improved'] + '</div></td><td><div class="total_value">[total_value]</div><span>' + arrTranslations['million'] + '</span></td></tr>' +
                                            '<tr><td><div class="popup_header">' + arrTranslations['gdp'] + '</div></td><td><span class="dollar">$</span><div class="country_total total_value">[gdp_total]</div><span>' + arrTranslations['billion'] + '</span></td></tr>' +
                                            '</table>' +
                                        '</div>';
        
                    break;
                case 'our_company':
                    title = '<h3 class="gill_sans purple_base">' + arrTranslations['our_company_header'] + '</h3>';
                    footnote = '<em>' + arrTranslations['our_company_footer'] + '</em>';
                    popupTemplate = '<div class="country_details">' +
                                            '<h3>[country_name]</h3>' +
                                            '<table>' +
                                            '<tr><td><div class="popup_header">' + arrTranslations['number_of_employees'] + '</div></td><td><div class="country_total total_value">[employees_total]</div></td></tr>' +
                                            '<tr><td><div class="popup_header">' + arrTranslations['employees_female'] + '</div></td><td><div class="total_value">[female]</div><span>%</span></td></tr>' +
                                            '<tr><td><div class="popup_header">' + arrTranslations['employees_male'] + '</div></td><td><div class="country_total total_value">[male]</div><span>%</span></td></tr>' +
                                            '<tr><td><div class="popup_header">' + arrTranslations['r_and_d_centers'] + '</div></td><td><div class="country_total total_value">[research]</div></td></tr>' +
                                            '<tr><td><div class="popup_header">' + arrTranslations['manufacturing_sites'] + '</div></td><td><div class="country_total total_value">[manufacturing]</div></td></tr>' +
                                            '</table>' +
                                        '</div>'
        
                    break;
            }
        
        
        
        
            $mapPlaceholder.prepend(title);
            //$(footnote).insertAfter($mapPlaceholder.parent()).css({ display: 'inline-block', 'padding-top': '25px' });
        
            //get the data and generate the map
            this.generateMap(this.mode); 		    
		}
}



function format(nStr) {
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}