export default class MapChart {

    width; height;
    svg; mapGroup; colorScale;
    projection; pathGen; regions;
    data; countrySelection;
    legendWidth; legendHeight; legendSvg; legendScale
    countryData;
    noDataColor = "#d9d9d9";
    borderColor = "#333";
    borderWidth = 0.5;
    hoverBorderColor = "#ff0000";
    hoverBorderWidth = 2;
    chartScale = 130;
    alzheimerPercentage;
    countryName;
    button;

    countryClick = () => { };
    buttonClick = () => { };

    // Constructor
    constructor(container, width, height) {
        this.width = width;
        this.height = height;

        this.legendWidth = 300;
        this.legendHeight = 30;


        this.svg = d3.select(container).append("svg")
            .classed("viz map", true)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", `0 0 ${this.width - 50} ${this.height - 50}`)
            .style("width", "100%")
            .style("height", "100%");

        this.mapGroup = this.svg.append("g")
            .classed("map", true);

        this.addInfoBox();
    }

    //------------------------------------- Private methods --------------------------------------//

    //--- #setLegend ---------------------------------------------------------
    // This method sets up the legend for the map, defining a gradient based on the maximum percentage value.
    // It generates the linear gradient for the color scale, creates a rectangle for the gradient, and appends an axis to show percentage values.
    // \param {number} maxPourcentage - The maximum value used to define the color scale and legend.
    // \return {void} - No return value.
    #setLegend(maxPourcentage) {
        this.svg.select("#legend").remove();
        this.svg.select("defs").remove();
        this.legendSvg = this.svg.append("g")
            .attr("id", "legend")
            .attr("transform", `translate(${this.width / 2 - this.legendWidth / 2}, ${this.height + this.legendHeight + 60})`);

        const defs = this.svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        // Define gradient stops based on maxPourcentage
        for (let i = 0; i <= 100; i += 10) {
            linearGradient.append("stop")
                .attr("offset", i + "%")
                .attr("stop-color", this.colorScale((i / 100) * maxPourcentage));
        }

        this.legendSvg.append("rect")
            .attr("width", this.legendWidth)
            .attr("height", this.legendHeight)
            .style("fill", "url(#legend-gradient)");


        this.legendScale = d3.scaleLinear()
            .domain([0, maxPourcentage])
            .range([0, this.legendWidth]);

        const legendAxis = d3.axisBottom(this.legendScale)
            .tickFormat(d => d.toFixed(0) + "%");

