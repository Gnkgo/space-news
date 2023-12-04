import * as d3 from 'd3';

interface TemperatureData {
    terrestrial_date: string;
    min_temp: string;
    max_temp: string;
    min_temp_fahrenheit: string;
    max_temp_fahrenheit: string;
}

export function extractAndDisplayTemperature(data: TemperatureData[], isCelcius: boolean): void {
    // Extract relevant information
    const dates: Date[] = [];
    const averagesCelsius: number[] = [];
    const averagesFahrenheit: number[] = [];



    // Extract data for the last seven days
    for (const entry of data) {
        const date = new Date(entry.terrestrial_date);
        dates.push(date);
        const min = parseInt(entry.min_temp, 10);
        const max = parseInt(entry.max_temp, 10);
        const minFahrenheit = parseInt(entry.min_temp_fahrenheit, 10);
        const maxFahrenheit = parseInt(entry.max_temp_fahrenheit, 10);
        averagesFahrenheit.push((minFahrenheit + maxFahrenheit) / 2);
        averagesCelsius.push((min + max) / 2);
    }
    const averages = isCelcius ? averagesCelsius : averagesFahrenheit;
    const text = isCelcius ? '°C' : '°F';



    // Set up the dimensions and margins for the SVG
    const margin = { top: 20, right: 20, bottom: 0, left: 80 };
    let containerWidth = window.innerWidth;

    const height = 300;
    const removeHeight = 80;
    // Create the SVG container
    const svg = d3.select('#mars-container').select('main').append('svg')
        .attr('class', 'grey-box')
        .attr('width', containerWidth)
        .attr('height', height - margin.top - margin.bottom + 35)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales for x and y axes
    const xScale = d3.scaleTime()
        .domain(d3.extent(dates) as [Date, Date])
        .range([0, containerWidth - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([Math.min(...averages), Math.max(...averages)])
        .range([height - removeHeight - margin.top - margin.bottom, 0]);

    // Create x and y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append x and y axes to the SVG
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height - removeHeight - margin.top - margin.bottom})`)
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

    // Create line generator for average temperatures
    const avgLine = d3.line<any>()
        .x((d: any) => xScale(dates[d]!))
        .y((d: any) => yScale(averages[d]!));

    // Create a clipPath element
    svg.append('clipPath')
        .attr('id', 'clip-path')
        .append('rect')
        .attr('width', containerWidth - margin.left - margin.right)
        .attr('height', height - removeHeight - margin.top - margin.bottom);


    // Append path for average temperature line
    svg.append('path')
        .data([d3.range(dates.length)])
        .attr('class', 'line avg-line')
        .attr('d', avgLine)
        .attr('clip-path', 'url(#clip-path)')  // Use the clipPath
        .style('stroke', 'white')
        .style('fill', 'none');


    svg.append('text')
        .attr('transform', `translate(${(containerWidth - margin.left - margin.right - 100) / 2},${height - removeHeight - margin.top + 50})`) // Adjust the y-coordinate to move the label higher
        .style('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '1rem') // Adjust the font size as needed
        .text('Date');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height - removeHeight - margin.top - margin.bottom) / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '1rem') // Adjust the font size as needed
        .text(`Temperature ${text}`);



    // Define a zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 40])
        .translateExtent([[0, 0], [containerWidth, height]])
        .extent([[0, 0], [containerWidth, height]])
        .on('zoom', zoomed);



    // Apply zoom behavior to the SVG container
    const zoomableSvg = svg.call(zoom as any);

    // Create a rect to capture zoom events
    zoomableSvg.append('rect')
        .attr('width', containerWidth)
        .attr('height', height - removeHeight - margin.top - margin.bottom)
        .style('fill', 'none')
        .style('pointer-events', 'all');

        
    function zoomed(event: d3.D3ZoomEvent<SVGElement, unknown>) {
        // Update xScale and yScale based on the zoom event, clamping to the original domain
        const newTransform = event.transform;

        const newXScale = newTransform.rescaleX(xScale);
        const newYScale = newTransform.rescaleY(yScale);


        // Update x-axis
        (svg.select('.x-axis') as d3.Selection<SVGGElement, any, any, any>)
            .call(xAxis.scale(newXScale));

        // Update x-axis
        (svg.select('.y-axis') as d3.Selection<SVGGElement, any, any, any>)
            .call(yAxis.scale(newYScale));

        avgLine.x((d: any) => newXScale(dates[d]!))
            .y((d: any) => newYScale(averages[d]!));


        // Update average temperature line
        svg.select('.avg-line')
            .data([d3.range(dates.length)])
            .attr('d', avgLine);
    }



    // Resize function
    function handleResize() {
        // Update container width based on the window size
        containerWidth = window.innerWidth;

        // Update SVG container size
        svg.attr('width', containerWidth);

        // Update xScale and width
        xScale.range([0, containerWidth - margin.left - margin.right - 100])
            .domain(d3.extent(dates) as [Date, Date]);

        // Update x-axis
        (svg.select('.x-axis') as d3.Selection<SVGGElement, any, any, any>)
            .attr('transform', `translate(0,${height - removeHeight - margin.top - margin.bottom})`)
            .call(xAxis);

        // Update line generator
        const avgLine = d3.line<any>()
            .x((d: any) => xScale(dates[d]!))
            .y((d: any) => yScale(averages[d]!));

        // Update average temperature line
        svg.select('.avg-line')
            .data([d3.range(dates.length)])
            .attr('d', avgLine);
    }

    // Attach the resize function to the window resize event
    d3.select(window).on('resize', handleResize);

    // Call the handleResize function once at the beginning
    handleResize();
}
