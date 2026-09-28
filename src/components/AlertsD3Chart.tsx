import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface AlertDataPoint {
  hour: string;
  critical: number;
  warning: number;
  info: number;
}

const mockAlertData: AlertDataPoint[] = [
  { hour: '00:00', critical: 1, warning: 3, info: 12 },
  { hour: '03:00', critical: 0, warning: 1, info: 8 },
  { hour: '06:00', critical: 2, warning: 4, info: 15 },
  { hour: '09:00', critical: 5, warning: 9, info: 28 },
  { hour: '12:00', critical: 3, warning: 6, info: 22 },
  { hour: '15:00', critical: 1, warning: 2, info: 14 },
  { hour: '18:00', critical: 4, warning: 7, info: 19 },
  { hour: '21:00', critical: 2, warning: 3, info: 10 },
];

export function AlertsD3Chart() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 600;
    const height = 260;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3.scaleBand()
      .domain(mockAlertData.map(d => d.hour))
      .range([0, innerWidth])
      .padding(0.3);

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, 35])
      .nice()
      .range([innerHeight, 0]);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');

    svg.selectAll('.domain').attr('stroke', '#334155');
    svg.selectAll('.tick line').attr('stroke', '#1e293b').attr('stroke-dasharray', '2,2');

    // Stack data
    const subgroups = ['critical', 'warning', 'info'] as const;
    const color = d3.scaleOrdinal<string>()
      .domain(subgroups)
      .range(['#f43f5e', '#f59e0b', '#06b6d4']);

    const stackedData = d3.stack<any>()
      .keys(subgroups)(mockAlertData as any);

    // Draw bars
    svg.selectAll('g.layer')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('fill', d => color(d.key))
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('x', d => x(d.data.hour)!)
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .attr('rx', 4);

  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">24-Hour System Alerts Hotspots</h3>
          <p className="text-xs text-slate-400 mt-0.5">Frequency and severity distribution across Mandal/GP office endpoints.</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Critical</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Warning</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>Info</div>
        </div>
      </div>
      <div className="w-full overflow-x-auto bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <svg ref={svgRef} className="w-full h-auto max-h-[260px]"></svg>
      </div>
    </div>
  );
}
