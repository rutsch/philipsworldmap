var countryData = [
		{
			'name': 'China',
			'code': ['CN'],
			'value_total_population': '1030.2',
			'value_total_gdp': '1400,9',
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '430.8'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '131.0'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '200.7'
				}
			]
		},
		{
			'name': 'Saudi Arabia',
			'code': ['SA'],
			'value_total_population': '30.2',
			'value_total_gdp': '15,9',
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '9.8'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '11.0'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '7.7'
				}
			]				
		},
		{
			'name': 'The Netherlands',
			'code': ['NL'],
			'value_total_population': '18.2',
			'value_total_gdp': '15,9',
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '6.8'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '7.0'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '2.7'
				}
			]				
		},
		{
			'name': 'The United States of America',
			'code': ['US'],
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '80.8'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '200.0'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '350.7'
				}
			]				
		},
		{
			'name': 'Canada',
			'code': ['CA'],
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '80.8'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '200.0'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '350.7'
				}
			]				
		},		
		{
			'name': 'France',
			'code': ['FR'],
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '20.8'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '40.0'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '10.7'
				}
			]				
		},
		{
			'name': 'Mexico',
			'code': ['MX'],
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '80.8'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '200.0'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '350.7'
				}
			]				
		},
		{
			'name': 'Russia',
			'code': ['RU'],
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '80.8'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '10.0'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '40.7'
				}
			]				
		}
	],
	groupedData = [
		{
			'name': 'Benelux',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['BE', 'NL', 'LU'],
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '8.8'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '1.0'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '4.7'
				}
			]				
		},
		{
			'name': 'North America',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['US', 'CA', 'MX'],
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '122'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '93.0'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '53'
				}
			]				
		},
		{
			'name': 'UK and Ireland',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['GB', 'IE'],
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '25'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '8'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '15'
				}
			]				
		},
		{
			'name': 'Italy, Israel and Greece',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['IL', 'IT', 'GR'],
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '36'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '11'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '9'
				}
			]				
		},
		{
			'name': 'Latam',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['BR', 'AR', 'CL', 'CO', 'PA', 'PE', 'PR', 'SV', 'UY'],
			'categories': [
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '23'
				},
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '22'
				},
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '36'
				}
			]				
		},
		{
			'name': 'DACH',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['DE', 'CH', 'AT'],
			'categories': [
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '25'
				},
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '43'
				},				
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '20'
				}
			]				
		},
		{
			'name': 'France',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['FR'],
			'categories': [
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '10'
				},
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '30'
				},				
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '18'
				}
			]				
		},
		{
			'name': 'Nordics',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['DK', 'SE', 'NO', 'FI'],
			'categories': [
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '1'
				},
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '17'
				},				
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '6'
				}
			]				
		},
		{
			'name': 'Iberia',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['ES', 'PT'],
			'categories': [
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '9'
				},
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '28'
				},				
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '6'
				}
			]				
		},
		{
			'name': 'Russia and Central Asia',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['RU', 'KZ', 'KG', 'TJ', 'TM', 'UZ'],
			'categories': [
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '7'
				},
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '33'
				},				
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '22'
				}
			]				
		},
		{
			'name': 'CEE',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['BG', 'CZ', 'HU', 'LV', 'PL', 'RO', 'SK', 'SI'],
			'categories': [
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '8'
				},
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '52'
				},				
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '12'
				}
			]				
		},
		{
			'name': 'Middle East and Turk',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['AM', 'AZ', 'CY', 'GE', 'IQ', 'IL', 'JO', 'KW', 'LB', 'PS', 'OM', 'QA', 'SA', 'SY', 'TR', 'AE', 'YE'],
			'categories': [
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '24'
				},
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '77'
				},				
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '16'
				}
			]				
		},
		{
			'name': 'Africa',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['DZ', 'EG', 'KE', 'LS', 'MA', 'TN', 'ZA'],
			'categories': [
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '0'
				},
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '31'
				},				
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '2'
				}
			]				
		},
		{
			'name': 'Greater China',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['CN', 'TW'],
			'categories': [
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '63'
				},
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '243'
				},				
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '59'
				}
			]				
		},
		{
			'name': 'Asean and Pacific',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['AU', 'ID', 'KR', 'MY', 'NZ', 'PH', 'PK', 'TH', 'VN'],
			'categories': [
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
		},
		{
			'name': 'Indian Subcontinent',
			'value_total_population': '600.2',
			'value_total_gdp': '900.9',
			'code': ['BD', 'IN'],
			'categories': [
				{
					'name': 'Healtcare',
					'code': 'HC',
					'value': '26'
				},
				{
					'name': 'Lighting',
					'code': 'LI',
					'value': '175'
				},				
				{
					'name': 'Consumer Lifestyle',
					'code': 'CL',
					'value': '7'
				}
			]				
		}
	];			
