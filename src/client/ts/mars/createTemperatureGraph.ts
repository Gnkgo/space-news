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
    const margin = { top: 20, right: 20, bottom: 10, left: 80 };
    let containerWidth = window.innerWidth;

    const height = 140;
    // Create the SVG container
    const svg = d3.select('#mars-container').select('main').append('svg')
        .attr('class', 'grey-box')
        .attr('width', containerWidth)
        .attr('height', height + 40 - margin.top - margin.bottom + 35)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    //const tooltip = d3.select('#mars-container').select('main').append('div')
    //    .attr('class', 'tooltip')
    //    .style('opacity', 0);


    const xScale = d3.scaleTime()
        .domain(d3.extent(dates) as [Date, Date])
        .range([0, containerWidth - margin.left - margin.right])

    const yScale = d3.scaleLinear()
        .domain([Math.min(...averages), Math.max(...averages)])
        .range([height - margin.top - margin.bottom, 0])



    const xAxis = d3.axisBottom<Date>(xScale)
        .tickFormat((date: Date) => d3.timeFormat('%b')(date))
        .ticks(5);

    const yAxis = d3.axisLeft(yScale).ticks(5); // Adjust the number of ticks as needed


    // Append x and y axes to the SVG
    svg.append('g')
        .attr('class', 'x-axis')
        .call((xAxis));

    svg.select('.x-axis')
        .selectAll('text')
        .attr('transform', 'rotate(-45)') // Adjust the rotation angle as needed
        .style('text-anchor', 'end'); // Align the rotated text appropriately

    svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

    // Create line generator for average temperatures
    const avgLine = d3.line<any>()
        .x((d: any) => xScale(dates[d]!))
        .y((d: any) => yScale(d))
        .curve(d3.curveBasis);

    // Create a clipPath element
    svg.append('clipPath')
        .attr('id', 'clip-path')
        .append('rect')
        .attr('width', containerWidth - margin.left - margin.right - 100)
        .attr('height', height - margin.top - margin.bottom);


    svg.append('path')
        .data([d3.range(dates.length)])
        .attr('class', 'line avg-line')
        .attr('d', avgLine)
        .attr('clip-path', 'url(#clip-path)')
        .style('stroke', 'white')
        .style('fill', 'none');
  

   // function handleMouseOver(this: SVGSVGElement, event: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
   //     const bisectDate = d3.bisector((d: any) => d).left;
   //     const [mouseX, mouseY] = d3.pointer(event, this);
   //     const invertedX = xScale.invert(mouseX);
   //     const index = bisectDate(dates, invertedX, 1);
   //     const currentTemperature = averages[index];
//
   //     tooltip.transition()
   //         .duration(200)
   //         .style('opacity', 0.9);
//
   //     tooltip.html(`Temperature: ${currentTemperature} ${text}`)
   //         .style('left', (mouseX + margin.left) + 'px') // Adjusted to consider margin.left
   //         .style('top', (mouseY - 28 + margin.top) + 'px'); // Adjusted to consider margin.top
   // }
//
   // function handleMouseOut() {
   //     tooltip.transition()
   //         .duration(500)
   //         .style('opacity', 0);
   // }




    svg.append('text')
        .attr('transform', `translate(${(containerWidth - margin.left - margin.right - 100) / 2},${height - margin.top + 36})`) // Adjust the y-coordinate to move the label higher
        .style('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '1rem')
        .text('Date');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height - margin.top - margin.bottom) / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '1rem')
        .text(`Temperature ${text}`);



    // Define a zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 15])
        .translateExtent([[0, 0], [containerWidth, height]])
        .extent([[0, 0], [containerWidth, height]])
        .on('zoom', zoomed);



    // Apply zoom behavior to the SVG container
    const zoomableSvg = svg.call(zoom as any);

    // Create a rect to capture zoom events
    zoomableSvg.append('rect')
        .attr('width', containerWidth)
        .attr('height', height - margin.top - margin.bottom)
        .style('fill', 'none')
        .style('pointer-events', 'all');


    function zoomed(event: d3.D3ZoomEvent<SVGElement, unknown>) {
        // Update xScale and yScale based on the zoom event, clamping to the original domain
        const newTransform = event.transform;
        const newXScale = newTransform.rescaleX(xScale);
        const newYScale = newTransform.rescaleY(yScale);

        const zoomLevel = newTransform.k;

        // Adjust tick format based on zoom level
        if (zoomLevel <= 1) {
            xAxis.tickFormat(d3.timeFormat('%b')); // Adjust to your desired format after zooming in
        } else {

            xAxis.tickFormat(d3.timeFormat('%b %d')); // Adjust to your desired format after zooming in
        }

        let numTicks = 8;
        if (containerWidth < 700) {
            numTicks = 5;
        }

        // Update x-axis ticks to display labels for the visible data points
        (svg.select('.x-axis') as d3.Selection<SVGGElement, any, any, any>)
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(xAxis.scale(newXScale).ticks(numTicks));

        svg.select('.x-axis')
            .selectAll('text')
            .attr('transform', 'rotate(-45)') // Adjust the rotation angle as needed
            .style('text-anchor', 'end'); // Align the rotated text appropriately

        (svg.select('.y-axis') as d3.Selection<SVGGElement, any, any, any>)
            .call(yAxis.scale(newYScale));

        avgLine.x((d: any) => newXScale(dates[d]!))
            .y((d: any) => newYScale(averages[d]!))
            .curve(d3.curveBasis);

        // Update average temperature line
        svg.select('.avg-line')
            .data([d3.range(dates.length)])
            .attr('d', avgLine);
    }




    // Resize function
    function handleResize() {
        // Update container width based on the window size
        containerWidth = window.innerWidth;
        let numTicks = 8;
        if (containerWidth < 700) {
            numTicks = 5;
        }

        // Update x-axis ticks to display labels for the visible data points
        (svg.select('.x-axis') as d3.Selection<SVGGElement, any, any, any>)
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(xAxis.ticks(numTicks));

        svg.select('.x-axis')
            .selectAll('text')
            .attr('transform', 'rotate(-45)') // Adjust the rotation angle as needed
            .style('text-anchor', 'end'); // Align the rotated text appropriately


        // Update SVG container size
        svg.attr('width', containerWidth);

        // Update xScale and width based on the number of visible data points
        xScale.range([0, containerWidth - margin.left - margin.right - 100])
            .domain(d3.extent(dates) as [Date, Date]);

        // Update x-axis ticks to display labels for the visible data points
        (svg.select('.x-axis') as d3.Selection<SVGGElement, any, any, any>)
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(xAxis);


        svg.select('.x-axis')
            .selectAll('text')
            .attr('transform', 'rotate(-45)') // Adjust the rotation angle as needed
            .style('text-anchor', 'end'); // Align the rotated text appropriately


        // Update line generator
        const avgLine = d3.line<any>()
            .x((d: any) => xScale(dates[d]!))
            .y((d: any) => yScale(averages[d]!))
            .curve(d3.curveBasis);

        // Update average temperature line
        svg.select('.avg-line')
            .data([d3.range(dates.length)])
            .attr('d', avgLine);
    }

    // Attach the resize function to the window resize event
    handleResize();


    // Call the handleResize function once at the beginning
}
