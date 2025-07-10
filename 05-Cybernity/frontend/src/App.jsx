/*
  文件注释：App.jsx (应用主组件)

  目标：
  作为 Cybernity 应用的根组件，负责整体布局和组合页面核心模块。

  核心思路：
  1.  **组件化结构**：App 组件自身不处理复杂的业务逻辑或视觉渲染，而是作为一个容器，协调其他更专业的子组件。
  2.  **职责分离**：
      -   **`KeyVisual` (即将创建)**：一个专门的子组件，将完全负责渲染背景的 3D 场景（宇宙、粒子、光球等）。这使得复杂的 3D 逻辑被封装起来，与应用的其它部分解耦。
      -   **`overlay` div**：一个简单的 HTML 元素，用于承载需要叠加在 3D 场景之上的2D内容（如标题、Slogan、UI按钮等）。这种分层结构可以让我们用熟悉的 HTML/CSS 来轻松管理UI，而无需在3D场景中渲染文字，性能和开发效率更高。
  3.  **样式管理**：引入 `App.module.css` (CSS Module)。这确保了 `App.jsx` 的样式（如 `.appContainer`, `.overlay`）是局部作用域的，不会污染到其它组件，避免了全局CSS可能引发的样式冲突。
*/

// 导入 React 库，这是构建任何 React 组件的基础。
import React, { useState, useEffect, useRef } from 'react';

// 导入 CSS Module 文件。'styles' 对象将包含所有在 App.module.css 中定义的类名。
// 这种方式可以保证样式的局部作用域。
import styles from './App.module.css';

// (即将创建) 导入 KeyVisual 组件，它将负责渲染我们的核心3D主视觉。
import KeyVisual from './components/KeyVisual.jsx';
import DotNav from './components/DotNav.jsx';
import AgentPlatform from './pages/AgentPlatform.jsx'; // 引入新的App页面

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

function App() {
  const [appLaunched, setAppLaunched] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const sectionRefs = useRef([]);
  // 新增：对滚动容器的引用
  const scrollContainerRef = useRef(null);

  const handleLaunchApp = () => {
    setShowLanding(false); // 触发落地页的退场动画
    setTimeout(() => setAppLaunched(true), 500); // 动画结束后再切换组件
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

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
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
    <div className={styles.appContainer}>
      {/* 3D背景层 (固定) */}
      <div className={styles.keyVisualContainer}>
        <KeyVisual />
      </div>
      
      {appLaunched ? (
        <AgentPlatform />
      ) : (
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
      )}
    </div>
  );
}

// 导出 App 组件，以便在项目的入口文件 (main.jsx) 中使用。
export default App;
