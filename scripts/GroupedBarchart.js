/**
 * Grouped bar chart class
 */
export default class GroupedBarchart {

    // Attributes
    width; height; margin;                              // visu size 
    svg; chart; bars; title; buttonval;                 // selections 
    axisX; axisY; subAxisX;                             // axis
    labelX; labelY;                                     // labels
    scaleX; scaleY; subScaleX;                          // scales
    legend; workingdata; colorScale;
    data; dataset;                                      // internal data 

    // Callback Header
    buttonClick = () => { };
    mouseHover = () => { };
    mouseLeave = () => { };

    // Constructor
    // margin -> [top, bottom, left, right]
    constructor(container, width, height, margin) {
        this.width = width;
        this.height = height;
        this.margin = margin;

        this.svg = d3.select(container)
            .append('svg')
            .classed('visuBarcharts', true)
            .attr('width', this.width)
            .attr('height', this.height);

        this.chart = this.svg.append('g');
        this.colorScale = ["#a6cee3", "#1f78b4", "#b2df8a"];
        this.bars = this.chart.selectAll('rect.bars');

        this.axisX = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]},${this.height - this.margin[1]})`);
        this.subAxisX = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2] * 1.4},${this.height - this.margin[1]})`);
        this.axisY = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]},${this.margin[0]})`);

        this.labelX = this.svg.append('text')
            .attr('transform', `translate(${this.width / 2},${this.height})`)
            .style('text-anchor', 'middle').attr('dy', -5);
        this.labelY = this.svg.append('text')
            .attr('transform', `translate(0,${this.margin[0]})rotate(-90)`)
            .style('text-anchor', 'end')
            .attr('dy', 15);

        this.title = this.svg.append('text')
            .classed('title', true)
            .attr('transform', `translate(${this.width / 2},${this.margin[0]})`)
            .style('font-size', '1.2em')
            .style('font-weight', 'bold')
            .style('text-anchor', 'middle');
    }

    //------------------------------------- Private methods --------------------------------------//

    //--- #normaliseData ---------------------------------------------------------
    // This private method normalises the grouped data by calculating the counts of "Yes" and "No" diagnoses for each category.
    // \param {Map} groupedData - The grouped data containing factors and diagnoses.
    // \param {string} factor - The factor to normalise data for.
    // \return {Array} - Returns an array of normalised data objects containing categories and their corresponding counts for "Yes" and "No" diagnoses.
    #normaliseData(groupedData, factor) {
        let normalised = [];
        let yesData = groupedData.get(true)?.get(factor) || [];
        let noData = groupedData.get(false)?.get(factor) || [];

        // Get all unique categories from both "Yes" and "No"
        let categories = [...new Set([...yesData, ...noData].map(d => d.value))];

        normalised = categories.map(category => {
            return {
                category,
                true: yesData.find(d => d.value === category)?.count,
                false: noData.find(d => d.value === category)?.count
            };
        });

        return normalised;
    }


    //--- #updateBars ---------------------------------------------------------
    // This private method updates the bars in the chart based on the latest data, creating new bars or updating existing ones.
    // \return {void} - No return.
    #updateBars() {  // change flag detects filtering action
        let groupedData = d3.group(this.data, d => d.diagnosis, d => d.factor);

        // Process data for grouped & stacked bars
        this.data = this.workingdata.map(factor => ({
            factor,
            data: this.#normaliseData(groupedData, factor)
        }));

        this.data = this.data.map(({ factor, data }) => {
            let uniqueCategories = [...new Set(data.map(d => d.category))];

            // Transform data into a structure usable for d3.stack
            let restructuredData = [true, false].map(diagnosis => {
                let obj = { diagnosis };
                uniqueCategories.forEach(category => {
                    obj[category] = data.find(d => d.category === category)?.[diagnosis] || 0;
                });
                return obj;
            });

            return {
                factor,
                stackedYes: d3.stack()
                    .keys(uniqueCategories)
                    (restructuredData.filter(d => d.diagnosis === true)),
                stackedNo: d3.stack()
                    .keys(uniqueCategories)
                    (restructuredData.filter(d => d.diagnosis === false))
            };
        });

        this.bars = this.chart
            .selectAll('.factorGroup')
            .data(this.data)
            .join('g')
            .classed('factorGroup', true)
            .attr('transform', d => `translate(${this.scaleX(d.factor) + this.margin[2]}, 0)`);

        // Bind diagnosis groups directly
        this.bars.each((factorData, i, nodes) => {
            let factorGroup = d3.select(nodes[i]);

            let updateBars = (diagnosis, stackedData) => {
                let diagnosisGroup = factorGroup.selectAll(`.diagnosisGroup-${diagnosis}`)
                    .data(stackedData)
                    .join('g')
                    .classed('diagnosisGroup', true)
                    .classed(diagnosis, true)
                    .attr('transform', `translate(${this.subScaleX(diagnosis)}, ${this.margin[0]})`);

                let bars = diagnosisGroup.selectAll('rect.bars')
                    .data(d => d, d => d.data.category);

                bars.enter()
                    .append('rect')
                    .classed('bars', true)
                    .attr('x', 0)
                    .attr('width', this.subScaleX.bandwidth())
                    .attr('y', this.scaleY(0))
                    .attr('height', 0)
                    .merge(bars)
                    .transition().duration(500) // Growing duration
                    .attr('y', d => this.scaleY(d[1]))
                    .attr('height', d => this.scaleY(d[0]) - this.scaleY(d[1]))
                    .attr("fill", (d, i, nodes) => {
                        let count = d3.select(nodes[i].parentNode).datum()[0][1] - d3.select(nodes[i].parentNode).datum()[0][0];
                        d3.select(nodes[i]).classed(`count-${count}`, true);
                        d3.select(nodes[i]).classed(`category-${d3.select(nodes[i].parentNode).datum().key}`, true);
                        return this.colorScale[d3.select(nodes[i].parentNode).datum().index];
                    });

                bars.exit().remove();
            };

            updateBars(true, factorData.stackedYes);
            updateBars(false, factorData.stackedNo);
        });
    }


    //--- updateScales -------------------------------------------------------------------
    // This function updates the scales used to position and size the chart elements
    // based on the data.
    // \return {void} - No return
    #updateScales() {
        let chartWidth = this.width - this.margin[2] - this.margin[3];
        let chartHeight = this.height - this.margin[0] - this.margin[1];

        this.scaleX = d3.scaleBand()
            .domain(this.workingdata)
            .range([0, chartWidth])
            .padding(0.15);

        this.scaleY = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.count)])
            .range([chartHeight, 0])
            .nice();

        this.subScaleX = d3.scaleBand()
            .domain([true, false])
            .range([0, this.scaleX.bandwidth()])
            .padding(0.1);
    }


    //--- #updateAxes ---------------------------------------------------------
    // This private method updates the axes of the chart based on the current data.
    // \return {void} - No return.
    #updateAxes() {
        // Main X axis
        this.axisX.call(
            d3.axisBottom(this.scaleX)
                .tickSize(15)
                .tickFormat(d => (d.charAt(0).toUpperCase() + d.slice(1)).replaceAll("_", " "))
        );

        this.axisX.selectAll(".tick text")
            .attr("dy", "10px")
            .style('font-weight', 'bold');

        const offset = 175;

        for (let i = 0; i < 4; i++) {
            // Append a new group for each sub-axis
            const subAxisGroup = this.svg.append("g")  // Assuming 'this.svg' is the parent SVG element
                .attr("class", "subAxisX")  // Optional: for styling and identification
                .attr('transform', `translate(${this.margin[2] * 1.4 + i * offset},${this.height - this.margin[1]})`);

            subAxisGroup.call(
                d3.axisBottom(this.subScaleX)
                    .tickSizeOuter(0)
                    .tickFormat(d => {
                        if (d === true) return "Alzheimer";
                        if (d === false) return "No Alzheimer";
                        return d;
                    })
            );
        }
        this.axisY.call(d3.axisLeft(this.scaleY));
    }


    //--- #updateLegend ---------------------------------------------------------
    // This private method updates the legend based on the current data.
    // \return {void} - No return.
    #updateLegend() {
        let legendContainer = d3.select(".legend");
        legendContainer.selectAll('*').remove();
        this.legend = legendContainer.selectAll("g")
            .data(this.data)
            .join('g')
            .classed('legends', true);

        this.legend.each((factorData, i, nodes) => {
            d3.select(nodes[i])
                .append("text")
                .classed("legend-title", true)
                .text((factorData.factor.charAt(0).toUpperCase() + factorData.factor.slice(1)).replaceAll("_", " ") + ": ");

            factorData.stackedNo.forEach((category, index) => {
                let categoryGroup = d3.select(nodes[i]).append('svg')
                    .classed("legend-item", true)
                    .attr('width', 200)
                    .attr('height', 20);

                categoryGroup.append('circle')
                    .attr('cx', 10)
                    .attr('cy', 5)
                    .attr('r', 5)
                    .classed("legend-circle", true)
                    .style('fill', this.colorScale[index]);

                categoryGroup.append('text')
                    .attr('x', 20)
                    .attr('y', 10)
                    .style('font-size', '12px')
                    .text(category.key);
            });
        });
    }


    //--- #updateButton ---------------------------------------------------------
    // This private method updates the filter button's appearance and functionality.
    // \return {void} - No return.
    #updateButton() {
        let buttonContainer = d3.select(".filter-button");

        this.button = buttonContainer.selectAll("button")
            .data([this.buttonval]);

        this.button.enter()
            .append("button")
            .merge(this.button)
            .text(d => d)
            .attr("value", d => d)
            .attr("class", "grouped-button");
    }


    //--- #updateEvents ---------------------------------------------------------
    // This private method updates the event listeners for the chart elements, including mouse hover and click events.
    // \return {void} - No return.
    #updateEvents() {

        let hideTooltip = () => {
            d3.select(".tooltip").remove();
        };

        this.bars.on('mouseover', (event, d) => {
            let factor = (d.factor.charAt(0).toUpperCase() + d.factor.slice(1)).replaceAll("_", " ");
            let diagnosis = event.target.parentNode.classList.contains(true) ? true : false;
            let categoryKey = Array.from(event.target.classList)
                .find(className => className.startsWith('category-'))
                .substring('category-'.length);

            let count = Array.from(event.target.classList)
                .find(className => className.startsWith('count-'))
                .substring('count-'.length);

            d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background-color", "#fff")
                .style("border", "1px solid #ccc")
                .style("padding", "5px")
                .style("border-radius", "3px")
                .style("box-shadow", "0 0 5px rgba(0, 0, 0, 0.2)")
                .style("opacity", 0.9)
                .html(`<strong>Factor:</strong> ${factor} <br><strong>Diagnosis:</strong> ${diagnosis} <br><strong>Category:</strong> ${categoryKey} <br><strong>Count:</strong> ${count}`)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY + 5}px`);

            this.mouseHover(event, d);
        })
            .on('mouseout', () => {
                hideTooltip();
                this.mouseLeave();
            });

        d3.select(".filter-button")
            .on('click', (e, d) => {
                this.buttonClick(e, d);
            });
    }

    //------------------------------------- Public API --------------------------------------//

    //--- render ---------------------------------------------------------
    // This public method renders the chart with the provided dataset and filter option, updating all necessary elements.
    // \param {Map} dataset - The data to be visualised, in a grouped format.
    // \param {string} filter - The filter option to adjust the appearance of the chart.
    // \return {Object} - Returns the current object for method chaining.
    render(dataset, filter) {

        this.buttonval = filter;
        this.dataset = dataset;

        this.data = [];

        for (let [diagnosis, subGroups] of this.dataset) {
            this.workingdata = Object.keys(subGroups).slice(0, 4);
            for (let factor in subGroups) {
                for (let [value, count] of subGroups[factor]) {
                    this.data.push({ diagnosis, factor, value, count });
                }
            }
        }

        if (this.buttonval == "Filter by external factors")
            this.colorScale = ["#d1e5f0", "#4393c3", "#0e345b"];
        if (this.buttonval == "Filter by social factors")
            this.colorScale = ["#fee0d2", "#fc9272", "#de2d26"]


        this.#updateScales();
        this.#updateAxes();
        this.#updateBars();
        this.#updateButton();
        this.#updateLegend();
        this.#updateEvents();

        return this;  // to allow chaining
    }

    //------------------------------------- Setters --------------------------------------//

    //--- setTitle ---------------------------------------------------------
    // This public method sets the title of the chart.
    // \param {string} title - The title to be displayed on the chart. Defaults to an empty string if not provided.
    // \return {Object} - Returns the current object for method chaining.
    setTitle(title = "") {
        this.title.text(title)
            .attr("y", -20);
        return this;
    }

    //--- setButtonClick ---------------------------------------------------------
    // This public method sets the callback function for the button click event. The provided function is called when the button is clicked.
    // \param {Function} f - The callback function to be executed on button click.
    // \return {Object} - Returns the current object for method chaining.
    setButtonClick(f = () => { }) {
        this.buttonClick = f;
        this.#updateEvents();
        return this;
    }


    //--- setMouseHover ---------------------------------------------------------
    // This public method sets the callback function for the mouse hover event. The provided function is called when the mouse hovers over a bar.
    // \param {Function} f - The callback function to be executed on mouse hover.
    // \return {Object} - Returns the current object for method chaining.
    setMouseHover(f = () => { }) {
        this.mouseHover = f;
        this.#updateEvents();
        return this;
    }


    //--- setMouseLeaver ---------------------------------------------------------
    // This public method sets the callback function for the mouse leave event. The provided function is called when the mouse leaves a bar.
    // \param {Function} f - The callback function to be executed on mouse leave.
    // \return {Object} - Returns the current object for method chaining.
    setMouseLeaver(f = () => { }) {
        this.mouseLeave = f;
        this.#updateEvents();
        return this;
    }

    //------------------------------------- Getters --------------------------------------//

    //--- getBars ---------------------------------------------------------
    // This public method returns the current selection of bars in the chart.
    // \return {Selection} - Returns the d3 selection of bars.
    getBars() {
        return this.bars;
    }
}