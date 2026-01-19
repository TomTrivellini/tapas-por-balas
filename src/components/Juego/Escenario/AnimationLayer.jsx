import { useEffect, useMemo, useState } from 'react';

const FRAME_DURATION = 1000;

export default function AnimationLayer({ board, frame, isAnimating }) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!frame || !isAnimating) return;
    setRefreshKey((value) => value + 1);
  }, [frame?.id, isAnimating]);

  if (!frame || !isAnimating) {
    return null;
  }

  const totalCols = board.totalCols || board.colsPerSide * 2;
  const cellWidth = 100 / totalCols;
  const cellHeight = 100 / board.rows;

  const events = frame.events || [];
  const moveEvents = events.filter((event) => event.type === 'move');
  const shotEvents = events.filter((event) => event.type === 'shot');

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 20,
      }}
    >
      {moveEvents.map((event) => (
        <MoveGhost
          key={event.id}
          event={event}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          refreshKey={refreshKey}
        />
      ))}
      {shotEvents.map((event) => (
        <ShotProjectile
          key={event.id}
          event={event}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
        />
      ))}
    </div>
  );
}

function MoveGhost({ event, cellWidth, cellHeight, refreshKey }) {
  const [positionIndex, setPositionIndex] = useState(0);
  const path = useMemo(() => {
    if (event.path && event.path.length > 0) {
      return event.path;
    }
    if (event.from && event.to) {
      return [event.from, event.to];
    }
    return [];
  }, [event.path, event.from, event.to]);

  useEffect(() => {
    if (!path.length) return undefined;
    setPositionIndex(0);
    if (path.length === 1) return undefined;
    const stepDuration = (event.duration || FRAME_DURATION) / (path.length - 1 || 1);
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex += 1;
      if (currentIndex >= path.length) {
        clearInterval(interval);
        return;
      }
      setPositionIndex(currentIndex);
    }, stepDuration);
    return () => clearInterval(interval);
  }, [path, event.duration, refreshKey]);

  if (!path.length) return null;
  const current = path[Math.min(positionIndex, path.length - 1)];
  if (!current) return null;

  const left = (current.c + 0.5) * cellWidth;
  const top = (current.r + 0.5) * cellHeight;
  const size = Math.min(cellWidth, cellHeight) * 0.85;
  const backgroundColor = event.team === 'A' ? '#6dd3ff' : '#ff7676';
  const label = event.name ? event.name.slice(0, 8) : event.unitId;

  return (
    <div
      style={{
        position: 'absolute',
        width: `${size}%`,
        height: `${size}%`,
        backgroundColor,
        borderRadius: '4px',
        left: `${left}%`,
        top: `${top}%`,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0b0b0b',
        fontSize: '10px',
        fontWeight: 700,
        boxShadow: '0 0 6px rgba(0,0,0,0.35)',
      }}
    >
      {label}
    </div>
  );
}

function ShotProjectile({ event, cellWidth, cellHeight }) {
  const startLeft = (event.from.c + 0.5) * cellWidth;
  const startTop = (event.from.r + 0.5) * cellHeight;
  const endLeft = (event.to.c + 0.5) * cellWidth;
  const endTop = (event.to.r + 0.5) * cellHeight;
  const [position, setPosition] = useState({ left: startLeft, top: startTop });

  useEffect(() => {
    setPosition({ left: startLeft, top: startTop });
    const raf = requestAnimationFrame(() => {
      setPosition({ left: endLeft, top: endTop });
    });
    return () => cancelAnimationFrame(raf);
  }, [startLeft, startTop, endLeft, endTop, event.id]);

  const width = Math.max(1, cellWidth * 0.3);
  const height = Math.max(0.5, cellHeight * 0.2);

  return (
    <div
      style={{
        position: 'absolute',
        width: `${width}%`,
        height: `${height}%`,
        backgroundColor: '#ff5b5b',
        borderRadius: '2px',
        transition: `left ${(event.duration || FRAME_DURATION) / 1000}s linear, top ${(event.duration || FRAME_DURATION) / 1000}s linear`,
        left: `${position.left}%`,
        top: `${position.top}%`,
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 6px rgba(255,90,90,0.8)',
      }}
    />
  );
}
