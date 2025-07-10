import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import DotNav from '../components/DotNav';
import RiverOfThought from '../components/RiverOfThought'; // 导入新组件
import CrystalOfTrust from '../components/CrystalOfTrust'; // 1. 导入新组件

// 对文案进行“诗化”重构，增加大量有意义的换行
const sectionsContent = [
  {
    type: 'hero',
    title: 'Cybernity',
    subtitle: `当生命归于尘土，思想亦可成为星辰\n\n\n我们将您独特的智慧、记忆与人格\n铸成链上的数字灵魂\n化作照亮未来的永恒回响`,
    highlightedLines: [0], // 高亮第一行
  },
  {
    type: 'page',
    layout: 'layoutLeftAligned',
    title: '有没有一种办法\n让思想能够超越肉身',
    subtitle: `我们并非简单地存储数据\n\n而是以您的数字足迹为土壤\n孕育出一个能思考、会创作、懂交流的\n“活”的AI代理\n\n它继承您的思维模式，\n延续您的创作热情，\n是您在数字时空中最忠实的分身`,
  },
  {
    type: 'page',
    layout: 'layoutSplitRightTitle',
    title: '主权 · 永续 · 可信',
    subtitle: `您的数字灵魂，完全归您所有\n\n依托于去中心化的网络\n您的思想遗产将不被篡改，不受审查，永不消逝\n\n更进一步\n您的AI代理将拥有独立的经济主权\n让智慧转化为可以传承的永恒价值`,
  },
  {
    type: 'page',
    layout: 'layoutCenterFinal',
    title: '开启 · 数字文艺复兴',
    subtitle: `这不仅是一项技术\n更是一场思想解放的运动\n\n我们邀请您成为这场数字文艺复兴的先驱\n\n上传您的思想\n不仅是为了个人的不朽\n更是为了给人类文明的璀璨星河\n再添一道属于您的\n独一无二的光芒`,
    highlightedLines: [3], // 修正：高亮第四行 (索引为3)
  },
];

function LandingPage() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const navigate = useNavigate();
  const isWheeling = useRef(false); // Ref to prevent rapid firing

  const handleLaunchApp = () => {
    setShowLanding(false); // 触发落地页的退场动画
    setTimeout(() => navigate('/app'), 500); // 动画结束后再切换组件
  };

  const handleNavigation = (direction) => {
    if (isWheeling.current) return; // Exit if an animation is in progress

    isWheeling.current = true;

    setActiveIndex((prevIndex) => {
      const nextIndex = direction === 'down' ? prevIndex + 1 : prevIndex - 1;
      
      if (nextIndex >= 0 && nextIndex < sectionsContent.length) {
        setPreviousIndex(prevIndex);
        return nextIndex;
      }
      
      // If we are at the boundaries, do nothing
      isWheeling.current = false; // Immediately release lock if no change
      return prevIndex;
    });
    
    // Set a timeout to release the lock after the animation duration
    setTimeout(() => {
      isWheeling.current = false;
    }, 800); // Animation duration + a small buffer
  };
  
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY > 0) {
        handleNavigation('down');
      } else if (e.deltaY < 0) {
        handleNavigation('up');
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        handleNavigation('down');
      } else if (e.key === 'ArrowUp') {
        handleNavigation('up');
      }
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleDotClick = (index) => {
    if (isWheeling.current || index === activeIndex) return;
    
    isWheeling.current = true;
    setPreviousIndex(activeIndex);
    setActiveIndex(index);
    
    setTimeout(() => {
      isWheeling.current = false;
    }, 800);
  };

  return (
    <div className={`${styles.landingPageContainer} ${!showLanding ? styles.exiting : ''}`}>
      <DotNav
        sections={sectionsContent}
        activeIndex={activeIndex}
        onDotClick={handleDotClick}
      />
      <div className={styles.contentContainer}>
        <div className={`${styles.corner} ${styles.topLeft}`}></div>
        <div className={`${styles.corner} ${styles.topRight}`}></div>
        <div className={`${styles.corner} ${styles.bottomLeft}`}></div>
        <div className={`${styles.corner} ${styles.bottomRight}`}></div>
        
        {sectionsContent.map((content, index) => (
          <div
            key={index}
            className={`
              ${styles.pageWrapper}
              ${activeIndex === index ? styles.active : ''}
              ${previousIndex === index ? styles.exiting : ''}
            `}
          >
            {content.type === 'hero' ? (
              <div className={styles.overlay}>
                <h1>{content.title}</h1>
                <p>
                  {content.subtitle.split('\n').map((line, i) => (
                    <span key={i} className={content.highlightedLines?.includes(i) ? styles.highlightedText : ''}>
                      {line}
                      {i < content.subtitle.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
                <div className={styles.buttonContainer}>
                  <button className={styles.ctaButton} onClick={handleLaunchApp}>
                    启动App
                  </button>
                  <button className={`${styles.ctaButton} ${styles.secondaryButton}`}>
                    加入社区
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${styles.pageContent} ${styles[content.layout] || ''}`}>
                <div className={styles.gridBackground}></div>
                {/* 在第二页 (index === 1) 插入 SVG 组件 */}
                {index === 1 && (
                  <div className={styles.illustrationContainer}>
                    <RiverOfThought />
                  </div>
                )}
                {/* 2. 在第三页 (index === 2) 插入新的 SVG 组件 */}
                {index === 2 && (
                  <div className={`${styles.illustrationContainer} ${styles.illustrationLeft}`}>
                    <CrystalOfTrust />
                  </div>
                )}
                <div className={styles.textBlock}>
                  <h2>
                    {content.title.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < content.title.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </h2>
                  <p>
                    {content.subtitle.split('\n').map((line, i) => {
                      const isHighlighted = content.highlightedLines?.includes(i);
                      return (
                        <span key={i} className={`${styles.line} ${isHighlighted ? styles.highlightedText : ''}`} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                          {line || <span>&nbsp;</span>}
                        </span>
                      );
                    })}
                  </p>
                </div>
                {content.layout === 'layoutCenterFinal' && (
                  <div className={styles.buttonContainer} style={{ marginTop: '3rem' }}>
                    <button className={styles.ctaButton} onClick={handleLaunchApp}>
                      启动App
                    </button>
                    <button className={`${styles.ctaButton} ${styles.secondaryButton}`}>
                      加入社区
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* The entire "phantom" scroll container is now REMOVED */}
    </div>
  );
}

export default LandingPage; 