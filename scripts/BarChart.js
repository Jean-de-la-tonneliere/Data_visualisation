
export default class BarChart {

    // Attributes
    width; height; margin;                         // Size 
    svg; chart; bars; buttonsval; buttons; title;  // Selections 
    scaleX; scaleY;                             // Scales

    data; dataset; diagnostic;                     // internal data 
    pathData;
    selection;
    percentages;
    percentage_medium;
    container;

    buttonClick = () => { };
    // Constructor
    // margin -> [top, bottom, left, right]
    constructor(container, width, height, margin) {

        this.width = width;
        this.height = height;
        this.margin = margin;
        this.container = container;

        this.svg = d3.select(this.container)
            .append('svg')
            .classed('visu barchart', true)
            .attr('width', this.width)
            .attr('height', this.height);


        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

        this.bars = this.chart.selectAll('path.bar');

        this.labels = this.chart.selectAll('text.label');

        this.title = this.svg.append('text')
            .classed('title', true)
            .attr('transform', `translate(${this.width / 2},${this.margin[0]})`)
            .style('text-anchor', 'middle');

    }

    //------------------------------------- Private methods --------------------------------------//

    //--- #updateBars ---------------------------------------------------------
    // This function updates the grid of bars representing data visually. It calculates the number of bars 
    // based on each factor and positioning accordingly.
    // \param {void} - No parameters.
    // \return {void} - No return value.
    #updateBars() {
        let cols = 5, rows = 4;
        let spacingX = this.width / (cols + 5);
        let spacingY = this.height / (rows + 0);
        let nb_path, nb_path_m;
        let gridData = [];

        let pathData = "M23,-220 A5,5 0 1,1 46,-220 A5,5 0 1,1 23,-220 " +
            "M20,-200 h20 h10 v30 h-5 v-25 h-4 v60 h-5 v-30 h-4 v30 " +
            "h-5 v-60 h-5 v25 h-5 v-30 h5 z";

