import * as d3 from 'd3';

export interface TemperatureData {
    terrestrial_date: string;
    min_temp: string;
    max_temp: string;
    min_temp_fahrenheit: string;
    max_temp_fahrenheit: string;
    isCelcius: boolean;
}

export function extractAndDisplayTemperature(data: TemperatureData[], isCelcius: boolean): void {

    // Extract relevant information
    const dates: Date[] = [];
    const averagesCelsius: number[] = [];
    const averagesFahrenheit: number[] = [];



    // Inside the loop for extracting data
    for (const entry of data) {
        const date = new Date(entry.terrestrial_date);
        dates.push(date);

        // Parsing with error checking
        const parseTemp = (tempString: string) => {
            const temp = parseFloat(tempString);
            return isNaN(temp) ? null : temp;
        };

        const min = parseTemp(entry.min_temp);
        const max = parseTemp(entry.max_temp);
        const minFahrenheit = parseTemp(entry.min_temp_fahrenheit);
        const maxFahrenheit = parseTemp(entry.max_temp_fahrenheit);

        if (min === null || max === null || minFahrenheit === null || maxFahrenheit === null) {
            console.error(`Error parsing temperature data for date ${entry.terrestrial_date}`);
            // Handle or skip this entry as needed
            continue;
        }

        averagesFahrenheit.push((minFahrenheit + maxFahrenheit) / 2);
        averagesCelsius.push((min + max) / 2);
    }

    const averages = isCelcius ? averagesCelsius : averagesFahrenheit;
    //const text = isCelcius ? '°C' : '°F';



    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#mars-container').select('main').append('svg')
        .attr('class', 'grey-box')
        .attr('width', width)
        .attr('height', height + 40 - margin.top - margin.bottom + 35)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
        .domain(d3.extent(dates) as [Date, Date])
        .range([0, width - margin.left - margin.right])

    const yScale = d3.scaleLinear()
        .domain([Math.min(...averages), Math.max(...averages)])
        .range([height - margin.top - margin.bottom, 0])


    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g").attr("class", "x-axis").attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")").call(xAxis);
    svg.append("g").attr("class", "y-axis").call(yAxis);

    const brush = d3.brushX()
        .extent([[0, 0], [width - margin.left - margin.right - 100, height - margin.top - margin.bottom]])
        .on("brush", brushed)
        .on("end", () => {
            // Call your update function here
            updateTemperature(data);
        });


    const validAverages = averages.filter((value) => !isNaN(value));

    // Create line generator for valid average temperatures
    const line = d3.line<any>()
      //  .x((d: any, i: number) => xScale(dates[i]!))
      //  .y((d: any) => yScale(d))
      //  .curve(d3.curveBasis);

    // Append the path using the valid averages
    svg.append("path")
        .datum(validAverages)
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "white");

    brush.on("end", brushed);

    svg.append("g").attr("class", "brush").call(brush);

    function brushed(event: any) {
        if (!event.selection) return;
    
        const [x0, x1] = event.selection.map(xScale.invert);
    
        // Filter data based on the brush selection
        const filteredData = data.filter((entry) => {
            const date = new Date(entry.terrestrial_date);
            return date >= x0 && date <= x1;
        });
    
        // Check if filteredData contains valid entries
        if (filteredData.length === 0) {
            console.warn('No valid data in the selected range');
            return;
        }
    
        // Update the x-axis scale based on the filtered data
        xScale.domain(d3.extent(filteredData, d => new Date(d.terrestrial_date)) as [Date, Date]);
    
        // Update the y-axis scale based on the filtered data
        yScale.domain([Math.min(...filteredData.map(d => (+d.min_temp + +d.max_temp) / 2)),
                      Math.max(...filteredData.map(d => (+d.min_temp + +d.max_temp) / 2))]);
    
        // Update the displayed temperature for the filtered data
        updateTemperature(filteredData);
    }
    
    
    // ...

    // Add a zoom behavior
    const zoom = d3.zoom().scaleExtent([1, Infinity]).translateExtent([[0, 0], [width, height]]).extent([[0, 0], [width, height]]).on("zoom", zoomed);

    svg.call(zoom as any);

    // ...

    // Redraw the line and axes on zoom
    function zoomed(event: any) {
        const newXScale = event.transform.rescaleX(xScale);

        const newYScale = event.transform.rescaleY(yScale);
        // Update the x-axis with the new scale
        // Update x-axis ticks to display labels for the visible data points
        (svg.select('.x-axis') as d3.Selection<SVGGElement, any, any, any>)
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(xAxis);

        // Update the line with the new scale
        line.x((d: any) => newXScale(dates[d]!))
            .y((d: any) => newYScale(averages[d]!))
            .curve(d3.curveBasis);

        // Update average temperature line
        svg.select('.line')
            .data([d3.range(dates.length)])
            .attr('d', line);
    }

    // ...

    function updateTemperature(filteredData: TemperatureData[]) {
        // Update xScale and width based on the number of visible data points
        xScale.range([0, width - margin.left - margin.right - 100])
            .domain(d3.extent(filteredData, d => new Date(d.terrestrial_date)) as [Date, Date]);
    
        // Update yScale based on the filtered data
        yScale.domain([Math.min(...filteredData.map(d => (+d.min_temp + +d.max_temp) / 2)),
                      Math.max(...filteredData.map(d => (+d.min_temp + +d.max_temp) / 2))]);
    
        // Update x-axis ticks to display labels for the visible data points
        (svg.select('.x-axis') as d3.Selection<SVGGElement, any, any, any>)
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(xAxis);
    
        svg.select('.x-axis')
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');
    
        // Create a new line generator for valid average temperatures
        //const line = d3.line<any>()
        //    .x((d: any, i: number) => xScale(new Date(filteredData[i].terrestrial_date)))
        //    .y((d: any, i: number) => yScale((+filteredData[i].min_temp + +filteredData[i].max_temp) / 2))
        //    .curve(d3.curveBasis);
    //
        // Update average temperature line
        svg.select('.line')
            .datum(d3.range(filteredData.length))
            .attr('d', line);
    }
    




}