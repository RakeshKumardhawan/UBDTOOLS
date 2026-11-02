import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Cpu, HardDrive, Activity, Zap, RefreshCw } from 'lucide-react';

interface GaugeProps {
  value: number; // 0 to 100
  label: string;
  subLabel: string;
  color: string;
  icon: React.ReactNode;
}

const D3Gauge: React.FC<GaugeProps> = ({ value, label, subLabel, color, icon }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 140;
    const height = 110;
    const radius = Math.min(width, height) / 2 + 10;
    const innerRadius = radius - 14;
    const outerRadius = radius;

    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * 0.75;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2 + 15})`);

    // Background track arc
    const backgroundArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(6);

    g.append('path')
      .attr('d', backgroundArc as any)
      .attr('fill', '#1e293b');

    // Value filled arc
    const valueAngle = startAngle + (value / 100) * (endAngle - startAngle);

    const foregroundArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(valueAngle)
      .cornerRadius(6);

    g.append('path')
      .attr('d', foregroundArc as any)
      .attr('fill', color)
      .attr('filter', 'drop-shadow(0px 0px 6px ' + color + '88)');

    // Tick marks
    const ticks = [0, 25, 50, 75, 100];
    ticks.forEach(tick => {
      const angle = startAngle + (tick / 100) * (endAngle - startAngle);
      const x1 = (innerRadius - 4) * Math.sin(angle);
      const y1 = -(innerRadius - 4) * Math.cos(angle);
      const x2 = (innerRadius - 1) * Math.sin(angle);
      const y2 = -(innerRadius - 1) * Math.cos(angle);

      g.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#64748b')
        .attr('stroke-width', 1.5);
    });

  }, [value, color]);

  return (
    <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800 relative">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 mb-1">
        {icon}
        <span>{label}</span>
      </div>

      <div className="relative flex justify-center items-center">
        <svg ref={svgRef} className="w-36 h-28 overflow-visible" />
        <div className="absolute top-11 text-center">
          <div className="text-2xl font-black font-mono tracking-tight text-white drop-shadow-sm">
            {Math.round(value)}<span className="text-sm font-bold text-slate-400">%</span>
          </div>
          <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            {subLabel}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SystemPulseWidget: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState<number>(28);
  const [memoryUsage, setMemoryUsage] = useState<number>(44);
  const [totalRamGb] = useState<number>(8.0);
  const [pulseHistory, setPulseHistory] = useState<number[]>([30, 28, 35, 42, 38, 25, 31, 29, 36, 40]);
  const pulseSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate realistic telemetry fluctuations
      const nextCpu = Math.min(95, Math.max(12, cpuUsage + (Math.random() * 12 - 6)));
      const nextMem = Math.min(90, Math.max(30, memoryUsage + (Math.random() * 4 - 2)));

      setCpuUsage(nextCpu);
      setMemoryUsage(nextMem);

      setPulseHistory(prev => [...prev.slice(1), Math.round(nextCpu)]);
    }, 2000);

    return () => clearInterval(interval);
  }, [cpuUsage, memoryUsage]);

  // Render D3 Sparkline Pulse Wave
  useEffect(() => {
    if (!pulseSvgRef.current) return;

    const svg = d3.select(pulseSvgRef.current);
    svg.selectAll('*').remove();

    const width = 300;
    const height = 36;

    const xScale = d3.scaleLinear()
      .domain([0, pulseHistory.length - 1])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - 4, 4]);

    const line = d3.line<number>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    const g = svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Gradient definition
    const defs = g.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'pulse-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.2);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 1);

    // Render pulse line
    g.append('path')
      .datum(pulseHistory)
      .attr('fill', 'none')
      .attr('stroke', 'url(#pulse-gradient)')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Glowing current point
    const lastIdx = pulseHistory.length - 1;
    g.append('circle')
      .attr('cx', xScale(lastIdx))
      .attr('cy', yScale(pulseHistory[lastIdx]))
      .attr('r', 4)
      .attr('fill', '#10b981')
      .attr('filter', 'drop-shadow(0px 0px 6px #10b981)');

  }, [pulseHistory]);

  const usedRamGb = ((memoryUsage / 100) * totalRamGb).toFixed(2);

  const getCpuColor = (val: number) => {
    if (val > 80) return '#ef4444'; // rose red
    if (val > 50) return '#f59e0b'; // amber
    return '#10b981'; // emerald green
  };

  const getMemColor = (val: number) => {
    if (val > 80) return '#ef4444';
    if (val > 65) return '#f59e0b';
    return '#06b6d4'; // cyan
  };

  const getCpuStatusLabel = (val: number) => {
    if (val > 80) return 'High Load';
    if (val > 50) return 'Moderate';
    return 'Optimal';
  };

  return (
    <div className="bg-[#0b0f17] border-2 border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <h3 className="font-syne font-bold text-sm text-white tracking-tight flex items-center gap-2">
              Real Time System Pulse
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                LIVE D3 GAUGE
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">Workstation CPU & Memory Telemetry Stream</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Polling: 2000ms</span>
        </div>
      </div>

      {/* D3 Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <D3Gauge
          value={cpuUsage}
          label="CPU LOAD"
          subLabel={getCpuStatusLabel(cpuUsage)}
          color={getCpuColor(cpuUsage)}
          icon={<Cpu className="w-3.5 h-3.5 text-emerald-400" />}
        />

        <D3Gauge
          value={memoryUsage}
          label="RAM USAGE"
          subLabel={`${usedRamGb} / ${totalRamGb.toFixed(1)} GB`}
          color={getMemColor(memoryUsage)}
          icon={<HardDrive className="w-3.5 h-3.5 text-cyan-400" />}
        />
      </div>

      {/* D3 Real-Time Pulse Wave Line */}
      <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono text-slate-300 font-bold">CPU Heartbeat Trace:</span>
        </div>
        <div className="w-full sm:w-auto flex-1 flex justify-center sm:justify-end">
          <svg ref={pulseSvgRef} className="w-full max-w-[300px] h-9 overflow-visible" />
        </div>
      </div>
    </div>
  );
};