        if (this.selection === "Cholesterol_level") {
            this.percentages = Math.round((this.data.get("High") / (this.data.get("High") + this.data.get("Normal"))) * 100);
            nb_path = Math.round(this.percentages * 20 / 100); // number of human symbols corresponding to a High level of cholesterol

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {

                    gridData.push({
                        x: col * spacingX,
                        y: row * spacingY,
                        nb_1: nb_path ? nb_path-- : -1, //High Level
                        nb_2: 0
                    });
                }
            }
        }
        else if (this.selection === "Depression_level") {
            this.percentages = Math.round((this.data.get("High") / (this.data.get("High") + this.data.get("Medium") + this.data.get("Low"))) * 100);
            this.percentage_medium = Math.round((this.data.get("Medium") / (this.data.get("High") + this.data.get("Medium") + this.data.get("Low"))) * 100);
            nb_path = this.percentages * 20 / 100;   // Number of body that they have to be colored for the High level
            nb_path_m = this.percentage_medium * 20 / 100;  // Number of body that they have to be colored for the Medium level
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {

                    gridData.push({
                        x: col * spacingX,
                        y: row * spacingY,
                        nb_1: nb_path ? nb_path-- : -1,// High level
                        nb_2: nb_path_m ? nb_path_m++ : -1, // Medium level
                    });
                }
            }
        }
        else {

            this.percentages = Math.round((this.data.get("Yes") / (this.data.get("No") + this.data.get("Yes"))) * 100); // Percentage of people who have the disease corresponding of the button selcetioned 
            nb_path = Math.round(this.percentages * 20 / 100);  // Number of body that they have to be colored

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {

                    gridData.push({
                        x: col * spacingX,
                        y: row * spacingY,
                        nb_1: nb_path ? nb_path-- : -1, // Have the disease
                        nb_2: 0
                    });

                }
            }
        }

        this.bars = this.bars
            .data(gridData)
            .join('path')
            .classed('bar', true)
            .attr("d", pathData)    // Drawing the "body" of the human symbol
            .attr("stroke", "black")
            .style("fill", d => {
                if (d.nb_1 > 0) return "#ef8a62";
                if (d.nb_2 > 13 && d.nb_2 < 19) return "#67a9cf";
                return "#dedede";
            })
            .attr("stroke-width", 5)
            .attr("transform", (d) => `translate(${d.x - this.margin[2]},${d.y})`);
    }


    //--- #updateLabels ---------------------------------------------------------
    // This function updates the labels displayed on the chart based on the selected factor adn  dynamically generates the label content. 
    // \param {void} - No parameters.
    // \return {void} - No return value.
    #updateLabels() {

        this.labels = this.labels
            .data(this.data)
            .join('text')
            .classed('commorbidities-label', true)
            .attr('transform', d => `translate(${this.margin[2] - this.margin[2] - this.width / 2},${- this.height / 10})`);

        this.labels.selectAll("tspan")
            .data(d => {

                if (this.selection === "Cholesterol_level") {

                    return [
                        `${(this.selection.charAt(0).toUpperCase() + this.selection.slice(1)).replaceAll("_", " ")}:`,
                        `High = ${this.percentages}% (in orange)`,
                        `Normal = ${100 - this.percentages}% (in grey)`
                    ];
                }
                if (this.selection === "Depression_level") {
                    return [
                        `${(this.selection.charAt(0).toUpperCase() + this.selection.slice(1)).replaceAll("_", " ")}:`,
                        `High = ${this.percentages}% (in orange)`,
                        `Medium = ${this.percentage_medium}% (in blue)`,
                        `Low = ${100 - this.percentages - this.percentage_medium}% (in grey)`
                    ];
                }
                else {

                    return [
                        `${(this.selection.charAt(0).toUpperCase() + this.selection.slice(1)).replaceAll("_", " ")}:`,
                        `${this.percentages}% are afffected (in orange)`,
                        `${100 - this.percentages}% are not afffected (in grey)`
                    ];
                }

            })
            .join("tspan")
            .attr("x", 0)
            .attr("dy", (d, i) => {
                if (i === 0) {
                    return 0;  // No vertical offset for the first line
                }
                return i === 1 ? "2.2em" : "1.2em";  // Add extra space (line break effect) after the first line
            })
            .text(d => d)
            .style("font-weight", (d, i) => i === 0 ? "bold" : "normal")
            .style("font-size", (d, i) => i === 0 ? "16px" : "14px")
    }


    //--- #removeLabels ---------------------------------------------------------
    // This function removes all <tspan> elements associated with the labels.
    // \param {void} - No parameters.
    // \return {void} - No return value.
    #removeLabels() {
        // Progressive removal of old <tspan>.
        this.labels.selectAll("tspan")
            .remove();
    }


    //--- #updateButtons ---------------------------------------------------------
    // This function updates the buttons in the user interface based on the diagnostic status. 
    // If diagnostic is true, it formats and adds new buttons. Otherwise, it simply ensures the existing buttons are maintained.
    // \param {void} - No parameters.
    // \return {void} - No return value.
    #updateButtons() {
        let buttonSelection = d3.select(".comorbidities-buttons").selectAll("button");

        if (this.diagnostic === true) {
            let cleanedbuttonsval = this.buttonsval.map(item => (item.charAt(0).toUpperCase() + item.slice(1)).replaceAll("_", " "));
            buttonSelection = buttonSelection.data(this.buttonsval, d => d);
            this.buttons = buttonSelection.enter().append("button").merge(buttonSelection).text((d, i) => cleanedbuttonsval[i]).attr("value", d => d).attr("class", "button");
        }
        else {
            this.buttons = buttonSelection;  // We get the existing buttons
        }
        this.#updateEvents();
    }

    //--- #updateEvents ---------------------------------------------------------
    // This function updates the event listeners for the buttons, assigning a click event handler to each button.
    // When a button is clicked, the buttonClick function is called with the event and the associated data.
    // \param {void} - No parameters.
    // \return {void} - No return value.
    #updateEvents() {
        this.buttons = d3.select(".comorbidities-buttons").selectAll("button");
        this.buttons.on('click', (e, d) => {
            this.buttonClick(e, d);
        });
    }

    //------------------------------------- Public API --------------------------------------//

    //--- render ---------------------------------------------------------
    // This function initialises or updates the visualisation based on the provided dataset and diagnostic status. 
    // It filters the dataset based on the diagnostic condition and computes aggregated data for the selected factor.
    // It then updates the buttons, bars, and labels.
    // \param {Array} dataset - The dataset containing the data to be visualised.
    // \param {boolean} diagnostic - The diagnosis condition, used to filter the dataset.
    // \return {Object} - Returns the current object for method chaining.
    render(dataset, diagnostic) {
        this.dataset = dataset;

        if (this.dataset.length != 0)
            this.buttonsval = Object.keys(this.dataset[0]).slice(0, 6);
        this.diagnostic = diagnostic;

        this.data = d3.rollup(
            this.dataset.filter(d => d.has_alzheimer_diagnosis === diagnostic), D => D.length, d => d.Diabete
        );
        this.selection = "Diabete"; //The first pathology selected must always be diabetes

        this.#updateButtons();
        this.#updateBars();
        this.#updateLabels();
        return this; // to allow chaining 
    }


    //--- changeSelection ---------------------------------------------------------
    // This function allows the user to change the selected factor. 
    // It updates the data based on the new selection and re-renders the bars and labels accordingly.
    // \param {string} newselection - The new selected factor.
    // \return {void} - No return value.
    changeSelection(newselection) {
        this.selection = newselection;
        this.data = d3.rollup(
            this.dataset.filter(d => d.has_alzheimer_diagnosis === this.diagnostic),
            D => D.length,
            d => d[newselection]
        );

        this.#updateBars();
        this.#removeLabels();
        this.#updateLabels();
    }

    //------------------------------------- Setters --------------------------------------//

    //--- setTitle ---------------------------------------------------------
    // This function sets the title of the visualisation based on the provided input.
    // \param {string} title - The title text to be displayed in the visualisation. Default is an empty string.
    // \return {Object} - Returns the current object for method chaining.
    setTitle(title = '') {
        this.title.text(title);
        return this;
    }


    //--- setButtonClick ---------------------------------------------------------
    // This function sets the callback function for button clicks. It allows for custom behavior when a button is clicked, 
    // and updates the event listeners accordingly.
    // \param {Function} f - The callback function to be executed when a button is clicked. Default is an empty function.
    // \return {Object} - Returns the current object for method chaining.
    setButtonClick(f = () => { }) {
        this.buttonClick = f;
        this.#updateEvents();
        return this;
    }
}
