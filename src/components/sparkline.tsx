"use client"

import React from 'react'

interface SparklineProps {
    data: number[]
    width?: number
    height?: number
    isPositive?: boolean
}

export function Sparkline({ data, width = 120, height = 40, isPositive = true }: SparklineProps) {
    if (!data || data.length < 2) return null

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min === 0 ? 1 : max - min

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * height
        return `${x},${y}`
    }).join(' ')

    const color = isPositive ? 'var(--color-primary)' : 'var(--color-destructive)'

    return (
        <div className="relative" style={{ width, height }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <defs>
                    <linearGradient id={`gradient-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Fill Area */}
                <polyline
                    fill={`url(#gradient-${isPositive})`}
                    stroke="none"
                    points={`${width},${height} 0,${height} ${points}`}
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

                {/* End Point Dot */}
                {data.length > 0 && (
                    <circle
                        cx={width}
                        cy={height - ((data[data.length - 1] - min) / range) * height}
                        r="3"
                        fill={color}
                        className="animate-pulse shadow-sm"
                    />
                )}
            </svg>
        </div>
    )
}
