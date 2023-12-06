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
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    let containerWidth = window.innerWidth;
    const containerHeight = 250;

    // Extract relevant information
    const dates: Date[] = data.map(entry => new Date(entry.terrestrial_date));
    const tempKey = isCelcius ? 'min_temp' : 'min_temp_fahrenheit';
    const averages = data.map(
        entry => (parseInt(entry[tempKey], 10) + parseInt(entry.max_temp, 10)) / 2
    );
    const text = isCelcius ? '°C' : '°F';

    const svg = d3.select('#mars-container').select('main').append('svg')
        .attr('class', 'grey-box')
        .attr('width', containerWidth)
        .attr('height', containerHeight);


    // Create scales
    // Create scales with filtered dates
    const xScale = d3
        .scaleTime()
        .domain((d3.extent(dates.filter(Boolean)) ?? []) as [Date, Date])
        .range([margin.left, containerWidth - margin.right]);

    const yScale = d3.scaleLinear().domain([d3.min(averages)!, d3.max(averages)!]).range([containerHeight - margin.bottom, margin.top]);

    // Create X and Y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append X and Y axes to the chart
    const xAxisG = svg
        .append('g')
        .attr('class', 'x-axis') // Add class for styling
        .attr('transform', `translate(0, ${containerHeight - margin.bottom})`);

    xAxisG.call(xAxis);

    const yAxisG = svg
        .append('g')
        .attr('class', 'y-axis') // Add class for styling
        .attr('transform', `translate(${margin.left}, 0)`);

    yAxisG.call(yAxis);

    // Create the line
    const line = d3
        .line<number>()
        .x((_, i) => xScale(dates[i]!))
        .y(d => yScale(d))
        .curve(d3.curveBasis);

    // Append the line to the chart
    svg
        .append('path')
        .data([averages])
        .attr('class', 'line')
        .attr('d', line)
        .attr('clip-path', 'url(#clip-path)')
        .attr('fill', 'none')
        .attr('stroke', 'white');

    // Add zoom functionality
    const zoom = d3.zoom().scaleExtent([1, 20])
        .translateExtent([[0, 0], [containerWidth, containerHeight]])
        .extent([[0, 0], [containerWidth, containerHeight]])
        .on('zoom', zoomed);

    function zoomed(event: d3.D3ZoomEvent<SVGElement, unknown>) {
        const newTransform = event.transform;
        const newXScale = newTransform.rescaleX(xScale);
        const newYScale = newTransform.rescaleY(yScale);

        (svg.select('.x-axis') as d3.Selection<SVGGElement, any, any, any>)
            .attr('transform', `translate(0,${containerHeight - margin.top - margin.bottom})`)
            .call(xAxis.scale(newXScale));

        (svg.select('.y-axis') as d3.Selection<SVGGElement, any, any, any>)
            .call(yAxis.scale(newYScale));

        const updatedLine = d3
            .line<number>()
            .x((_, i) => newXScale(dates[i]!))
            .y(d => newYScale(d))
            .curve(d3.curveBasis);

    }



    svg.call(zoom as any);

    // Append X axis label
    svg
        .append('text')
        .attr('transform', `translate(${containerWidth / 2},${containerHeight - margin.top})`)
        .style('text-anchor', 'middle')
        .text('Date');

    // Append Y axis label
    svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - containerHeight / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text(`Temperature ${text}`);
}
