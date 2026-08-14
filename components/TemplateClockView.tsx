'use client';

import React, { useMemo } from 'react';
import type { Task } from '@/lib/AuthContext';

interface TemplateClockViewProps {
  tasks: Task[];
  now?: Date;
  size: number;
}

function TemplateClockViewContent({ tasks, now = new Date(), size }: TemplateClockViewProps) {
  const clockSize = size;
  const center = clockSize / 2;
  const radius = (clockSize / 2) * 0.73;
  const circumference = 2 * Math.PI * radius;
  const arcWidth = 34;

  const getRotation = (minutes: number) => (minutes / 1440) * 360 - 90;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const tickMarks = useMemo(() => {
    return Array.from({ length: 288 }).map((_, i) => {
      const mins = i * 5;
      let length = 4;
      if (mins % 360 === 0) length = 14;
      else if (mins % 60 === 0) length = 10;
      else if (mins % 20 === 0) length = 6;

      return (
        <line
          key={mins}
          x1={center}
          y1={center - radius - 12}
          x2={center}
          y2={center - radius - 12 - length}
          stroke="#fff"
          strokeWidth="1"
          transform={`rotate(${(mins / 1440) * 360} ${center} ${center})`}
        />
      );
    });
  }, [center, radius]);

  const labels = useMemo(() => {
    return [0, 6, 12, 18].map((h) => {
      const angle = (h / 24) * 360 - 90;
      const labelR = radius + 36;
      const lx = center + labelR * Math.cos((angle * Math.PI) / 180);
      const ly = center + labelR * Math.sin((angle * Math.PI) / 180);

      return (
        <text key={h} x={lx} y={ly} fill="#fff" fontSize="12px" textAnchor="middle" dominantBaseline="central">
          {h === 0 ? '00:00' : `${h}:00`}
        </text>
      );
    });
  }, [center, radius]);

  const taskArcs = useMemo(() => {
    return tasks.map((task) => {
      const duration = task.end - task.start;
      const strokeLength = (duration / 1440) * circumference;
      const rotDeg = getRotation(task.start);
      const startOffset = ((rotDeg + 90) / 360) * circumference;
      const textOffset = startOffset + strokeLength / 2;

      return (
        <g key={task.id}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={task.color}
            strokeWidth={arcWidth}
            strokeOpacity="0.35"
            strokeDasharray={`${strokeLength} ${circumference}`}
            transform={`rotate(${rotDeg} ${center} ${center})`}
          />
          <path id={`path-${task.id}`} d={`M ${center},${center - radius} a ${radius},${radius} 0 1,1 0,${2 * radius} a ${radius},${radius} 0 1,1 0,-${2 * radius}`} fill="none" />
          <text fill={task.color} fontSize="11px" fontWeight="600" opacity="0.9">
            <textPath href={`#path-${task.id}`} startOffset={textOffset} textAnchor="middle" dominantBaseline="central">
              {task.name}
            </textPath>
          </text>
        </g>
      );
    });
  }, [tasks, center, radius, circumference, arcWidth, getRotation]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg width={clockSize} height={clockSize} viewBox={`0 0 ${clockSize} ${clockSize}`}>
        {tickMarks}
        {labels}
        {taskArcs}  
      </svg>
    </div>
  );
}

export const TemplateClockView = React.memo(TemplateClockViewContent);

