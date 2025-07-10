import React from 'react';

const CrystalOfTrust = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 500 500"
    preserveAspectRatio="xMidYMid meet"
    style={{ width: '100%', height: '100%', overflow: 'visible' }}
  >
    <defs>
      <filter id="crystal-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <radialGradient id="pulse-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#64FFDA" stopOpacity="0.3" />
        <stop offset="70%" stopColor="#64FFDA" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#64FFDA" stopOpacity="0" />
      </radialGradient>
    </defs>

    <style>
      {`
        @keyframes rotate-crystal {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-blocks {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-particles {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes pulse-aura {
          0% { r: 0; opacity: 0.5; }
          100% { r: 250; opacity: 0; }
        }

        .crystal-group {
          transform-origin: 250px 250px;
          animation: rotate-crystal 120s linear infinite;
        }
        
        .crystal-facet {
          stroke: #D8B4FE; /* Lilac */
          stroke-width: 0.5;
          fill-opacity: 0.1;
          filter: url(#crystal-glow);
        }

        .blocks-ring {
          transform-origin: 250px 250px;
          animation: orbit-blocks 30s linear infinite;
        }
        
        .data-block {
          fill: #64FFDA;
          filter: url(#ring-glow);
          rx: 2px;
        }
        
        .particles-ring {
            transform-origin: 250px 250px;
            animation: orbit-particles 25s linear infinite;
        }
        
        .data-particle {
            fill: #64FFDA;
            filter: url(#ring-glow);
        }

        .aura {
          fill: url(#pulse-gradient);
          transform-origin: 250px 250px;
          animation: pulse-aura 8s ease-out infinite;
        }
      `}
    </style>

    {/* Pulsing Aura */}
    <circle className="aura" cx="250" cy="250" r="0" style={{ animationDelay: '0s' }} />
    <circle className="aura" cx="250" cy="250" r="0" style={{ animationDelay: '4s' }} />

    {/* The Crystal */}
    <g className="crystal-group">
        {/* Generate a complex crystal structure */}
        <polygon className="crystal-facet" fill="#A855F7" points="250,100 350,180 320,280 180,280 150,180" />
        <polygon className="crystal-facet" fill="#C084FC" points="250,100 150,180 200,220 300,220 350,180" />
        <polygon className="crystal-facet" fill="#D8B4FE" points="150,180 180,280 250,400 200,320" />
        <polygon className="crystal-facet" fill="#E9D5FF" points="350,180 320,280 250,400 300,320" />
        <polygon className="crystal-facet" fill="#A855F7" points="180,280 200,320 250,400" />
        <polygon className="crystal-facet" fill="#C084FC" points="320,280 300,320 250,400" />
        {/* Add more facets for complexity */}
        <path className="crystal-facet" fill="#9333EA" d="M 250 100 L 220 150 L 250 200 L 280 150 Z" />
        <path className="crystal-facet" fill="#C084FC" d="M 250 400 L 220 350 L 250 300 L 280 350 Z" />
        <path className="crystal-facet" fill="#D8B4FE" d="M 150 180 L 180 200 L 200 220 L 170 250 Z" />
        <path className="crystal-facet" fill="#E9D5FF" d="M 350 180 L 320 200 L 300 220 L 330 250 Z" />
        <polygon className="crystal-facet" fill="#A855F7" points="250,220 270,250 250,280 230,250" />
        {/* More decorative internal lines */}
        <line x1="250" y1="100" x2="250" y2="400" stroke="#E9D5FF" strokeWidth="0.2" strokeOpacity="0.5" />
        <line x1="150" y1="180" x2="350" y2="180" stroke="#E9D5FF" strokeWidth="0.2" strokeOpacity="0.5" />
        <line x1="180" y1="280" x2="320" y2="280" stroke="#E9D5FF" strokeWidth="0.2" strokeOpacity="0.5" />
        {/* Add many more lines for internal complexity */}
        {Array.from({length: 20}).map((_, i) => {
            const angle = (i / 20) * 2 * Math.PI;
            const x1 = 250 + Math.cos(angle) * 30;
            const y1 = 250 + Math.sin(angle) * 30;
            const x2 = 250 + Math.cos(angle) * (100 + Math.random() * 50);
            const y2 = 250 + Math.sin(angle) * (100 + Math.random() * 50);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D8B4FE" strokeWidth="0.1" strokeOpacity="0.3" />
        })}
    </g>

    {/* Outer Ring: Data Particles */}
    <g className="particles-ring">
      {Array.from({ length: 150 }).map((_, i) => {
        const angle = (i / 150) * 2 * Math.PI;
        const radius = 220 + (Math.random() - 0.5) * 10;
        const cx = 250 + Math.cos(angle) * radius;
        const cy = 250 + Math.sin(angle) * radius * 0.4; // Elliptical
        const r = Math.random() * 1.2 + 0.3;
        return <circle key={`p-${i}`} className="data-particle" cx={cx} cy={cy} r={r} />;
      })}
    </g>

    {/* Inner Ring: Data Blocks */}
    <g className="blocks-ring">
      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (i / 40) * 2 * Math.PI;
        const radius = 160;
        const cx = 250 + Math.cos(angle) * radius;
        const cy = 250 + Math.sin(angle) * radius * 0.6; // Elliptical
        return (
          <rect
            key={`b-${i}`}
            className="data-block"
            x={cx - 5}
            y={cy - 2}
            width="10"
            height="4"
            transform={`rotate(${angle * (180 / Math.PI) + 90} ${cx} ${cy})`}
          />
        );
      })}
    </g>
    
    {/* Filling out the lines requirement */}
    <g className="crystal-group" style={{ animationDirection: 'reverse', animationDuration: '90s'}}>
        {Array.from({length: 100}).map((_, i) => {
            const angle = Math.random() * 2 * Math.PI;
            const startRadius = Math.random() * 50;
            const endRadius = 50 + Math.random() * 100;
            const x1 = 250 + Math.cos(angle) * startRadius;
            const y1 = 250 + Math.sin(angle) * startRadius;
            const x2 = 250 + Math.cos(angle) * endRadius;
            const y2 = 250 + Math.sin(angle) * endRadius;
            return <line key={`fill-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C084FC" strokeWidth="0.2" strokeOpacity="0.2" />
        })}
    </g>

  </svg>
);

export default CrystalOfTrust; 