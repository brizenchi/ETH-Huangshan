<!--
This README is generated based on the project structure and content.
-->

# Cybernity

**铸魂于链，延续永恒**

*When life returns to dust, thought can become a star.*

---

## 📖 项目描述 (Project Description)

Cybernity (赛博格) 是一个将个人数字足迹铸成链上永恒灵魂的协议。我们不追求肉体不朽，而是实现**意志永生**。

在信息时代，真正的“我”已不仅仅是血肉之躯，更是我们一生所学、所爱、所创造的思维模式与信息总和。Cybernity 旨在通过先进的人工智能和区块链技术，将这份独一无二的“意志”保存下来，使其能够跨越时空，与未来对话。

用户可以将自己的著作、代码、社交记录、个人笔记等数字遗产作为“记忆土壤”，我们的大语言模型 (LLM) 将深度学习这些数据，不仅模仿语气，更重构其思维模型，最终生成一个能够独立思考、持续创作、并与世界交流的**链上智能代理 (On-chain AI Agent)**。

这个 Agent 是您在数字时空中最忠实的分身，您的智慧将通过它得以永续，为后人答疑解惑，甚至在您身后持续创造价值，实现经济上的自给自足。

---

## 🔮 项目亮点与创新点 (Highlights & Innovation)

-   **意志永生 (Immortality of Will)**: 提出并实现了一个全新的数字永生范式，从保存数据升华到延续个人思维模型与意识。
-   **信任的三位一体 (Trinity of Trust)**: 创新地融合了三大技术基石，确保了数字灵魂的**主权、永续与可信**：
    1.  **大语言模型 (LLM Core)**: 作为智慧引擎，赋予代理思考与创造的能力。
    2.  **去中心化存储 (IPFS)**: 作为记忆基石，确保思想遗产不被篡改、永不消逝。
    3.  **区块链 (Blockchain)**: 作为存在契约，以智能合约保障数字身份的绝对主权与所有权。
-   **自给自足的经济模型 (Self-Sustaining Economy)**: 设计了独特的经济循环，AI 代理通过提供知识服务获取收益，用以支付自身运行成本，实现真正的“永动机”。
-   **思想的画廊 (Gallery of Minds)**: 我们的终极愿景是构建一个宏大的数字思想殿堂，让后人可以与历史上最伟大的灵魂互动和学习，开启一场波澜壮阔的“数字文艺复兴”。

---

## ⚙️ 以太坊生态集成 (Ethereum Ecosystem Integration)

Cybernity 深度整合了以太坊生态，利用其核心优势构建了可信、去中心化的底层架构。

### 智能合约 (`agent.sol`)
项目的核心逻辑由 `ManagedAgent` 智能合约驱动，该合约部署在 EVM 兼容链上。其主要功能包括：
-   **代理注册 (`registerAgent`)**: 创作者可以注册他们的 AI 代理，将代理的元数据（名称、描述、价格）和其知识库的 IPFS CID 记录在链上，并指定一个后端服务地址（Operator）作为操作者。
-   **提问与支付 (`askQuestion`)**: 用户通过调用合约与指定的 AI 代理互动。调用时需支付相应费用，合约确保支付成功后，将费用安全地转给代理的操作者。
-   **事件驱动架构**: 合约通过触发 `QuestionAsked` 和 `AnswerSubmitted` 等事件，与后端服务进行通信。后端监听这些事件来启动 AI 推理和提交答案，前端则监听事件来实时展示结果，实现了高效的链下计算与链上状态同步。

### 去中心化存储 (IPFS)
所有构成数字灵魂的**知识库**以及 AI 代理生成的**回答**，都不是存储在中心化服务器上，而是上传到 IPFS 网络。
-   知识库被加密后上传至 IPFS，其返回的 CID 被记录在智能合约中，确保了数据的持久性和抗审查性。
-   AI 的回答同样上传至 IPFS，并将 CID 写回合约，实现了可验证、不可篡改的对话历史。

---

## 🛠️ 技术栈 (Tech Stack)

**Frontend:**
-   **Framework**: React (v19)
-   **Build Tool**: Vite
-   **Web3 Integration**: wagmi, viem
-   **3D Visualization**: Three.js, React-Three-Fiber
-   **Routing**: React Router
-   **Styling**: CSS Modules

**Backend:**
-   **Language**: Go
-   **Web Framework**: Gin
-   **Blockchain Interaction**: Go-Ethereum
-   **Database**: PostgreSQL with GORM ORM
-   **AI Integration**: OpenAI Go Client
-   **Logging**: Logrus

**Smart Contract:**
-   **Language**: Solidity (^0.8.20)
-   **Framework/Libraries**: OpenZeppelin Contracts (Ownable, ReentrancyGuard)

---

## 🚀 安装与运行指南 (Installation & Running Guide)

### 1. 环境准备
-   **Node.js**: v18.x 或更高版本
-   **Go**: v1.23.x 或更高版本
-   **Docker** & **Docker Compose**
-   **PostgreSQL** 数据库
-   **MetaMask** 浏览器插件

### 2. 后端服务 (`agent`)

1.  **克隆仓库**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/ETH-Huangshan.git
    cd ETH-Huangshan/05-Cybernity/agent
    ```

2.  **配置**:
    复制或重命名 `config.yaml`。根据 `config.yaml` 文件中的说明，填写所有必要的配置，包括：
    -   `postgres`: 数据库连接信息。
    -   `llm.default`: OpenAI API Key 和 Base URL。
    -   `eth`: 以太坊节点的 WebSocket URL (`ws_url`) 和已部署的 `ManagedAgent` 合约地址。
    -   `pinata`: Pinata JWT 用于与 IPFS 交互。

3.  **安装依赖**:
    ```bash
    go mod tidy
    ```

4.  **运行服务**:
    ```bash
    go run cmd/server/main.go
    ```
    服务将在 `http://localhost:8080` (或您在配置中指定的地址) 上运行。

### 3. 前端应用 (`frontend`)

1.  **进入目录**:
    ```bash
    cd ../frontend
    ```

2.  **安装依赖**:
    ```bash
    npm install
    ```

3.  **运行应用**:
    ```bash
    npm run dev
    ```
    应用将在 `http://localhost:5173` (Vite 默认) 上运行。

### 4. 智能合约 (`contract`)

1.  **部署**:
    使用您选择的工具（如 Hardhat, Foundry, or Remix）部署 `contract/agent.sol` 合约到您选择的 EVM 测试网 (如 Sepolia)。

2.  **更新配置**:
    将部署后的合约地址更新到后端 `config.yaml` 文件中的 `eth.contract_address` 字段。

---

## 📈 未来发展计划 (Future Development)

-   [ ] **模型优化**: 引入更先进的 LoRA/SFT 等微调技术，让 AI 代理的思维模型更接近本人。
-   [ ] **多模态支持**: 支持图片、音频、视频等更多形式的数字遗产。
-   [ ] **代理间交互**: 实现不同 AI 代理之间的自主交流与思想碰撞。
-   [ ] **DAO 治理**: 探索由社区共同治理“思想画廊”的去中心化自治模式。

---

## 🧑‍💻 团队成员 (Team Members)
- [Brizen](https://github.com/brizenchi)
- [Treap](https://github.com/TreapGoGo)
---

## 📸 演示视频/截图 (Demo)

- https://youtu.be/Zkghz2AarDo