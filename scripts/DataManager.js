/**
 * Data Manager class
 */
export default class DataManager {
    myData;

    //--- loadData ------------------------------------------------------------------------
    // This asynchronous function loads and parses a CSV dataset, converting each row into 
    // an object with structured fields. Once the data is loaded, a callback function is 
    // executed.
    // \param {string} path - The file path or URL of the CSV dataset.
    // \param {Function} callback - A function to be executed after data loading is complete.
    // \return {Promise<void>} - No return.
    async loadData(path, callback) {
        this.myData = await d3.csv(path, (r) => {
            // parsing : for each row r, return a new object
            return {
                country: r.Country,
                age: +r.Age,
                gender: r.Gender,
                smoking_status: r.Smoking_Status,
                alcohol_consumption: r.Alcohol_Consumption,
                has_diabetes: r.Diabetes,
                has_hypertension: r.Hypertension,
                cholesterol_level: r.Cholesterol_Level,
                has_family_history: r.Family_History_of_Alzheimer,
                depression_level: r.Depression_Level,
                sleep_quality: r.Sleep_Quality,
                dietary_habits: r.Dietary_Habits,
                air_pollution_exposure: r.Air_Pollution_Exposure,
                has_genetic_risk_factor: r.Genetic_Risk_Factor,
                social_engagement_level: r.Social_Engagement_Level,
                income_level: r.Income_Level,
                stress_level: r.Stress_Levels,
                has_alzheimer_diagnosis: r.Alzheimer_Diagnosis === "Yes"
            };
        });
        callback();
    }

    //---------------------------------- Public Filtering Functions -----------------------------//

    //--- getAgeResult --------------------------------------------------------------------
    // This function filters the dataset based on the provided filters and calculates the 
    // proportion of individuals diagnosed with Alzheimer’s for each age group for the double line chart.
    // \param {Function[]} filtersToApply - An array of filter functions to apply to the data. 
    //                                      Each filter function takes a data row as input and 
    //                                      returns a boolean indicating whether the row should 
    //                                      be included. Defaults to an empty array (no filters).
    // \return {Array} - A sorted array of age groups with their corresponding Alzheimer’s 
    //                   diagnosis rate. Each element is a tuple [age, diagnosisRate].
    getAgeResult(filtersToApply = []) {
        let filteredData = this.myData.filter(d => {
            return filtersToApply.every(filter => filter(d))
        });

        return d3.rollups(filteredData,
            d => (d3.sum(d, v => v.has_alzheimer_diagnosis)) / d.length,
            d => d.age
        ).sort((a, b) => a[0] - b[0]); // to sort by age the array
    }

    //--- getComorbidityFactor ------------------------------------------------------------
    // This function filters the dataset based on the selected country and age range, 
    // and then maps the filtered data to include specific comorbidity factors for each individual.
    // \param {string|boolean} Country - The selected country for filtering data. 
    //                                   If false, data is not filtered by country.
    // \param {number[]} ages - An array containing the selected age range [minAge, maxAge].
    // \return {Object[]} - A list of objects containing comorbidity factors
    //                      for individuals in the specified age range and country.
    getComorbidityFactor(Country, ages) {
        let filteredData_country;

        if (ages[0] == 0 && ages[1] == 0) {
            if (Country == false)
                filteredData_country = this.myData;
            else
                filteredData_country = this.myData.filter(d => d.country === Country);
        }
        else {
            if (Country == false)
                filteredData_country = this.myData.filter(d => (d.age >= ages[0] && d.age <= ages[1]));
            else
                filteredData_country = this.myData.filter(d => d.country === Country).filter(d => (d.age >= ages[0] && d.age <= ages[1]));
        }
        // Apply mapping only to filtered data
        let filteredData = filteredData_country.map(d => ({
            Diabete: d.has_diabetes,
            Hypertension: d.has_hypertension,
            Cholesterol_level: d.cholesterol_level,
            Family_History: d.has_family_history,
            Depression_level: d.depression_level,
            Genetic_Risk_factor: d.has_genetic_risk_factor,
            has_alzheimer_diagnosis: d.has_alzheimer_diagnosis
        }));
        return filteredData;
    }

