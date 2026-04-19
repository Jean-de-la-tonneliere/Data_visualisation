'use strict';

//---------------------------------- Classes import -----------------------------//
import DataManager from './DataManager.js';
import LineChart from './LineChart.js';
import MapChart from './map.js';
import GroupedBarchart from './GroupedBarchart.js';
import BarChart from './BarChart.js';

// Init DataManager:
let DM = new DataManager();

//---------------------------------- Rendering Line Chart -----------------------------//

/// Init :
let myLineChart = new LineChart('div#linechart', 450, 500, [10, 40, 40, 10]);

//--- initialiseLineChart --------------------------------------------------------------
// This function initialises and renders a line chart with age-based filtering.
// \param {string|null} countrySelect - The selected country for filtering data. 
//                                      If null, the chart displays global data.
// \return {void} - No return.
function initialiseLineChart(countrySelect) {
    myLineChart.setXAxisBrushing(filterByAge)
        .render(DM.getAgeResult(!countrySelect ? [d => d.gender === "Female"] : [d => d.gender === "Female", d => d.country === countrySelect]),
            DM.getAgeResult(!countrySelect ? [d => d.gender === "Male"] : [d => d.gender === "Male", d => d.country === countrySelect])
        );
}

//--- filterByAge ----------------------------------------------------------------------
// This function updates multiple visualisations based on the selected age range.
// \param {number} age0 - The lower bound of the selected age range.
// \param {number} age1 - The upper bound of the selected age range.
// \return {void} - No return.
let filterByAge = (age0, age1) => {
    initMap([age0, age1]);
    initialiseBarChart(false, [age0, age1]);
    initialiseGroupBarChart(false, [age0, age1]);
}

//---------------------------------- Rendering Chloropleth Map -----------------------------//

/// Init :
let country_map = new MapChart('div#map-container', 1000, 200);

//--- initMap --------------------------------------------------------------------------
// This function initialises and updates the map visualisation based on the selected 
// age range. It loads the world map, renders data points, and sets up interactions.
// \param {number[]} ages - An array containing the selected age range [minAge, maxAge].
// \return {void} - No return.
function initMap(ages) {

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .then(worldGeoJSON => {
            country_map.baseMap(worldGeoJSON);
            country_map.renderPoints(DM.getMap(ages));
            country_map.addTooltip();
            let changecountry = (e, d) => {
                bars_chart.getBars().remove();
                country_map.changeSelection(d);
                initialiseLineChart(country_map.getCountryName());
                initialiseBarChart(country_map.getCountryName(), ages);
                initialiseGroupBarChart(country_map.getCountryName(), ages);
            };

            let gobacktoworld = (e, d) => {
                bars_chart.getBars().remove();
                country_map.changeSelection(d);
                initialiseLineChart(false);
                initialiseBarChart(false, [0, 0]);
                initialiseGroupBarChart(false, [0, 0]);
            }
            country_map.setCountryClick(changecountry);
            country_map.setButtonClick(gobacktoworld);
        })
        .catch(error => console.error("ERROR during loading of GeoJSON:", error));
}

//---------------------------------- Rendering Bar chart -----------------------------//

/// Init :
let disease_bar = new BarChart('div#barchartDisease', 500, 500, [10, 40, 65, 10]),
    no_disease_bar = new BarChart('div#barchartNoDisease', 500, 500, [10, 40, 65, 10]);

function initialiseBarChart(countrySelect, ages) {

    disease_bar.render(DM.getComorbidityFactor(countrySelect, ages), true).setTitle("With Alzheimer");
    no_disease_bar.render(DM.getComorbidityFactor(countrySelect, ages), false).setTitle("Without Alzheimer");

    let changeComorbiditiesSelection = (e, d) => {
        disease_bar.changeSelection(d);
        no_disease_bar.changeSelection(d);
    }
    disease_bar.setButtonClick(changeComorbiditiesSelection);
}

//---------------------------------- Rendering Grouped Stacked Bar chart -----------------------------//
/// Init : 
let bars_chart = new GroupedBarchart('div#gpbarchart', 800, 500, [35, 40, 65, 10]);

//--- initialiseBarChart --------------------------------------------------------------
// This function initialises and renders bar charts for comorbidity factors based on 
// the selected country and age range. It displays data for individuals with and 
// without Alzheimer’s disease.
// \param {string|boolean} countrySelect - The selected country for filtering data. 
//                                         If false, global data is used.
// \param {number[]} ages - An array containing the selected age range [minAge, maxAge].
// \return {void} - No return.
function initialiseGroupBarChart(countrySelect, ages) {
    // Show the external factors chart
    let showExternalFactors = () => {
        bars_chart.render(DM.getExternalFactors(countrySelect, ages), "Filter by social factors")

        if (!countrySelect)
            bars_chart.setTitle("Impact of external factors on Alzheimer's diagnosis in the world");
        else if (countrySelect)
            bars_chart.setTitle("Impact of external factors on Alzheimer's diagnosis in " + countrySelect);

        bars_chart.setButtonClick((e, d) => {
            bars_chart.getBars().remove();
            showSocialFactors();
        });
    };

    // Show the social factors chart
    let showSocialFactors = () => {
        bars_chart.render(DM.getSocialFactors(countrySelect, ages), "Filter by external factors")
        if (!countrySelect)
            bars_chart.setTitle("Impact of social factors on Alzheimer's diagnosis in the world");
        else if (countrySelect)
            bars_chart.setTitle("Impact of social factors on Alzheimer's diagnosis in " + countrySelect);

        bars_chart.setButtonClick((e, d) => {
            bars_chart.getBars().remove();
            showExternalFactors();
        });
    };

    // Initially show the external factors chart
    showExternalFactors();
}

//---------------------------------- Rendering all visualisation -----------------------------//

/// Load :
DM.loadData("/data/alzheimers_prediction_dataset_clean.csv", () => {
    initialiseLineChart(false);
    initMap([0, 0]);
    initialiseBarChart(false, [0, 0]);
    initialiseGroupBarChart(false, [0, 0]);
})