
import * as d3 from 'd3';
import zoomIcon from '../../img/zoomIcon.svg';

export interface TemperatureData {
	terrestrial_date: string;
	min_temp: string;
	max_temp: string;
	min_temp_fahrenheit: string;
	max_temp_fahrenheit: string;
	isCelcius: boolean;
}

const dimensions = {
	width: window.innerWidth,
	height: Math.max(window.innerHeight * 0.4, 180),
	marginTop: Math.max(window.innerHeight * 0.0454545, 25),
	marginBottom: Math.max(window.innerHeight * 0.09, 50),
	marginLeft: Math.max(window.innerWidth * 0.0468, 60),
	marginRight: Math.max(window.innerWidth * 0.0078125, 10)
}


export function check(data: TemperatureData[], isCelcius: boolean): void {


	function resize(): void {
		dimensions.width = window.innerWidth;
		dimensions.height = Math.max(window.innerHeight * 0.4, 180);
		dimensions.marginTop = Math.max(window.innerHeight * 0.0454545, 25);
		dimensions.marginBottom= Math.max(window.innerHeight * 0.09, 50);
		dimensions.marginLeft= Math.max(window.innerWidth * 0.0468, 60),
		dimensions.marginRight= Math.max(window.innerWidth * 0.0078125, 10)


		// Call the draw function to redraw the graph with updated dimensions
		draw(data);
	}

	// Add an event listener for window resize
	window.addEventListener('resize', resize);




	const xAccessor = (d: TemperatureData) => new Date(d.terrestrial_date);
	let yAccessor: (d: TemperatureData) => number;
	if (isCelcius) {
		yAccessor = (d: TemperatureData) => (parseInt(d.min_temp) + parseInt(d.max_temp)) / 2;
	} else {
		yAccessor = (d: TemperatureData) => (parseInt(d.min_temp_fahrenheit) + parseInt(d.max_temp_fahrenheit)) / 2;
	}

	const text = isCelcius ? '°C' : '°F';


	const formatDate = d3.timeFormat('%d %B %Y')

	const getText = (d: any) => {
		const date = xAccessor(d)
		const temperature = yAccessor(d)
		return `${formatDate(date)}, ${Math.round(temperature)}${text}`
	}

	const draw = (data: any) => {
		d3.select('#temperature-graph').remove();



		const wrapper = d3.select('#mars-container')


		const svg = wrapper
			.select('main')
			.append('svg')
			.attr('id', 'temperature-graph')
			.attr('class', 'grey-box')
			.attr('width', dimensions.width)
			.attr('height', dimensions.height)
			.attr('viewBox', `${-dimensions.marginLeft} 0 ${dimensions.width} ${dimensions.height}`)


		const chartWrapper = svg.append('g')
			.attr('class', 'chart-wrapper')
			.attr('transform', `translate(${(dimensions.width - dimensions.marginLeft - dimensions.marginRight) / 2}, ${dimensions.marginTop / 2})`);

		chartWrapper.append('text')
			.attr('class', 'chart-title')
			.attr('id', 'data-heading')
			.attr('text-anchor', 'middle')
			.attr('fill', 'white')
			.attr('font-size', 'calc(3 * var(--unit))')
			.text('Average Temperature on Mars');


		const xDomain = d3.extent(data, xAccessor) as [Date, Date];
		const yDomain = [d3.min(data, yAccessor), d3.max(data, yAccessor)] as [number, number];

		const xScale = d3.scaleTime()
			.domain(xDomain)
			.range([0, dimensions.width - dimensions.marginLeft - dimensions.marginRight]);

		const yScale = d3.scaleLinear()
			.domain(yDomain)
			.range([dimensions.height - dimensions.marginBottom, dimensions.marginTop])

		const xAxis = d3.axisBottom<Date>(xScale)
			.tickFormat((date: Date) => d3.timeFormat('%b')(date))
			.ticks(5);

		const yAxis = d3.axisLeft(yScale).ticks(5); // Adjust the number of ticks as needed


		// Append x and y axes to the SVG
		svg.append('g')
			.attr('class', 'x-axis')
			.attr('transform', `translate(0,${dimensions.height - dimensions.marginBottom})`) // Adjust the y value
			.call((xAxis));

		svg.select('.x-axis')
			.selectAll('text')
			.attr('transform', 'rotate(-45)') // Adjust the rotation angle as needed
			.style('text-anchor', 'end') // Align the rotated text appropriately
			.style('font-size', 'max(12px,calc(1.5 * var(--unit)))');

		svg.append('g')
			.attr('class', 'y-axis')
			.call(yAxis);

		svg.select('.y-axis')
			.selectAll('text')
			.style('font-size', 'max(12px,calc(1.5 * var(--unit)))');


		/* Line */
		const lineGenerator = d3.line<TemperatureData>()
			.x((d) => xScale(xAccessor(d)))
			.y((d) => yScale(yAccessor(d)))
			.curve(d3.curveBumpX)

		// Create a clipPath element
		svg.append('clipPath')
			.attr('id', 'clip-path')
			.append('rect')
			.attr('width', dimensions.width - dimensions.marginLeft - dimensions.marginRight)
			.attr('height', dimensions.height - dimensions.marginBottom);

		// Apply the clipPath to the line
		svg
			.append('path')
			.datum(data)
			.attr('class', 'line')
			.attr('d', lineGenerator)
			.attr('stroke', 'white')
			.attr('stroke-linejoin', 'round')
			.attr('fill', 'none')
			.attr('clip-path', 'url(#clip-path)'); // Apply the clipPath


		svg.append('text')
			.attr('transform', `translate(${(dimensions.width - dimensions.marginLeft) / 2},${dimensions.height})`) // Center X-axis title
			.style('text-anchor', 'middle')
			.style('fill', 'white')
			.style('font-size', 'max(16px,calc(2 * var(--unit)))')
			.text('Date');

		svg.append('text')
			.attr('transform', `translate(${0 - dimensions.marginLeft/1.5}, ${dimensions.height / 2.25}) rotate(-90)`)
			.style('text-anchor', 'middle')
			.style('fill', 'white')
			.style('font-size', 'max(14px, calc(2 * var(--unit)))')
			.text(`Temperature ${text}`);


		/* Markers */
		const markerLine = svg
			.append('line')
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('y1', dimensions.marginTop)
			.attr('y2', dimensions.height - dimensions.marginBottom)
			.attr('stroke-width', 2)
			.attr('stroke', 'white')
			.attr('opacity', 0)
			.attr('clip-path', 'url(#clip-path)'); // Apply the clipPath


		const markerHorizontalLine = svg
			.append('line')
			.attr('x1', 0)
			.attr('x2', dimensions.width)
			.attr('y1', 0)
			.attr('y2', 0)
			.attr('stroke-width', 2)
			.attr('stroke', 'white')
			.attr('opacity', 0)
			.attr('clip-path', 'url(#clip-path)'); // Apply the clipPath


		const markerDot = svg
			.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', 8)
			.attr('fill', 'white')
			.attr('opacity', 0)
			.attr('clip-path', 'url(#clip-path)'); // Apply the clipPath


		/* Bisector */
		const bisect = d3.bisector(xAccessor)

		// Define a zoom behavior
		const zoom = d3.zoom()
			.scaleExtent([1, 15])
			.translateExtent([[0, 0], [dimensions.width - dimensions.marginLeft - dimensions.marginRight, 0]])
			.on('zoom', zoomed);



		// Apply zoom behavior to the SVG container
		const zoomableSvg = svg.call(zoom as any);


		/* Events */
		zoomableSvg.on('mousemove', (e) => {

			const [posX, _posY] = d3.pointer(e);
			const date = newXScale.invert(posX);


			const index = bisect.center(data, date)
			const d = data[index]

			const x = newXScale(xAccessor(d))
			const y = newYScale(yAccessor(d))

			markerLine
				.attr('x1', x)
				.attr('x2', x)
				.attr('opacity', 1)

			markerDot
				.attr('cx', x)
				.attr('cy', y)
				.attr('opacity', 1)

			markerHorizontalLine
				.attr('y1', y)
				.attr('y2', y)
				.attr('opacity', 1)


			d3.select('#mars-container').select('#data-heading').text(getText(d))
			d3.select('#mars-container').select('#data-total').text(yAccessor(d))
		})

		zoomableSvg.on('mouseleave', () => {
			markerLine.attr('opacity', 0)
			markerDot.attr('opacity', 0)
			markerHorizontalLine.attr('opacity', 0)

			const lastDatum = data[data.length - 1]



			d3.select('#mars-container').select('#data-heading').text('Average Temperature on Mars')
			d3.select('#mars-container').select('#data-total').text(yAccessor(lastDatum))
		})




		// Append a 'g' element to the SVG
		const resetButtonGroup = svg.append('g')
			.attr('class', 'reset-button-group')
		//.attr('transform', `translate(${dimensions.marginLeft }, 0)`); // Adjust the position as needed
		// Create the reset button and append it to the 'g' element
		const resetButton = resetButtonGroup.append('image')
			.attr('xlink:href', zoomIcon) // Replace 'path/to/your/image.svg' with the actual path to your SVG image
			.attr('width', 50)
			.attr('height', 20)
			.attr('class', 'reset-button')
			.attr('transform', `translate(${dimensions.width - dimensions.marginLeft - dimensions.marginRight - 33}, 0)`) // Adjust the position as needed

			.style('cursor', 'pointer')
			.on('click', reset);


		// Add click event listener to the button
		resetButton.select('button').on('click', reset);



		function reset() {

			markerLine.attr('opacity', 0)
			markerDot.attr('opacity', 0)
			markerHorizontalLine.attr('opacity', 0)

			lineGenerator.x((d) => newXScale(xAccessor(d)))
				.y((d) => newYScale(yAccessor(d)))
				.curve(d3.curveBumpX)
			// Update average temperature line

			// Update the line path based on the new scales
			svg.select('.line')
				.data([d3.range(data.length)])
				.attr('d', lineGenerator(data))
				.attr('stroke', 'white') // Update stroke color if needed
				.attr('stroke-linejoin', 'round')
				.attr('fill', 'none');
			//zoom out
			d3.select(svg as any).transition().duration(750).call(zoom.transform, d3.zoomIdentity);

		}

		// Create a rect to capture zoom events
		zoomableSvg.append('rect')
			.attr('x', 0)
			.attr('y', dimensions.marginTop)
			.attr('width', dimensions.width - dimensions.marginLeft - dimensions.marginRight)
			.attr('height', dimensions.height - dimensions.marginBottom - dimensions.marginTop)
			.style('fill', 'none')
			.style('pointer-events', 'all');


		let newXScale = xScale;
		let newYScale = yScale;

		function zoomed(event: d3.D3ZoomEvent<SVGElement, unknown>) {
			// Update xScale and yScale based on the zoom event, clamping to the original domain
			const newTransform = event.transform;
			newXScale = newTransform.rescaleX(xScale);
			newYScale = newTransform.rescaleY(yScale);

			const zoomLevel = newTransform.k;

			// Adjust tick format based on zoom level
			if (zoomLevel <= 1) {
				xAxis.tickFormat(d3.timeFormat('%b')); // Adjust to your desired format after zooming in
			} else {

				xAxis.tickFormat(d3.timeFormat('%b %d')); // Adjust to your desired format after zooming in
			}


			// Update x-axis ticks to display labels for the visible data points
			(svg.select('.x-axis') as d3.Selection<SVGGElement, any, any, any>)
				//.attr('transform', `translate(0,${dimensions.height - dimensions.marginBottom - dimensions.marginTop})`) // Adjust the y value
				.call(xAxis.scale(newXScale))
				.selectAll('text')
				.attr('transform', 'rotate(-45)')
				.style('text-anchor', 'end')
				.style('font-size', 'max(12px,calc(1.5 * var(--unit)))');



			// Calculate the new visible data range based on the updated scales

			const visibleData = data.filter((d: TemperatureData) => {
				const x = xAccessor(d);

				const xDomain = newXScale.domain();
				if (xDomain && xDomain[0] && xDomain[1]) {
					return x >= xDomain[0] && x <= xDomain[1];
				} else {
					// Handle the case when xDomain is undefined
					return false; // Or whatever makes sense in your context
				}
			});

			// Update the domain of the yScale based on the visible data range
			const yDomain = [d3.min(visibleData, yAccessor) || 0, d3.max(visibleData, yAccessor) || 1];
			newYScale.domain(yDomain);

			(svg.select('.y-axis') as d3.Selection<SVGGElement, any, any, any>)
				.call(yAxis.scale(newYScale))
				.selectAll('text')
				.style('font-size', 'max(12px,calc(1.5 * var(--unit)))');

			/* Line */
			lineGenerator.x((d) => newXScale(xAccessor(d)))
				.y((d) => newYScale(yAccessor(d)))
				.curve(d3.curveBumpX)
			// Update average temperature line

			// Update the line path based on the new scales
			svg.select('.line')
				.data([d3.range(data.length)])
				.attr('d', lineGenerator(visibleData))
				.attr('stroke', 'white') // Update stroke color if needed
				.attr('stroke-linejoin', 'round')
				.attr('fill', 'none');

			// Inside the zoomed function
			const [posX, _posY] = d3.pointer(event, svg.node());
			const date = newXScale.invert(posX);

			// Find the corresponding data point in the visible data
			const index = bisect.center(visibleData, date);
			const d = visibleData[index];
			const x = newXScale(xAccessor(d));
			const y = newYScale(yAccessor(d));

			// Update marker positions
			markerLine.attr('x1', x).attr('x2', x).attr('opacity', 1);
			markerDot.attr('cx', x).attr('cy', y).attr('opacity', 1);
			markerHorizontalLine.attr('y1', y).attr('y2', y).attr('opacity', 1);


			// Update tooltip text
			d3.select('#mars-container').select('#data-heading').text(getText(d));
			d3.select('#mars-container').select('#data-total').text(yAccessor(d));
		}

	}
	draw(data);
}