        this.legendSvg.append("g")
            .attr("transform", `translate(0, ${this.legendHeight})`)
            .call(legendAxis);
    }


    //--- #setProjection ---------------------------------------------------------
    // This private method sets the map projection and path generator using the GeoMercator projection. 
    // It adjusts the map scale and translation for proper positioning.
    // \return {void} - No return value.
    #setProjection() {
        this.projection = d3.geoMercator()
            .scale(this.chartScale)
            .translate([this.width / 2, this.height / 1.5]);

        this.pathGen = d3.geoPath().projection(this.projection);
    }


    //--- #setColorScale ---------------------------------------------------------
    // This private method sets the colour scale for the map, using a sequential blue color scale for Alzheimer's diagnosis rates.
    // \return {void} - No return value.
    #setColorScale() {
        this.colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, 100]);
    }


    //--- #renderMap ---------------------------------------------------------
    // This private method renders the map by iterating over the regions data and binding it to map paths (countries).
    // It sets up event listeners for mouseover and mouseout, displaying tooltips with Alzheimer's diagnosis data, and highlights countries when hovered.
    // \return {void} - No return value.
    #renderMap() {
        this.mapGroup.selectAll(".country")
            .data(this.regions.features)
            .join("path")
            .classed("country", true)
            .attr("d", this.pathGen)
            .attr("fill", d => {
                this.countryData = this.data?.find(item => item.Country === d.properties.name);
                return this.countryData ? this.colorScale(this.countryData.has_alzheimer_diagnosis) : this.noDataColor;
            })
            .attr("stroke", this.borderColor)
            .attr("stroke-width", this.borderWidth)
            .on("mouseover", (event, d) => {
                // On mouseover, change the border to a highlighted color
                d3.select(event.target)
                    .attr("stroke", this.hoverBorderColor)
                    .attr("stroke-width", this.hoverBorderWidth);


                this.#showTooltip(event, d);
            })
            .on("mouseout", (event) => {
                // On mouseout, revert the border to the default
                d3.select(event.target)
                    .attr("stroke", this.borderColor)
                    .attr("stroke-width", this.borderWidth);


                this.#hideTooltip();
            });

        this.#setLegend(d3.max(this.data, d => d.has_alzheimer_diagnosis));
    }


    //--- #updateEvents ---------------------------------------------------------
    // This private method updates event listeners for map paths, enabling click and hover interactions for displaying country information and tooltips.
    // It also binds the click event to reset the view.
    // \return {void} - No return value.
    #updateEvents() {
        this.mapGroup.selectAll(".country")
            .data(this.regions.features)
            .join("path")
            .classed("country", true)
            .attr("d", this.pathGen)
            .on("click", (event, d) => {
                let format = d3.format(".2%");

                // Show the info box when a country is clicked
                this.countryData = this.data?.find(item => item.Country === d.properties.name);
                this.countryName = d.properties.name;
                this.alzheimerPercentage = this.countryData ? format(this.countryData.has_alzheimer_diagnosis / 100) : "No data";
                this.countrySelection = this.countryName;

                this.getCountryName();
                // Update the content of the info box
                d3.select("#info-box")
                    .style("display", "block")
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                <strong>${this.countryName}</strong><br>
                Alzheimer's diagnosis rate: ${this.alzheimerPercentage}`);
                this.countryClick(event, d);
            });

        d3.select(".world-button")
            .on('click', (e, d) => {
                console.log("CLICKEEE");
                d3.select("#info-box")
                    .style("display", "none")
                this.countrySelection = undefined;
                this.buttonClick(e, d);
            });
    }


    //--- #updateButton ---------------------------------------------------------
    // This private method updates the button for resetting the map view, adding or updating the button element based on the data.
    // \return {void} - No return value.
    #updateButton() {
        let buttonContainer = d3.select(".world-button");

        this.button = buttonContainer.selectAll("button")
            .data(["Reset to world view "]);

        this.button.enter()
            .append("button")
            .merge(this.button)
            .text(d => d)
            .attr("value", d => d)
            .attr("class", "grouped-button");
    }


    //--- #showTooltip ---------------------------------------------------------
    // This private method displays a tooltip with the Alzheimer's diagnosis percentage when hovering over a country on the map.
    // It positions the tooltip based on the mouse event.
    // \param {Event} event - The mouse event triggering the tooltip display.
    // \param {Object} d - The data bound to the hovered country.
    // \return {void} - No return value.
    #showTooltip(event, d) {
        const countryData = this.data?.find(item => item.Country === d.properties.name);
        const displayValue = countryData && !isNaN(countryData.has_alzheimer_diagnosis)

            ? `${countryData.has_alzheimer_diagnosis.toFixed(2)}%`
            : "No data";

        d3.select("#tooltip")
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px")
            .style("display", "block")
            .html(`<strong>${d.properties.name}</strong>: ${displayValue}`);
    }


    //--- #hideTooltip ---------------------------------------------------------
    // This private method hides the tooltip when the mouse moves away from the country.
    // \return {void} - No return value.
    #hideTooltip() {
        d3.select("#tooltip").style("display", "none");
    }

    //------------------------------------- Public API --------------------------------------//

    //--- addInfoBox ---------------------------------------------------------
    // This public method creates and appends an information box to the body of the page.
    // \return {void} - No return value.
    addInfoBox() {
        // Create the info box container in the body
        d3.select("body").append("div")
            .attr("id", "info-box")
            .style("position", "absolute")
            .style("background", "white")
            .style("padding", "10px")
            .style("border", "1px solid black")
            .style("border-radius", "5px")
            .style("display", "none");  // Hidden by default
    }


    //--- baseMap ---------------------------------------------------------
    // This public method initialises the map with region data and sets up the map projection, color scale, and reset button.
    // \param {Object} regions - The GeoJSON data for the map regions.
    // \return {Object} - Returns the current object for method chaining.
    baseMap(regions) {
        if (!regions || !regions.features) {
            console.error("Erreur: le paramètre regions doit être un objet GeoJSON contenant 'features'.", regions);
            return this;
        }
        this.regions = regions;

        this.#setProjection();
        this.#setColorScale();
        this.#updateButton();
        return this;
    }


    //--- renderPoints ---------------------------------------------------------
    // This public method renders the dataset points on the map and displays the data on the map.
    // \param {Array} dataset - The dataset containing the data for the countries on the map.
    // \return {Object} - Returns the current object for method chaining.
    renderPoints(dataset) {
        this.data = dataset;
        this.#renderMap();
        return this;
    }


    //--- addTooltip ---------------------------------------------------------
    // This public method adds a tooltip element to the page for displaying additional information when hovering over a country.
    // \return {void} - No return value.
    addTooltip() {
        d3.select("body").append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("padding", "5px")
            .style("border", "1px solid black")
            .style("display", "none");
    }


    //--- changeSelection ---------------------------------------------------------
    // This public method is used to change the selected country or region and update the selection.
    // \return {void} - No return value.
    changeSelection() {
        this.getCountryName();
    }

    //------------------------------------- Setters --------------------------------------//

    //--- setCountryClick ---------------------------------------------------------
    // This public method sets the callback function for the country click event. The provided function is called when a country is clicked on the map.
    // \param {Function} f - The callback function to be executed on country click.
    // \return {Object} - Returns the current object for method chaining.
    setCountryClick(f = () => { }) {
        this.countryClick = f;
        this.#updateEvents();
        return this;
    }


    //--- setButtonClick ---------------------------------------------------------
    // This public method sets the callback function for the button click event. The provided function is called when the reset button is clicked.
    // \param {Function} f - The callback function to be executed on button click.
    // \return {Object} - Returns the current object for method chaining.
    setButtonClick(f = () => { }) {
        this.buttonClick = f;
        this.#updateEvents();
        return this;
    }

    //------------------------------------- Getters --------------------------------------//

    //--- getCountryName ---------------------------------------------------------
    // This public method returns the name of the currently selected country on the map.
    // \return {string} - Returns the name of the currently selected country or undefined if no country is selected.
    getCountryName() {
        return this.countrySelection;
    }
}

