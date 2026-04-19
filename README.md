# README

## Project Description
This project is a data visualisation web application designed to analyse factors related to Alzheimer's disease prediction. Using D3.js, the application provides interactive visualisations to explore various demographic and health-related trends associated with Alzheimer's. The dataset includes information on gender, country, comorbidities, and external/social factors that may influence the disease.

## Project Structure
The project is organised as follows:

```
.
|   index.html
|   README.md
|
+---data
|       alzheimers_prediction_dataset_clean.csv
|
+---libs
|   \---d3
|           d3.v7.min.js
|           LICENSE
|
+---scripts
|       BarChart.js
|       DataManager.js
|       GroupedBarchart.js
|       LineChart.js
|       main.js
|       map.js
|
\---styles
        barchart.css
        groupedbarchart.css
        linechart.css
        main.css
```

### File Descriptions

- **index.html**: The main webpage that loads the application.
- **README.md**: Project documentation, including structure and explanations of files.

#### Key Directories

- **data/**: Contains the dataset used for visualisation.
- **libs/**: External libraries used in the project.
  - `d3.v7.min.js`: Minified version of D3.js for data visualisation.
  - `LICENSE`: License for D3.js.
- **scripts/**: JavaScript files that handle data processing and visualisation.
  - `main.js`: The main script that initialises and coordinates the various charts.
  - `DataManager.js`: Loads and manages the dataset, providing functions for filtering and extracting relevant data.
  - `LineChart.js`: Handles the rendering of the line chart, which visualises trends in Alzheimer's cases based on age and gender.
  - `map.js`: Manages the choropleth map, displaying Alzheimer's data geographically and enabling country-based filtering.
  - `BarChart.js`: Renders bar charts that compare the prevalence of Alzheimer's among individuals with and without comorbidities.
  - `GroupedBarchart.js`: Displays a grouped bar chart to compare social and external factors affecting Alzheimer's diagnosis.
- **styles/**: CSS files that style the visualisations and the main application.
  - `barchart.css`: Styles for bar charts.
  - `groupedbarchart.css`: Styles for grouped bar charts.
  - `linechart.css`: Styles for the line chart.
  - `main.css`: Global styles for the application.

## Dependencies and Installation
### Prerequisites
- Any recent web browser
- A local server (to avoid CORS restrictions when loading local files)

### Installation
1. Clone the GitLab repository:
   ```sh
   git clone <repository_url>
   ```
2. Start a local server (e.g Live Server extension on Visual Studio Code):
   Then access `http://localhost:5500/`.

## License
This project uses D3.js, whose license is included in the `libs/d3/` directory.

The dataset is set under the MIT license mentioning the following ([https://www.mit.edu/\~amini/LICENSE.md](https://www.mit.edu/~amini/LICENSE.md)):

```
# Released under MIT License

Copyright (c) 2013 Mark Otto.

Copyright (c) 2017 Andrew Fong.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

As this is a school project, it has no other purpose than to demonstrate our skills in data visualisation. Hence, the use of this dataset is justified and falls within the scope of fair use.

## Details to note on the Gitlab Logs

- **Voidhi** is LAKOMICKI Laura
- **Jean-de-la-tonnelière** is PORCHER Jeanne
