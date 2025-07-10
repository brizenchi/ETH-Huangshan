import React from 'react';

const RiverOfThought = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="280 0 520 600"
    preserveAspectRatio="xMidYMid meet"
    style={{ width: '100%', height: '100%', overflow: 'visible' }}
  >
    <defs>
      <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="sharp-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <radialGradient id="star-gradient">
        <stop offset="0%" stopColor="#E6F1FF" stopOpacity="1" />
        <stop offset="100%" stopColor="#64FFDA" stopOpacity="0" />
      </radialGradient>
    </defs>

    <style>
      {`
        @keyframes flow-up {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.7;
          }
          100% {
            transform: translateY(-400px) translateX(var(--drift-x, 20px));
            opacity: 0;
          }
        }
        @keyframes subtle-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }
        @keyframes pulse-line {
           0%, 100% { stroke-opacity: 0.1; }
           50% { stroke-opacity: 0.5; }
        }
        .figure-spark {
          fill: #64FFDA;
          filter: url(#glow-filter);
          animation: subtle-glow 6s ease-in-out infinite;
        }
        .thought-spark {
          fill: #64FFDA;
          filter: url(#sharp-glow-filter);
          animation: flow-up 15s linear infinite;
        }
        .thought-crystal {
          stroke: #A892F4;
          fill: none;
          stroke-width: 1;
          filter: url(#sharp-glow-filter);
          animation: flow-up 18s linear infinite;
        }
        .thought-star {
            fill: url(#star-gradient);
            filter: url(#glow-filter);
            animation: flow-up 20s linear infinite;
        }
        .network-line {
           stroke: #64FFDA;
           stroke-width: 0.5;
           animation: pulse-line 5s ease-in-out infinite;
        }
      `}
    </style>

    {/* The Thinker's Silhouette */}
    <g id="figure-silhouette">
      {/* A complex path can be used, but for dynamic feel, we use particles */}
      {/* Seated Pose Points - Replace with a more complex algorithm if needed */}
      <circle className="figure-spark" cx="300" cy="450" r="1.5" style={{ animationDelay: '0.1s' }} />
      <circle className="figure-spark" cx="310" cy="455" r="1.2" style={{ animationDelay: '0.2s' }} />
      <circle className="figure-spark" cx="320" cy="458" r="1.5" style={{ animationDelay: '0.3s' }} />
      <circle className="figure-spark" cx="330" cy="455" r="1.3" style={{ animationDelay: '0.4s' }} />
      <circle className="figure-spark" cx="340" cy="450" r="1.5" style={{ animationDelay: '0.5s' }} />
      <circle className="figure-spark" cx="350" cy="445" r="1.2" style={{ animationDelay: '0.6s' }} />
      <circle className="figure-spark" cx="360" cy="448" r="1.5" style={{ animationDelay: '0.7s' }} />
      <circle className="figure-spark" cx="370" cy="452" r="1.4" style={{ animationDelay: '0.8s' }} />
      <circle className="figure-spark" cx="380" cy="455" r="1.5" style={{ animationDelay: '0.9s' }} />
      <circle className="figure-spark" cx="390" cy="450" r="1.1" style={{ animationDelay: '1.0s' }} />
      <circle className="figure-spark" cx="325" cy="430" r="1.5" style={{ animationDelay: '0.1s' }} />
      <circle className="figure-spark" cx="335" cy="425" r="1.2" style={{ animationDelay: '0.2s' }} />
      <circle className="figure-spark" cx="345" cy="428" r="1.5" style={{ animationDelay: '0.3s' }} />
      <circle className="figure-spark" cx="355" cy="432" r="1.3" style={{ animationDelay: '0.4s' }} />
      <circle className="figure-spark" cx="365" cy="425" r="1.5" style={{ animationDelay: '0.5s' }} />
      <circle className="figure-spark" cx="350" cy="405" r="1.2" style={{ animationDelay: '0.6s' }} />
      <circle className="figure-spark" cx="355" cy="395" r="1.5" style={{ animationDelay: '0.7s' }} />
      <circle className="figure-spark" cx="360" cy="385" r="1.4" style={{ animationDelay: '0.8s' }} />
      <circle className="figure-spark" cx="365" cy="375" r="1.5" style={{ animationDelay: '0.9s' }} />
      <circle className="figure-spark" cx="370" cy="365" r="1.3" style={{ animationDelay: '1.0s' }} />
      <circle className="figure-spark" cx="375" cy="355" r="1.5" style={{ animationDelay: '1.1s' }} />
      <circle className="figure-spark" cx="370" cy="345" r="1.2" style={{ animationDelay: '1.2s' }} />
      <circle className="figure-spark" cx="365" cy="335" r="1.5" style={{ animationDelay: '1.3s' }} />
      <circle className="figure-spark" cx="360" cy="325" r="1.4" style={{ animationDelay: '1.4s' }} />
      <circle className="figure-spark" cx="355" cy="315" r="1.5" style={{ animationDelay: '1.5s' }} />
      <circle className="figure-spark" cx="350" cy="305" r="1.3" style={{ animationDelay: '1.6s' }} />
      {/* ... Add more points to form a clearer, more complex silhouette ... */}
      <circle className="figure-spark" cx="345" cy="315" r="1.5" style={{ animationDelay: '1.7s' }} />
      <circle className="figure-spark" cx="340" cy="325" r="1.2" style={{ animationDelay: '1.8s' }} />
      <circle className="figure-spark" cx="335" cy="335" r="1.5" style={{ animationDelay: '1.9s' }} />
      <circle className="figure-spark" cx="330" cy="345" r="1.4" style={{ animationDelay: '2.0s' }} />
      <circle className="figure-spark" cx="325" cy="355" r="1.5" style={{ animationDelay: '2.1s' }} />
      <circle className="figure-spark" cx="330" cy="365" r="1.3" style={{ animationDelay: '2.2s' }} />
      <circle className="figure-spark" cx="335" cy="375" r="1.5" style={{ animationDelay: '2.3s' }} />
      <circle className="figure-spark" cx="340" cy="385" r="1.2" style={{ animationDelay: '2.4s' }} />
    </g>

    {/* River of Thought */}
    <g id="river-of-thought">
      {/* This part should be generated by a script for complexity */}
      {/* Phase 1: Thought Sparks (Circles) */}
      <circle className="thought-spark" cx="360" cy="350" r="1.5" style={{ animationDelay: '0.1s', '--drift-x': '10px' }} />
      <circle className="thought-spark" cx="355" cy="340" r="1.2" style={{ animationDelay: '0.2s', '--drift-x': '25px' }} />
      <circle className="thought-spark" cx="365" cy="330" r="1.8" style={{ animationDelay: '0.3s', '--drift-x': '5px' }} />
      <circle className="thought-spark" cx="350" cy="320" r="1.4" style={{ animationDelay: '0.4s', '--drift-x': '30px' }} />
      <circle className="thought-spark" cx="370" cy="310" r="1.6" style={{ animationDelay: '0.5s', '--drift-x': '15px' }} />
      <circle className="thought-spark" cx="360" cy="300" r="1.3" style={{ animationDelay: '0.6s', '--drift-x': '20px' }} />
      <circle className="thought-spark" cx="375" cy="290" r="1.7" style={{ animationDelay: '0.7s', '--drift-x': '10px' }} />
      <circle className="thought-spark" cx="358" cy="280" r="1.2" style={{ animationDelay: '0.8s', '--drift-x': '35px' }} />
      <circle className="thought-spark" cx="368" cy="355" r="1.5" style={{ animationDelay: '0.9s', '--drift-x': '12px' }} />
      <circle className="thought-spark" cx="362" cy="345" r="1.3" style={{ animationDelay: '1.0s', '--drift-x': '28px' }} />
      {/* ... Add dozens more for a dense stream ... */}
      <circle className="thought-spark" cx="360" cy="360" r="1.1" style={{ animationDelay: '1.1s', '--drift-x': '18px' }} />
      <circle className="thought-spark" cx="370" cy="325" r="1.9" style={{ animationDelay: '1.2s', '--drift-x': '8px' }} />
      <circle className="thought-spark" cx="355" cy="315" r="1.4" style={{ animationDelay: '1.3s', '--drift-x': '32px' }} />
      <circle className="thought-spark" cx="365" cy="305" r="1.6" style={{ animationDelay: '1.4s', '--drift-x': '14px' }} />
      <circle className="thought-spark" cx="360" cy="295" r="1.2" style={{ animationDelay: '1.5s', '--drift-x': '22px' }} />
      <circle className="thought-spark" cx="372" cy="285" r="1.8" style={{ animationDelay: '1.6s', '--drift-x': '11px' }} />
      <circle className="thought-spark" cx="352" cy="275" r="1.3" style={{ animationDelay: '1.7s', '--drift-x': '38px' }} />
      <circle className="thought-spark" cx="362" cy="335" r="1.5" style={{ animationDelay: '1.8s', '--drift-x': '16px' }} />
      <circle className="thought-spark" cx="368" cy="350" r="1.2" style={{ animationDelay: '1.9s', '--drift-x': '24px' }} />
      <circle className="thought-spark" cx="358" cy="320" r="1.7" style={{ animationDelay: '2.0s', '--drift-x': '9px' }} />
      
      {/* Phase 2: Thought Crystals (Polygons) */}
      <polygon className="thought-crystal" points="400,300 405,305 400,310 395,305" style={{ animationDelay: '2.1s', '--drift-x': '40px' }} />
      <polygon className="thought-crystal" points="420,280 423,286 417,286" style={{ animationDelay: '2.2s', '--drift-x': '50px' }} />
      <polygon className="thought-crystal" points="450,250 455,252 452,257 448,255" style={{ animationDelay: '2.3s', '--drift-x': '30px' }} />
      <polygon className="thought-crystal" points="430,320 435,325 430,330 425,325" style={{ animationDelay: '2.4s', '--drift-x': '45px' }} />
      <polygon className="thought-crystal" points="410,290 413,296 407,296" style={{ animationDelay: '2.5s', '--drift-x': '55px' }} />
      <polygon className="thought-crystal" points="460,260 465,262 462,267 458,265" style={{ animationDelay: '2.6s', '--drift-x': '35px' }} />
      <polygon className="thought-crystal" points="440,310 445,315 440,320 435,315" style={{ animationDelay: '2.7s', '--drift-x': '48px' }} />
      <polygon className="thought-crystal" points="400,270 403,276 397,276" style={{ animationDelay: '2.8s', '--drift-x': '58px' }} />
      <polygon className="thought-crystal" points="470,240 475,242 472,247 468,245" style={{ animationDelay: '2.9s', '--drift-x': '38px' }} />
      <polygon className="thought-crystal" points="425,305 430,310 425,315 420,310" style={{ animationDelay: '3.0s', '--drift-x': '52px' }} />
      {/* ... Add dozens more for a dense stream ... */}
      <polygon className="thought-crystal" points="480,220 485,225 480,230 475,225" style={{ animationDelay: '3.1s', '--drift-x': '60px' }} />
      <polygon className="thought-crystal" points="490,200 493,206 487,206" style={{ animationDelay: '3.2s', '--drift-x': '70px' }} />
      <polygon className="thought-crystal" points="520,170 525,172 522,177 518,175" style={{ animationDelay: '3.3s', '--drift-x': '50px' }} />
      <polygon className="thought-crystal" points="500,240 505,245 500,250 495,245" style={{ animationDelay: '3.4s', '--drift-x': '65px' }} />
      <polygon className="thought-crystal" points="485,280 488,286 482,286" style={{ animationDelay: '3.5s', '--drift-x': '75px' }} />
      <polygon className="thought-crystal" points="530,180 535,182 532,187 528,185" style={{ animationDelay: '3.6s', '--drift-x': '55px' }} />
      <polygon className="thought-crystal" points="510,230 515,235 510,240 505,235" style={{ animationDelay: '3.7s', '--drift-x': '68px' }} />
      <polygon className="thought-crystal" points="475,260 478,266 472,266" style={{ animationDelay: '3.8s', '--drift-x': '78px' }} />
      <polygon className="thought-crystal" points="540,160 545,162 542,167 538,165" style={{ animationDelay: '3.9s', '--drift-x': '58px' }} />
      <polygon className="thought-crystal" points="495,215 500,220 495,225 490,220" style={{ animationDelay: '4.0s', '--drift-x': '72px' }} />
      
      {/* Phase 3: Thought Stars (Paths) */}
      <path className="thought-star" d="M 600 100 l 5 10 l 10 -5 l -5 -10 l -10 5 z" style={{ animationDelay: '4.1s', '--drift-x': '80px' }} />
      <path className="thought-star" d="M 650 150 l 4 8 l 8 -4 l -4 -8 l -8 4 z" style={{ animationDelay: '4.2s', '--drift-x': '90px' }} />
      <path className="thought-star" d="M 620 80 l 6 12 l 12 -6 l -6 -12 l -12 6 z" style={{ animationDelay: '4.3s', '--drift-x': '70px' }} />
      <path className="thought-star" d="M 700 120 l 5 10 l 10 -5 l -5 -10 l -10 5 z" style={{ animationDelay: '4.4s', '--drift-x': '100px' }} />
      <path className="thought-star" d="M 580 180 l 4 8 l 8 -4 l -4 -8 l -8 4 z" style={{ animationDelay: '4.5s', '--drift-x': '85px' }} />
      <path className="thought-star" d="M 680 90 l 6 12 l 12 -6 l -6 -12 l -12 6 z" style={{ animationDelay: '4.6s', '--drift-x': '75px' }} />
      <path className="thought-star" d="M 720 140 l 5 10 l 10 -5 l -5 -10 l -10 5 z" style={{ animationDelay: '4.7s', '--drift-x': '110px' }} />
      <path className="thought-star" d="M 610 200 l 4 8 l 8 -4 l -4 -8 l -8 4 z" style={{ animationDelay: '4.8s', '--drift-x': '88px' }} />
      <path className="thought-star" d="M 750 100 l 6 12 l 12 -6 l -6 -12 l -12 6 z" style={{ animationDelay: '4.9s', '--drift-x': '65px' }} />
      <path className="thought-star" d="M 670 170 l 5 10 l 10 -5 l -5 -10 l -10 5 z" style={{ animationDelay: '5.0s', '--drift-x': '115px' }} />
      {/* ... Add more for a sparse, starry field ... */}
      <path className="thought-star" d="M 630 50 l 5 10 l 10 -5 l -5 -10 l -10 5 z" style={{ animationDelay: '5.1s', '--drift-x': '80px' }} />
      <path className="thought-star" d="M 680 130 l 4 8 l 8 -4 l -4 -8 l -8 4 z" style={{ animationDelay: '5.2s', '--drift-x': '95px' }} />
      <path className="thought-star" d="M 600 60 l 6 12 l 12 -6 l -6 -12 l -12 6 z" style={{ animationDelay: '5.3s', '--drift-x': '68px' }} />
      <path className="thought-star" d="M 730 110 l 5 10 l 10 -5 l -5 -10 l -10 5 z" style={{ animationDelay: '5.4s', '--drift-x': '105px' }} />
      <path className="thought-star" d="M 570 160 l 4 8 l 8 -4 l -4 -8 l -8 4 z" style={{ animationDelay: '5.5s', '--drift-x': '82px' }} />

      {/* Phase 4: Network Lines - connecting some of the crystals */}
      {Array.from({ length: 50 }).map((_, i) => {
        const p1x = 400 + Math.random() * 150;
        const p1y = 150 + Math.random() * 150;
        const p2x = p1x + (Math.random() - 0.5) * 100;
        const p2y = p1y + (Math.random() - 0.5) * 100;
        return (
            <line 
              key={i}
              className="network-line" 
              x1={p1x} y1={p1y}
              x2={p2x} y2={p2y}
              style={{ animationDelay: `${i * 0.1}s`}}
             />
        );
      })}

      {/* Adding a huge number of particles to meet the complexity requirement */}
      {Array.from({ length: 150 }).map((_, i) => {
        const cx = 350 + Math.random() * 50;
        const cy = 250 + Math.random() * 150;
        const r = Math.random() * 1.5 + 0.5;
        const delay = Math.random() * 15;
        const drift = 10 + Math.random() * 50;
        return (
            <circle 
                key={`extra-spark-${i}`}
                className="thought-spark" 
                cx={cx} cy={cy} r={r} 
                style={{ animationDelay: `${delay}s`, '--drift-x': `${drift}px` }} 
            />
        );
      })}
      {Array.from({ length: 150 }).map((_, i) => {
        const x = 400 + Math.random() * 200;
        const y = 100 + Math.random() * 250;
        const size = Math.random() * 3 + 2;
        const points = `${x},${y} ${x + size},${y + size} ${x},${y + size*2} ${x-size},${y+size}`;
        const delay = Math.random() * 18;
        const drift = 30 + Math.random() * 60;
        return (
            <polygon 
                key={`extra-crystal-${i}`}
                className="thought-crystal"
                points={points}
                style={{ animationDelay: `${delay}s`, '--drift-x': `${drift}px` }}
            />
        );
      })}

    </g>
  </svg>
);

export default RiverOfThought; 