import React from 'react';

const DigitalHelix = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-50 -50 400 400"
    style={{ width: '100%', height: '100%' }}
  >
    <defs>
      <filter id="helix-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
          result="glow"
        />
        <feComposite in="glow" in2="SourceGraphic" operator="over" />
      </filter>
    </defs>
    <style>
      {`
        @keyframes drift {
          from { transform: translateY(0px); }
          to { transform: translateY(-400px); }
        }
        @keyframes rotate-helix {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .particle {
          font-family: 'Roboto Mono', monospace;
          font-size: 14px;
          fill: #64FFDA;
          opacity: 0;
          animation: drift 10s linear infinite;
        }
        .helix-strand {
            stroke-width: 1.5;
            filter: url(#helix-glow);
        }
        .helix-container {
            transform-box: fill-box;
            transform-origin: center;
            animation: rotate-helix 45s linear infinite;
        }
      `}
    </style>
    {/* Particles floating up */}
    <g>
      {Array.from({ length: 50 }).map((_, i) => (
        <text
          key={i}
          className="particle"
          x={Math.random() * 300}
          y={250 + Math.random() * 150}
          style={{ animationDelay: `${Math.random() * 10}s` }}
        >
          {Math.round(Math.random())}
        </text>
      ))}
    </g>
    {/* The Helix */}
    <g className="helix-container">
      <path
        id="strand1"
        className="helix-strand"
        stroke="#64FFDA"
        fill="none"
        d={Array.from({ length: 100 }).map((_, i) => {
          const t = (i / 99) * 4 * Math.PI;
          const x = 150 + Math.cos(t) * 80;
          const y = (i / 99) * 300;
          return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
        }).join(' ')}
      />
      <path
        id="strand2"
        className="helix-strand"
        stroke="#A892F4"
        fill="none"
        d={Array.from({ length: 100 }).map((_, i) => {
          const t = (i / 99) * 4 * Math.PI;
          const x = 150 + Math.cos(t + Math.PI) * 80;
          const y = (i / 99) * 300;
          return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
        }).join(' ')}
      />
      {/* Connectors */}
      {Array.from({ length: 20 }).map((_, i) => {
        const t = (i / 19) * 4 * Math.PI;
        const x1 = 150 + Math.cos(t) * 80;
        const y1 = (t / (4 * Math.PI)) * 300;
        const x2 = 150 + Math.cos(t + Math.PI) * 80;
        const y2 = (t / (4 * Math.PI)) * 300;
        return (
          <line
            key={`conn-${i}`}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke="#cdd6f4"
            strokeWidth="0.5"
            strokeOpacity="0.4"
          />
        );
      })}
    </g>
  </svg>
);

export default DigitalHelix; 