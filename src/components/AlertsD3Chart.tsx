import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface AlertDataPoint {
  hour: string;
  critical: number;
  warning: number;
  info: number;
}

export function AlertsD3Chart() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [chartData, setChartData] = useState<AlertDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveTelemetryData() {
      try {
        const res = await fetch(`/api/telemetry?t=${Date.now()}`);
        if (!res.ok) throw new Error('Failed to fetch telemetry');
        const json = await res.json();
        const logs: any[] = json.logs || [];

        // Build 3-hour interval map
        const hoursList = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
        const intervalsMap: Record<string, { critical: number; warning: number; info: number }> = {};
        hoursList.forEach(h => {
          intervalsMap[h] = { critical: 0, warning: 0, info: 0 };
        });

        logs.forEach(log => {
          const timeStr = log.time || '12:00:00';
          let hourNum = 12;
          try {
            const parts = timeStr.split(':');
            if (parts.length > 0) {
              hourNum = parseInt(parts[0], 10) || 12;
              if (timeStr.toLowerCase().includes('pm') && hourNum < 12) hourNum += 12;
              if (timeStr.toLowerCase().includes('am') && hourNum === 12) hourNum = 0;
            }
          } catch {}

          const intervalIdx = Math.floor((hourNum % 24) / 3);
          const intervalKey = hoursList[intervalIdx] || '12:00';

          const isFail = String(log.status || '').toUpperCase().includes('FAIL') || Number(log.healthScore) < 65;
          const isWarn = String(log.status || '').toUpperCase().includes('WARN') || Number(log.healthScore) < 85;

          if (isFail) {
            intervalsMap[intervalKey].critical += 1;
          } else if (isWarn) {
            intervalsMap[intervalKey].warning += 1;
          } else {
            intervalsMap[intervalKey].info += 1;
          }
        });

        const points: AlertDataPoint[] = hoursList.map(h => ({
          hour: h,
          critical: intervalsMap[h].critical,
          warning: intervalsMap[h].warning,
          info: intervalsMap[h].info
        }));

        setChartData(points);
      } catch (e) {
        console.warn('Failed to load live telemetry chart:', e);
        const defaultPoints: AlertDataPoint[] = [
          '00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'
        ].map(h => ({ hour: h, critical: 0, warning: 0, info: 1 }));
        setChartData(defaultPoints);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveTelemetryData();
  }, []);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

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

    // Calculate max height
    const maxVal = Math.max(5, d3.max(chartData, (d: AlertDataPoint) => d.critical + d.warning + d.info) || 5);

    // X scale
    const x = d3.scaleBand()
      .domain(chartData.map(d => d.hour))
      .range([0, innerWidth])
      .padding(0.3);

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, maxVal])
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
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerWidth))
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
      .keys(subgroups)(chartData as any);

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
      .attr('height', d => Math.max(0, y(d[0]) - y(d[1])))
      .attr('width', x.bandwidth())
      .attr('rx', 4);

  }, [chartData]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">24-Hour Live System Telemetry Distribution</h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time telemetry hotspots and health status across authentic Mandal/GP office endpoints.</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Critical</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Warning</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>Verified</div>
        </div>
      </div>
      <div className="w-full overflow-x-auto bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        {loading ? (
          <div className="text-center py-12 font-mono text-xs text-slate-500">
            Loading live telemetry distribution...
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-auto max-h-[260px]"></svg>
        )}
      </div>
    </div>
  );
}
