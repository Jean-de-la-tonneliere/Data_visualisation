/**
 * Line chart class
 */
export default class LineChart {

    // Attributes :
    width; height;
    margin; // [top, bottom, left, right]
    svg; chart;
    lineF; lineM;
    area;
    brushedArea;
    axisX; axisY;
    labelX; labelY;
    scaleX; scaleY;
    dataF; dataM; // internal data 

    // callbacks attributes
    xAxisBrushing = () => { };

    // Constructor
    constructor(container, width, height, margin) {
        this.width = width;
        this.height = height;
        this.margin = margin;

        this.svg = d3.select(container)
            .append('svg')
            .classed('doubleLineChart', true)
            .attr('width', width).attr('height', height);

        this.chart = this.svg.append('g')
            .attr('transform',
                `translate(${this.margin[2]}, ${this.margin[0]})`
            );

        this.lineF = this.chart.append('path');
        this.lineM = this.chart.append('path');
        this.area = this.chart.append('path');

        // Axis : 
        this.axisX = this.svg.append('g')
            .attr('transform',
                `translate(${this.margin[2]},${this.height - this.margin[1]})`
            );
        this.axisY = this.svg.append('g')
            .attr('transform',
                `translate(${this.margin[2]},${this.margin[0]})`
            );

        // Brushed area :
        this.brushedArea = this.svg.append("g")
            .attr("class", "brush")
            .attr("transform", `translate(${this.margin[2]},0)`);

        // Labels :
        this.labels = this.chart.selectAll('text.label');
        // Title :
        this.title = this.svg.append('text')
            .classed('title', true)
            .attr('transform', `translate(${this.width / 2},${this.margin[0]})`)
            .style('text-anchor', 'middle');
    }

    //------------------------------------- Private methods --------------------------------------//

    //--- #updateLine -------------------------------------------------------------------
    // This function updates the line and area charts for female and male data. 
    // It generates and renders the lines and areas based on the data for each gender. 
    // Also triggers an update for event listeners to ensure the chart remains interactive after the update.
    // \return {void} - No return
    #updateLine() {
        // Line generators :
        let lineFemale = d3.line()
            .curve(d3.curveCardinal)
            .x(d => this.scaleX(d[0])) // age
            .y(d => this.scaleY(d[1])); // %
        this.lineF = this.lineF
            .datum(this.dataF)
            .join("path")
            .attr("fill", "none")
            .classed('line', true)
            .attr("stroke", "#67a9cf")
            .attr("stroke-width", 3)
            .attr("d", lineFemale);

        let lineMale = d3.line()
            .curve(d3.curveCardinal)
            .x(d => this.scaleX(d[0])) // age
            .y(d => this.scaleY(d[1])); // %
        this.lineM = this.lineM
            .data([this.dataM])
            .join("path")
            .classed('line', true)
            .attr("fill", "none")
            .attr("stroke", "#ef8a62")
            .attr("stroke-width", 3)
            .attr("d", lineMale);

        // Area generator :
        let areaGen = d3.area()
            .x(d => this.scaleX(d[0]))
            .y0(this.scaleY(0))
            .y1(d => this.scaleY(Math.min(d[1], this.dataM.find(v => v[0] === d[0])[1])));
        this.area = this.area
            .datum(this.dataF)
            .attr("fill", "rgba(223, 231, 139, 0.3)")
            .attr("d", areaGen);

