import * as d3 from 'd3';

interface TemperatureData {
    terrestrial_date: string;
    min_temp: string;
    max_temp: string;
}

export function extractAndDisplayTemperature(data: TemperatureData[], place: HTMLElement): void {
    // Extract relevant information
    const dates: Date[] = [];
    const averages: number[] = [];

    // Extract data for the last seven days
    for (const entry of data) {
        const date = new Date(entry.terrestrial_date);
        dates.push(date);
        const min = parseInt(entry.min_temp, 10);
        const max = parseInt(entry.max_temp, 10);
        averages.push((min + max) / 2);
    }

    // Set up the dimensions and margins for the SVG
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const containerWidth = window.innerWidth;
    console.log("WIDTH", containerWidth);
    const width = (containerWidth - margin.left - margin.right - 50);
    const height = 150 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select('#mars-container').select('main').append('svg')
        .attr('class', 'grey-box')
        .attr('width', containerWidth)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales for x and y axes
    const xScale = d3.scaleTime()
        .domain(d3.extent(dates) as [Date, Date])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([Math.min(...averages), Math.max(...averages)])
        .range([height, 0]);

    // Create x and y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append x and y axes to the SVG
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text');

    svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .selectAll('text');

    // Create line generator for average temperatures
    const avgLine = d3.line<any>()
        .x((d: any) => xScale(dates[d]!))
        .y((d: any) => yScale(averages[d]!));

    // Append path for average temperature line
    svg.append('path')
        .data([d3.range(dates.length)])
        .attr('class', 'line avg-line')
        .attr('d', avgLine)
        .style('stroke', 'white')
        .style('fill', 'none');

    // Add labels
    svg.append('text')
        .attr('transform', `translate(${width / 2},${height + margin.top + 10})`)
        .style('text-anchor', 'middle')
        .style('fill', 'white')

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - height / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', 'white')
        .text('Temperature (°C)');

    function handleResize() {
        // Update container width based on the window size
        const containerWidth = window.innerWidth;
        console.log("WIDTH", containerWidth);
        const width = containerWidth - margin.left - margin.right - 50;

        // Update SVG container size
        svg.attr('width', containerWidth);


        // Update xScale and width
        xScale.range([0, width])
            .domain(d3.extent(dates) as [Date, Date]);
        
            // Update x-axis
        (svg.select('.x-axis') as d3.Selection<SVGGElement, any, any, any>)
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);

        // Update line generator
        const avgLine = d3.line<any>()
            .x((d: any) => xScale(dates[d]!))
            .y((d: any) => yScale(averages[d]!));

        // Update average temperature line
        svg.select('.avg-line')
            .data([d3.range(dates.length)])
            .attr('d', avgLine);

        // Update labels if needed
        // ...

        // Adjust other elements based on new width and height
        // ...
    }

    // Attach the resize function to the window resize event
    d3.select(window).on('resize', handleResize);

    // Call the handleResize function once at the beginning
    handleResize();
            
            // Update x-axis
            (svg.select('.x-axis') as d3.Selection<SVGGElement, any, any, any>)
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);
}
