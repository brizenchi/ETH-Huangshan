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
import React from 'react';

// 导入 CSS Module 文件。'styles' 对象将包含所有在 App.module.css 中定义的类名。
// 这种方式可以保证样式的局部作用域。
import styles from './App.module.css';

// (即将创建) 导入 KeyVisual 组件，它将负责渲染我们的核心3D主视觉。
import KeyVisual from './components/KeyVisual.jsx';

function App() {
  // `return` 语句定义了组件的输出结构。
  return (
    // 使用 CSS Module 中定义的 'appContainer' 样式，它将作为整个应用的根容器。
    <div className={styles.appContainer}>
      {/* 
        这里是未来放置3D主视觉场景的地方。
        我们将把 <KeyVisual /> 组件放在这里。
        目前暂时注释掉，直到该组件被创建。
      */}
      <KeyVisual />

      {/* 
        这是文本信息的浮层容器。
        它会叠加在3D场景之上，用于显示品牌名和Slogan。
        使用 'overlay' 样式可以方便地控制其位置（例如，居中显示）。
      */}
      <div className={styles.overlay}>
        {/* 标题：项目名称 */}
        <h1>Cybernity</h1>
        {/* 副标题：项目的 Slogan */}
        <p>Upload your mind, live forever on-chain.</p>
      </div>
    </div>
  );
}

// 导出 App 组件，以便在项目的入口文件 (main.jsx) 中使用。
export default App;
