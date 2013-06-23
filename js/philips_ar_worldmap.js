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
	$: jQuery,
	// Variables
	showtitle: false,
	showfooter: false,
	mapName: 'world_mill_en',
	mapVariation: 'lives_improved', //determines the type of map we like to show (currently only 'lives_improved', 'our_company')
	mapBackGroundColor: '#fff',
	mapForeGroundColor: '#efeff4',
	regionHoverColor: '#135ed5', //'#0b5ed7',	
	regionHoverOpacity: 1,
	mapData: false,
	$mapPlaceholder: $('div.wrapper'),
	allowedModes: ['grouped', 'country'],
	mode: 'grouped', // grouped or country
	showModeSwitch: false,
	map: {},
	availableCountryCodes: [],

	// HTML Templates
	popupTemplate: '', //determined by the map variation
	categoryTemplate: '<div class="sector_details">' +
								'<div class="sector_value">[category_value]</div>' +
								'<div class="sector_name">[category_name]</div>' +
							'</div>',
	modeSelectorTemplate: '<div class="mode_selector_wrapper">[selectors]</div>',

	objmapfocus: {
		x: 0.5,
		y: 0.5,
		scale: 1,
		baseScale: 1,
		maxScale: 20
	},
	// Helper Functions	

	// Calculates the total for the given categories					
	getCategoriesTotal: function (categories) {
		var total = 0;
		$.each(categories, function (index, cat) {
			total += +cat.value;
		});
		return total;
	},

	// Overrides the region mouseover event (set 'selected' property for all regions in mapData[i].code array)						
	handleRegionMouseOver: function (e, code) {
		var self = this;
		self.map.clearSelectedRegions();
		//debugger;
		for (var i = 0; i < self.mapData.length; i++) {
			//console.log(self.mapData[i].code);
			//debugger;
			if ($.inArray(code, self.mapData[i].code) > -1 || self.mapData[i].code === code) {
				//debugger;
				self.map.setSelectedRegions(self.getMapCodes(self.mapData[i].code));
				
				self.showCountryDetails(e, null, code);
				break;
			}
		}
	},

	//returns an array of country codes that exist in the definition of the maps object
	getMapCodes: function (dataArray) {
		var self = this;
		//console.log(dataArray);
		var outputArray = [];
		//debugger;
		if(!$.isArray(dataArray)){
			var temp = [];
			temp.push(dataArray);
			dataArray=temp;
		}

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

	getAvailableCountryCodes: function () {
		var self = this;
		var availableCountryCodes = [];
		for (region in self.map.regions) {
			availableCountryCodes.push(region);
		}
		return availableCountryCodes;
	},

	// NOT USED!! Idea is to use this to give some effect to the popup appearance						
	handleRegionSelected: function (e, code, isSelected, selectedRegions) {
		//$(map.regions[code]).fadeTo('slow', 0.5);
	},

	// Overrides the default country popup (renders html based on data from the countriesData object)				
	showCountryDetails: function (e, el, code) {
		var self = this;
		//debugger;
		// Helper function to render details for each category in the found region
		function getCategoryDetails(categories) {
			var arrTemp = [];
			var temp = self.categoryTemplate;
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
			//console.log(obj);
			if ($.inArray(code, obj.code) > -1 || obj.code == code) {
				regionData = obj;
				return false;
			}
		});
		//console.log(regionData);
		if (regionData != null) {

			//fill the popup template with relevant data
			var regionHtml = self.popupTemplate;

			switch (self.mapVariation) {
				case 'lives_improved':
					
					regionHtml = regionHtml.replace(/\[country_name]/g, regionData.name);// arrTranslations[regionData.name.toLowerCase()]);
					regionHtml = regionHtml.replace(/\[total_value]/g, format(self.getCategoriesTotal(regionData.categories)));
					regionHtml = regionHtml.replace(/\[percentageLI]/g, 0);
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

			$('#region-details').html(regionHtml);
			app.renderFavouritePanel(regionData);
			//debugger;
			//$('#region-filter').html('<div class="btn" onclick="app.addFavourite(\''+arrTranslations[regionData.name.toLowerCase()] + '_' + app.current_oru+'\', \''+arrTranslations[regionData.name.toLowerCase()] + '_' + app.current_oru+'\');"><div class="btn_inner">'+arrTranslations[regionData.name.toLowerCase()] + '_' + app.current_oru+'</div></div>');
	        $(".dial").each(function(){
	            var $this = $(this);
	            var myVal = Math.round(regionData.percentageLI);
	            // alert(myVal);
	            $this.knob({
		        	readOnly:true,
		        	width: 75,
		        	height: 75,
		        	cursor: false,
		        	thickness: '.2',
		        	fgColor: '#0b5ed7',
		        	bgColor: '#ccc',
		        	inputColor: '#0b5ed7'	 	                       	
	            });




	            $({
	                value: 0
	            }).animate({

	                value: myVal
	            }, {
	                duration: 2000,
	                easing: 'swing',
	                step: function () {
	                    $this.val(Math.ceil(this.value)).trigger('change').val(Math.ceil(this.value)+'%');

	                }
	            })	        	
	        });
       
			$('#info').css({
				bottom: 0
			});
			//console.log(code);
			//console.log(self.zoom);
			self.$mapPlaceholder.vectorMap('set', 'focus', regionData.code, 1);
		} else {
			// Country not found, prevent popup from showing
			e.preventDefault();
		}
	},

	// Generates the colors for the regions on the map
	generateColors: function (mapData) {
		var self = this;
		var colors = {}, key;
		Object.size = function(obj) {
		    var size = 0, key;
		    for (key in obj) {
		        if (obj.hasOwnProperty(key)) size++;
		    }
		    return size;
		};
		var size = Object.size(self.map.regions);
		//debugger;
		// Loop through all regions in map
		//debugger;
		for (region in self.map.regions) {
			// Get the region data from the mapData array
			//debugger;
			var regionData = $.grep(mapData, function (obj, index) {
				// Found when map.regions.key is in the regionData.code array
				return $.inArray(region, obj.code) > -1 || region === obj.code;
			})[0];
			// If we have regionData we can fill the colors object based on the total number for the region
			if (regionData) {
				//console.log(regionData);
				//debugger;
				var percentageLI = (regionData.categories[0].value * 100) / regionData.value_total_population || 0;
				if(percentageLI> 99)percentageLI=100;
				if(percentageLI< 1)percentageLI=1;
				regionData.percentageLI = percentageLI;
				if(regionData.color){
					//debugger;
					colors[region] = self.getColorForPercentage(percentageLI, regionData.color.low, regionData.color.middle, regionData.color.high);
				}else{
					colors[region] = self.mapForeGroundColor;
				}
				
					//self.increaseBrightness('#112233', percentageLI);
			} else {
				//debugger;
				// No regionData for region found so set default color
				colors[region] = self.mapForeGroundColor;
			}
		}

		return colors;
	},
	getColorForPercentage: function(pct, low_color, middle_color, high_color) {
		var self = this;
	    pct /= 100;

	    var percentColors = [
	            { pct: 0.01, color: self.rgbFromHex(low_color) },
	            { pct: 0.5, color: self.rgbFromHex(middle_color) },
	            { pct: 1.0, color: self.rgbFromHex(high_color) } 
	        ];

	    for (var i = 0; i < percentColors.length; i++) {
	        if (pct <= percentColors[i].pct) {
	            var lower = percentColors[i - 1] || { pct: 0.1, color: { r: 0x0, g: 0x00, b: 0 } };
	            var upper = percentColors[i];
	            var range = upper.pct - lower.pct;
	            var rangePct = (pct - lower.pct) / range;
	            var pctLower = 1 - rangePct;
	            var pctUpper = rangePct;
	            var color = {
	                r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
	                g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
	                b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
	            };
	            return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
	        }
	    }
	},
	rgbFromHex: function(hex){
		function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
		function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
		function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
		function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
		return {
			r: hexToR(hex),
			g: hexToG(hex),
			b: hexToB(hex)
		}
	},
	// Gets the data for the map based on the mode ('grouped' or 'country')
	getMapData: function (mode, cb) {
		var self = this;
		//alert("mapVariation=" + mapVariation);
		if (self.mapData != false) {
			if (cb) cb(self.mapData);
		} else {
			cb([]);
		}


		//return mode === 'grouped' ? groupedData : countryData;
	},

	generateModeSwitch: function (mode) {
		var self = this;
		var output = self.modeSelectorTemplate, temp = '';

		for (var i = 0; i < self.allowedModes.length; i++) {
			temp += '<input type="radio" name="mode" value="' + self.allowedModes[i] + '" ' + (self.allowedModes[i] === mode ? 'checked' : '') + '>' + self.allowedModes[i];
		}
		output = output.replace(/\[selectors]/g, temp);
		self.$mapPlaceholder.append(output);

		// Attach click event to the generated radio buttons
		$('input[name="mode"]').click(function (el) {
			mode = el.target.value;

			self.$mapPlaceholder.fadeTo('slow', 0.5, function () {
				var b = this.emptyPlaceholder(self.$mapPlaceholder);
				generateMap(mode);
			}).fadeTo('slow', 1.0);
		});
	},

	emptyPlaceholder: function (el) {
		el.find('img,div.jvectormap-container').remove();
		return true;
	},

	generateMap: function (mode, width, height) {
		var self = this;
		$('.jvectormap-label').remove();
		// Get the data for the map
		//prepare the placeholder which will contain the interactive world map

		var b = self.emptyPlaceholder(self.$mapPlaceholder);
		self.$mapPlaceholder.css({
			width: width,
			height: height,
			display: 'inline-block'
		});
		self.getMapData(mode, function (mapData) {

			//console.log('in');
			//console.log(mapData);

			// Create the new map object
			self.map = new jvm.WorldMap({
				map: self.mapName,
				container: self.$mapPlaceholder,
				backgroundColor: self.mapBackGroundColor,
				hoverOpacity: 1,
				hoverColor: false,
				focusOn: self.objmapfocus,
				regionStyle: {
					initial: {
						"fill-opacity": 1
					},
					selected: {
						fill: self.regionHoverColor,
						"fill-opacity": self.regionHoverOpacity
					},
					hover: {
						"fill-opacity": self.regionHoverOpacity						
					}
				},

				onRegionClick: function(e, code){
					e.preventDefault();
					console.log('Country code clicked: ' + code);
					if(!isClickFunctionRunning){
						console.log('Executing CLICK');
						isClickFunctionRunning=true;
						self.handleRegionMouseOver(e, code);
					}
					
					
				},
				onRegionOver: function (e, code) {
					//self.handleRegionMouseOver(e, code);
					console.log('onRegionOver(e, "'+code+'")');
					if(!isClickFunctionRunning){
						console.log('Executing MOUSEOVER');
						isClickFunctionRunning=true;
						self.handleRegionMouseOver(e, code);
					}
				},
				onRegionSelected: function (e, code, isSelected, selectedRegions) {
					//console.log('onRegionSelected(e, "'+code+'", '+isSelected+', "'+selectedRegions+'")');
					//self.handleRegionSelected(e, code, isSelected, selectedRegions);
				},
				onRegionOut: function (e, code) {
					//self.map.clearSelectedRegions();
				},
				onRegionLabelShow: function (e, el, code) {
					//self.showCountryDetails(e, el, code);
				},
				series: {
					regions: [{
						hoverColor: false
						//,scale: ['#112233', '#009988']
						//,attribute: 'fill'
					}]
				}
			});
			//debugger;
			// Set the colors for the regions
			self.map.series.regions[0].setValues(self.generateColors(mapData));
			// Add the mode switch buttons when needed
			if (self.showModeSwitch) {
				generateModeSwitch(mode);
			}
			
			
		});
	},

	init: function () {
		// Code that is being executed at runtime
		var self = this;
		var width, height;
		var title, footnote;

		//make this function bw compatible with the calls used in the mobile apps
		if (arguments.length === 1) {
			var objArguments = arguments[0];
			width = objArguments.width;
			height = objArguments.height;
			//{width: 80, height: 80}
		} else {
			width = arguments[0];
			height = arguments[1];
		}

		//determine the templates and content to use
		switch (self.mapVariation) {
			case 'lives_improved':
				title = '<h3 class="wm_title gill_sans purple_base">' + arrTranslations['lives_improved_header'] + '</h3>';
				footnote = '<em class="wm_footnote">' + arrTranslations['lives_improved_footer'] + '</em>';
				self.popupTemplate = 	'<table id="details" style="position: absolute;">' +
											'<tr><td colspan="3"><h3>[country_name]</h3></td></tr>' +
											//'<tr><td colspan="3">Filtered By: <span class="span_filtered_by"></span>   Grouped By: <span class="span_grouped_by"></span></td></tr>' +
	
											'<tr class="content">' +
												'<td style="width: 33.3%">' +
													'<table style="float: left">' +
														'<tr><td>' + arrTranslations['population'] + '</td></tr>' +
														'<tr><td><div class="country_total total_value">[population_total]</div><span>' + arrTranslations['million'] + '</span></td></tr>' +
														'<tr></tr>' +
														'<tr><td>' + arrTranslations['lives_improved'] + '</td></tr>' +
														'<tr><td><div class="total_value">[total_value]</div><span>' + arrTranslations['million'] + '</span></td></tr>' +
													'</table>' +
												'</td>' +
												'<td class="dial_wrapper" style="width: 33.3%">' +
													'<table style="margin: 0px auto;">' +
														'<tr><td><input data-skin="tron" type="text" value="[percentageLI]" class="dial"></td></tr>' +
													'</table>' +
												'</td>' +												
												'<td style="width: 33.3%">' +
													'<table style="float: right;">' +
														'<tr><td>' + arrTranslations['gdp'] + '</td></tr>' +
														'<tr><td><span class="dollar">$</span><div class="country_total total_value">[gdp_total]</div><span>' + arrTranslations['billion'] + '</span></td></tr>' +
													'</table>' +
												'</td>' +
											'</tr>' +
										'</table>';
	
				break;
			case 'our_company':
				title = '<h3 class="wm_title gill_sans purple_base">' + arrTranslations['our_company_header'] + '</h3>';
				footnote = '<em class="wm_footnote">' + arrTranslations['our_company_footer'] + '</em>';
				self.popupTemplate = '<div class="country_details">' +
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



		if (self.showtitle) self.$mapPlaceholder.prepend(title);

		if (self.showfooter) $(footnote).insertAfter(self.$mapPlaceholder.parent()).css({ display: 'inline-block', 'padding-top': '25px' });


		//get the data and generate the map
		self.generateMap(self.mode, width, height);
	}
}


function percent(x, col) {
	
    var factor;
    //if (x < 50) {
        factor = (100 - x) / 100;
        return col[0].scale(factor).add(col[0].scale(1-factor));
    //} else {
    //    factor = (100 - x) / 50;
    //    return col[1].scale(factor).add(col[0].scale(1-factor));
    //}
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

//hack to allow first click on worldmap
var isClickFunctionRunning=false;
var timerId=window.setInterval(function(){
	if(isClickFunctionRunning)isClickFunctionRunning=false;
},1000);


