import React, { useRef, useEffect } from "react";
import { select, scaleBand, scaleLinear, axisBottom } from "d3";
import useResizeObserver from "./useResizeObserver";

function RacingBarChart({ data, dom })
{
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  useEffect(() =>
  {
    const svg = select(svgRef.current);

    if (!dimensions) return;

    // Sorting the data
    data.sort((a, b) => b.value - a.value);

    const yScale = scaleBand()
      .paddingInner(0.1)
      .domain(data.map((value, index) => index))
      .range([0, dimensions.height]);

    const xScale = scaleLinear()
      .domain(dom)
      .range([0, dimensions.width]);

    //XAxis line
    const xAxis = axisBottom(xScale)
      .ticks(2); // Set initial ticks

    svg.select(".x-axis")
      .style("transform", `translateY(${dimensions.height + 5}px)`)
      .style("color", "#6c757d")
      .call(xAxis);

    // Draw the bars
    svg
      .selectAll(".bar")
      .data(data, (entry, index) => entry.name)
      .join((enter) =>
        enter.append("rect").attr("y", (entry, index) => yScale(index))
      )
      .attr("fill", (entry) => entry.color)
      .attr("class", "bar")
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .transition()
      .attr("width", (entry) => xScale(entry.value))
      .attr("y", (entry, index) => yScale(index));

    // Draw the entry.value labels to the right of the bars
    svg
      .selectAll(".value-label")
      .data(data, (entry, index) => entry.name)
      .join((enter) =>
        enter
          .append("text")
          .attr("y", (entry, index) => yScale(index) + yScale.bandwidth() / 2 + 5)
      )
      .text((entry) => `${parseInt(entry.value).toLocaleString()}`)
      .attr("class", "value-label")
      .attr("x", (entry) => xScale(entry.value) + 10)
      .attr("fill", "#6c757d")
      .transition()
      .attr("y", (entry, index) => yScale(index) + yScale.bandwidth() / 2 + 5);

    // Draw the entry.name labels on the left of the bars
    svg
      .selectAll(".name-label")
      .data(data, (entry, index) => entry.name)
      .join((enter) =>
        enter
          .append("text")
          .attr("y", (entry, index) => yScale(index) + yScale.bandwidth() / 2 + 5)
      )
      .text((entry) => entry.name)
      .attr("class", "name-label")
      .attr("x", -10) // Move the labels to the left of the bars
      .attr("fill", "#6c757d")
      .attr("text-anchor", "end") // Align text to the end (left)
      .attr("alignment-baseline", "middle") // Align text to the middle
      .transition()
      .attr("y", (entry, index) => yScale(index) + yScale.bandwidth() / 2 + 5);

  }, [data, dimensions]);

  return (
    <div ref={wrapperRef} style={{ margin: "0 5rem 2rem 7rem", height: `60vh` }}>
      <svg style={{ overflow: 'visible' }} className="w-100 h-100" ref={svgRef}>
        <g className="x-axis" />
      </svg>
    </div>
  );
}

export default RacingBarChart;