    //--- getExternalFactors -------------------------------------------------------------
    // This function filters the dataset based on the selected country and age range, 
    // then extracts and groups external factors by Alzheimer's diagnosis status.
    // \param {string|boolean} Country - The selected country for filtering data. 
    //                                   If false, data is not filtered by country.
    // \param {number[]} ages - An array containing the selected age range [minAge, maxAge].
    // \return {Map} - A Map object where keys are Alzheimer's diagnosis status (true/false), 
    //                 and values are sub-groups of external factors grouped by their values.
    getExternalFactors(Country, ages) {
        let filteredData_country;
        if (ages[0] == 0 && ages[1] == 0) {
            if (Country == false)
                filteredData_country = this.myData;
            else
                filteredData_country = this.myData.filter(d => d.country === Country);
        }
        else {
            if (Country == false)
                filteredData_country = this.myData.filter(d => (d.age >= ages[0] && d.age <= ages[1]));

            else
                filteredData_country = this.myData.filter(d => d.country === Country).filter(d => (d.age >= ages[0] && d.age <= ages[1]));
        }

        // Extract external factors
        let external_factors = filteredData_country.map(d => ({
            smoking_status: d.smoking_status,
            alcohol_consumption: d.alcohol_consumption,
            air_pollution_exposure: d.air_pollution_exposure,
            dietary_habits: d.dietary_habits,
            has_alzheimer_diagnosis: d.has_alzheimer_diagnosis
        }));

        let formatted_external_factor = d3.rollup(
            external_factors,
            v => {
                let subGroups = {};
                // Group by each factor's values
                Object.keys(external_factors[0]).forEach(factor => {
                    subGroups[factor] = d3.rollup(v, v2 => v2.length, d => d[factor]);
                });

                return subGroups;
            },
            d => d.has_alzheimer_diagnosis // Group by Alzheimer diagnosis status
        );

        return formatted_external_factor;
    }

    //--- getSocialFactors --------------------------------------------------------------
    // This function filters the dataset based on the selected country and age range, 
    // then extracts and groups social factors by Alzheimer's diagnosis status.
    // \param {string|boolean} Country - The selected country for filtering data. 
    //                                   If false, data is not filtered by country.
    // \param {number[]} ages - An array containing the selected age range [minAge, maxAge].
    // \return {Map} - A Map object where keys are Alzheimer's diagnosis status (true/false), 
    //                 and values are sub-groups of social factors grouped by their values.
    getSocialFactors(Country, ages) {
        let filteredData_country;
        if (ages[0] == 0 && ages[1] == 0) {
            if (Country == false)
                filteredData_country = this.myData;
            else
                filteredData_country = this.myData.filter(d => d.country === Country);
        }
        else {
            if (Country == false)
                filteredData_country = this.myData.filter(d => (d.age >= ages[0] && d.age <= ages[1]));
            else
                filteredData_country = this.myData.filter(d => d.country === Country).filter(d => (d.age >= ages[0] && d.age <= ages[1]));
        }

        let social_factors = filteredData_country.map(d => ({
            social_engagement_level: d.social_engagement_level,
            income_level: d.income_level,
            stress_level: d.stress_level,
            sleep_quality: d.sleep_quality,
            has_alzheimer_diagnosis: d.has_alzheimer_diagnosis
        }));

        let formatted_social_factor = d3.rollup(
            social_factors,
            (v) => {
                let subGroups = {};
                // Group by each factor's values
                Object.keys(social_factors[0]).forEach(factor => {
                    subGroups[factor] = d3.rollup(v, v2 => v2.length, d => d[factor]);
                });
                return subGroups;
            },
            (d) => d.has_alzheimer_diagnosis
        );
        return formatted_social_factor;
    }

    //--- getMap ------------------------------------------------------------------------
    // This function filters the dataset based on the provided age range and calculates 
    // the percentage of people diagnosed with Alzheimer's in each country. 
    // \param {number[]} ages - An array containing the selected age range [minAge, maxAge].
    //                          If both ages are 0, no age filtering is applied.
    // \return {Object[]} - An array of objects, where each object represents a country 
    //                      and the percentage of individuals diagnosed with Alzheimer's in that country.
    getMap(ages) {
        let filteredage;
        let country;

        // Transform in an array of Objects
        if (ages[0] == 0 && ages[1] == 0) {
            const countryData = d3.rollup(this.myData,
                v => (d3.sum(v, d => d.has_alzheimer_diagnosis === true) / v.length) * 100,
                d => d.country,
            );

            country = Array.from(countryData, ([Country, has_alzheimer_diagnosis]) => ({
                Country,
                has_alzheimer_diagnosis
            }));
        }
        else {
            filteredage = this.myData.filter(d => (d.age >= ages[0] && d.age <= ages[1]));
            const countryData = d3.rollup(filteredage,
                v => (d3.sum(v, d => d.has_alzheimer_diagnosis === true) / v.length) * 100,
                d => d.country,
            );

            country = Array.from(countryData, ([Country, has_alzheimer_diagnosis]) => ({
                Country,
                has_alzheimer_diagnosis
            }));
        }
        return country;
    }
}