        // refresh event listeners
        this.#updateEvents();
    }


    //--- #updateLegend -------------------------------------------------------------------
    // This function updates the legend on the chart, displaying the labels and 
    // colors for the female and male data lines. It appends colored boxes with 
    // corresponding labels to the SVG container, allowing users to identify the 
    // data representations visually.
    // \return {void} - No return
    #updateLegend() {

        const legendData = [
            { label: 'Female data', color: "#67a9cf" },
            { label: 'Male data', color: "#ef8a62" }
        ];

        const legend = this.svg.append('g')
            .attr('transform', `translate(${this.width - this.margin[3] - 150},${this.margin[0]})`);

        const legendItems = legend.selectAll('.legend-item')
            .data(legendData)
            .enter().append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * 20})`);  // Space out each legend item

        // Create colored boxes for the legend
        legendItems.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', d => d.color);

        // Add labels next to the boxes
        legendItems.append('text')
            .attr('x', 20)
            .attr('y', 9)
            .text(d => d.label)
            .style('font-size', '12px')
            .style('alignment-baseline', 'middle');
    }


    //--- #updateEvents -------------------------------------------------------------------
    // This function updates event listeners for interactive features of the chart for brushing.
    // When the brushing interaction ends, it triggers the 'brushended' event handler.
    // \return {void} - No return
    #updateEvents() {
        let brushTmp = d3.brushX()
            .extent([[0, 0], //top-left corner
            [this.width - this.margin[3] - 40, this.height - this.margin[1]]]) //bottom-right
            .on("end", (event) => this.#brushended(event));
        this.brushedArea.call(brushTmp);
    }


    //--- #updateScales -------------------------------------------------------------------
    // This function updates the scales used to position and size the chart elements
    // based on the data.
    // \return {void} - No return
    #updateScales() {
        let chartWidth = this.width - this.margin[2] - this.margin[3],
            chartHeight = this.height - this.margin[0] - this.margin[1];

        let rangeX = [0, chartWidth],
            rangeY = [chartHeight, 0];

        let tmpSetAge = new Set([...this.dataF.map(d => d[0]), ...this.dataM.map(d => d[0])]);
        let domainX = Array.from(tmpSetAge),
            domainY = [0, 1];

        this.scaleX = d3.scalePoint(domainX, rangeX);
        this.scaleY = d3.scaleLinear(domainY, rangeY);
    }


    //--- #updateAxes -------------------------------------------------------------------
    // This function updates the axes of the chart based on the scales defined in
    // updateScales(). The X-axis is placed at the bottom, and the Y-axis is placed
    // to the left.
    // \return {void} - No return
    #updateAxes() {
        let axisGenX = d3.axisBottom(this.scaleX)
            .tickValues(this.scaleX.domain().filter(age => age % 3 == 0));
        let axisGenY = d3.axisLeft(this.scaleY);
        this.axisX.call(axisGenX);
        this.axisY.call(axisGenY);
    }


    //--- #brushended ---------------------------------------------------------
    // This function handles the end of the brush event for the X-axis. It computes
    // the selected range based on the brush's pixel position and translates that
    // into true values using the scale for the X-axis.
    // \param {Object} event - The brush event object that contains the selection
    //                          (default to an empty object if not provided).
    // \return {void} - No return
    #brushended(event = {}) {
        if (!event.selection) return;

        // value in pixels :
        let range = this.scaleX.domain().map(d => this.scaleX(d));
        let [x0, x1] = event.selection;

        // true values :
        let i0 = d3.bisectCenter(range, x0);
        let i1 = d3.bisectCenter(range, x1);
        let value0 = this.scaleX.domain()[i0];
        let value1 = this.scaleX.domain()[i1];

        console.log("selected : " + value0 + " to " + value1);
        this.xAxisBrushing(value0, value1);
    }

    //------------------------------------- Public API --------------------------------------//

    //--- render --------------------------------------------------------------
    // The render function takes two datasets (female and male), processes them,
    // and updates the various elements of the chart.
    // \param {Array|Object} datasetF - The dataset for the female data.
    // \param {Array|Object} datasetM - The dataset for the male data.
    // \return {Object} - Returns the current instance to allow method chaining.
    render(datasetF, datasetM) {
        this.dataF = datasetF;
        this.dataM = datasetM;
        this.#updateScales();
        this.#updateLine();
        this.#updateLegend();
        this.#updateAxes();
        return this;
    }

    //------------------------------------- Setters --------------------------------------//

    //--- setTitle ---------------------------------------------------------
    // This function sets the title of the chart. It updates the title element with the provided text.
    // \param {string} title - The title text to display (defaults to an empty string if not provided).
    // \return {Object} - Returns the current instance to allow method chaining.
    setTitle(title = '') {
        this.title.text(title);
        return this;
    }


    //--- setLabels ---------------------------------------------------------
    // This function sets the labels for the X and Y axes. It updates the text for both axes based on the provided labels.
    // \param {string} labelX - The label for the X-axis (defaults to 'Age' if not provided).
    // \param {string} labelY - The label for the Y-axis (defaults to 'Percentage of ppl with Alzheimer' if not provided).
    // \return {Object} - Returns the current instance to allow method chaining.
    setLabels(labelX = 'Age', labelY = 'Percentage of ppl with Alzheimer') {
        this.labelX.text(labelX);
        this.labelY.text(labelY);
        return this;
    }


    //--- setXAxisBrushing ---------------------------------------------------------
    // This function sets a callback function for the X-axis brushing event.
    // It assigns the provided callback to `xAxisBrushing` and then updates the event listeners for brushing.
    // \param {Function} f - The callback function to execute when brushing ends (defaults to an empty function if not provided).
    // \return {Object} - Returns the current instance to allow method chaining.
    setXAxisBrushing(f = () => { }) {
        this.xAxisBrushing = f;
        this.#updateEvents();
        return this;
    }
}