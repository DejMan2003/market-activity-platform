"use client"

import React, { useState, useRef, useMemo } from 'react'
import { cn } from "@/lib/utils"

interface SparklineProps {
    data: number[]
    width?: number
    height?: number
    isPositive?: boolean
    className?: string
}

export function Sparkline({ data, width = 120, height = 40, isPositive = true, className }: SparklineProps) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate chart properties
    const { min, max, range, points, areaPoints, trendPoints } = useMemo(() => {
        if (!data || data.length < 2) return { min: 0, max: 0, range: 1, points: '', areaPoints: '', trendPoints: null };

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min === 0 ? 1 : max - min;

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        const areaPoints = `${width},${height} 0,${height} ${points}`;

        // Linear Regression for Line of Best Fit
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += data[i];
            sumXY += i * data[i];
            sumXX += i * i;
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const startY = slope * 0 + intercept;
        const endY = slope * (n - 1) + intercept;

        const y1 = height - ((startY - min) / range) * height;
        const y2 = height - ((endY - min) / range) * height;

        const trendPoints = { x1: 0, y1, x2: width, y2 };

        return { min, max, range, points, areaPoints, trendPoints };
    }, [data, width, height]);

    if (!data || data.length < 2) return null;

    const color = isPositive ? 'var(--color-primary)' : 'var(--color-destructive)';
    const gradientId = React.useId();

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;

        // Find closest data point index
        const index = Math.min(
            Math.max(0, Math.round((x / width) * (data.length - 1))),
            data.length - 1
        );

        setHoverIndex(index);
    };

    const handleMouseLeave = () => {
        setHoverIndex(null);
    };

    // Calculate crosshair position if hovering
    const crosshair = hoverIndex !== null ? (() => {
        const val = data[hoverIndex];
        const x = (hoverIndex / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return { x, y, val };
    })() : null;

    return (
        <div
            ref={containerRef}
            className={cn("relative cursor-crosshair group/chart", className)}
            style={{ width, height }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible pointer-events-none">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Fill Area */}
                <polyline
                    fill={`url(#${gradientId})`}
                    stroke="none"
                    points={areaPoints}
                />

                {/* Trend Line */}
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    className="drop-shadow-[0_0_4px_rgba(var(--color-primary-rgb),0.5)]"
                />

                {/* Line of Best Fit (Linear Regression) - visible on hover */}
                {trendPoints && hoverIndex !== null && (
                    <line
                        x1={trendPoints.x1}
                        y1={trendPoints.y1}
                        x2={trendPoints.x2}
                        y2={trendPoints.y2}
                        stroke="white"
                        strokeOpacity="0.5"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                        className="animate-in fade-in duration-300"
                    />
                )}


                {/* End Point Dot (Only show if not hovering) */}
                {data.length > 0 && !crosshair && (
                    <circle
                        cx={width}
                        cy={height - ((data[data.length - 1] - min) / range) * height}
                        r="3"
                        fill={color}
                        className="animate-pulse shadow-sm"
                    />
                )}

                {/* Interactive Crosshair & Dot */}
                {crosshair && (
                    <>
                        <line
                            x1={crosshair.x} y1={0}
                            x2={crosshair.x} y2={height}
                            stroke="white"
                            strokeOpacity="0.2"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                        />
                        <circle
                            cx={crosshair.x}
                            cy={crosshair.y}
                            r="3"
                            fill="white"
                            stroke={color}
                            strokeWidth="2"
                            className="shadow-md"
                        />
                    </>
                )}
            </svg>

            {/* Tooltip Overlay */}
            {crosshair && (
                <div
                    className="absolute bottom-full left-0 mb-2 transform -translate-x-1/2 pointer-events-none z-50 px-2 py-1 bg-background/90 border border-border/50 text-[10px] font-bold text-foreground rounded shadow-lg backdrop-blur-md whitespace-nowrap"
                    style={{ left: crosshair.x }}
                >
                    {crosshair.val.toFixed(2)}
                </div>
            )}
        </div>
    )
}
