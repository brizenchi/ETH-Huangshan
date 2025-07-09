import React, { useMemo } from 'react';
import styles from './DotNav.module.css';

const DOT_SIZE = 12;
const GAP = 24; // 1.5rem in px (if 1rem = 16px)
const TOTAL_SPACING = DOT_SIZE + GAP;

const DotNav = ({ sections, activeIndex, onDotClick }) => {
  const indicatorStyle = useMemo(() => ({
    transform: `translateX(-50%) translateY(${activeIndex * TOTAL_SPACING}px)`,
  }), [activeIndex]);

  return (
    <nav className={styles.dotNav}>
      <div className={styles.track}></div>
      {/* 活动指示器，现在是track的兄弟节点 */}
      <div className={styles.indicator} style={indicatorStyle}></div>
      {/* 隐形的点击区域列表 */}
      <ul className={styles.clickableArea}>
        {sections.map((_, index) => (
          <li key={index} onClick={() => onDotClick(index)} />
        ))}
      </ul>
    </nav>
  );
};

export default DotNav; 