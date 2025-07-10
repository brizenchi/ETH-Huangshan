import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import DotNav from '../components/DotNav';

// 将页面内容定义为数据，方便管理
const sectionsContent = [
  {
    type: 'hero',
    title: 'Cybernity',
    subtitle: 'Upload your mind, live forever on-chain.',
  },
  {
    type: 'page',
    title: 'The Future of Consciousness',
    subtitle: 'Discover how we are pioneering digital immortality.',
  },
  {
    type: 'page',
    title: 'Built on Secure Foundations',
    subtitle: 'Your legacy, preserved forever on the decentralized web.',
  },
  {
    type: 'page',
    title: 'Join The Digital Renaissance',
    subtitle: 'Become a part of the community shaping the future.',
  },
];

function LandingPage() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const sectionRefs = useRef([]);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  const handleLaunchApp = () => {
    setShowLanding(false); // 触发落地页的退场动画
    setTimeout(() => navigate('/app'), 500); // 动画结束后再切换组件
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const newIndex = parseInt(entry.target.dataset.index, 10);
            setActiveIndex((oldIndex) => {
              if (oldIndex !== newIndex) {
                setPreviousIndex(oldIndex);
              }
              return newIndex;
            });
          }
        });
      },
      {
        root: scrollContainerRef.current, // 在滚动容器内观察
        threshold: 0.5,
      }
    );

    const refs = sectionRefs.current;
    refs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      refs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const handleDotClick = (index) => {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className={`${styles.landingPageContainer} ${!showLanding ? styles.exiting : ''}`}>
      {/* 圆点导航层 (固定) */}
      <DotNav
        sections={sectionsContent}
        activeIndex={activeIndex}
        onDotClick={handleDotClick}
      />

      {/* 内容渲染层 (固定) */}
      <div className={styles.contentContainer}>
        {/* 全局HUD角落边框 */}
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
                <p>{content.subtitle}</p>
                <div className={styles.buttonContainer}>
                  <button className={styles.ctaButton} onClick={handleLaunchApp}>
                    Launch App
                  </button>
                  <button className={`${styles.ctaButton} ${styles.secondaryButton}`}>
                    Join Community
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.pageContent}>
                <div className={styles.gridBackground}></div>
                <h2>{content.title}</h2>
                <p>{content.subtitle}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* “幻影”滚动层 (可滚动) */}
      <main ref={scrollContainerRef} className={styles.scrollContainer}>
        {sectionsContent.map((_, index) => (
          <section
            key={index}
            ref={(el) => (sectionRefs.current[index] = el)}
            data-index={index} // 存储索引以供Observer使用
            className={styles.sectionTrigger}
          />
        ))}
      </main>
    </div>
  );
}

export default LandingPage; 