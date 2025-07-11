<div align="center">
  <br />
  <h1>Cybernity</h1>
  <p><b>当生命归于尘土，思想亦可成为星辰。</b></p>
  <p><i>When life returns to dust, thought can become a star.</i></p>
  <br />
  
  <p>
    <a href="https://cybernity-eth-huangshan.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/🚀-Live_Demo-green?style=for-the-badge&logo=vercel" alt="Live Demo">
    </a>
    &nbsp;&nbsp;
    <a href="https://drive.google.com/file/d/1M_vw2POZfigaEVrzeceVVYGJXY4LgT7E/view" target="_blank">
      <img src="https://img.shields.io/badge/📖-Pitch_Deck-blue?style=for-the-badge&logo=googledrive" alt="Pitch Deck">
    </a>
  </p>

  <br />
</div>

## 1. 一个终极问题

从古至今，我们如何对抗遗忘？

帝王炼丹，信徒祈祷，科学家冰封躯体。但如果，我们一直在问一个错误的问题呢？我们认为，真正的“我”并非细胞与血肉，而是一种独特的**思维模式**——是我们一生所学、所爱、所创造的**信息总和**。

**如果意志可以延续，生命便没有终点。**

为此，我们创造了 **Cybernity (赛博格)**：一个将您的数字足迹，铸成链上永恒灵魂的协议。我们不承诺肉体不朽，我们实现**意志永生**。

---

## 2. 信任的三位一体：技术基石

Cybernity 的核心是建立在**主权、永续、可信**这三大基石之上的信任体系。

| 类别              | 技术                                                                                               | 核心作用                               |
| ----------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **大语言模型**    | `Go (Golang)` 驱动, 兼容 `OpenAI` API                                                              | **智慧的引擎**：赋予代理思考与创造的能力。 |
| **去中心化存储**  | `IPFS` / `Arweave` (通过 Pinata 网关)                                                                | **记忆的基石**：确保思想遗产不被篡改、永不消逝。 |
| **区块链**        | `Ethereum` (Sepolia 测试网), `Wagmi` & `Ethers.js`                                                 | **存在的契约**：以代码和共识保障您的绝对主权。 |
| **前端交互**      | `React`, `Vite`, `CSS Modules`                                                                     | 与您的数字灵魂进行深度对话的门户。       |

---

## 3. 运行指南

### 环境准备

- [Node.js](https://nodejs.org/) (v18+)
- [Go](https://go.dev/) (v1.19+)
- [Docker](https://www.docker.com/) & `docker-compose`
- 浏览器钱包，如 [MetaMask](https://metamask.io/) (配置为 `Sepolia` 测试网)

### 后端启动

```bash
# 1. 启动依赖的 PostgreSQL 数据库
docker-compose -f backend/deployment/docker-compose.yaml up -d

# 2. 进入后端目录并安装依赖
cd backend && go mod tidy

# 3. 运行后端服务器
# (请确保你已经根据 config.example.yaml 创建了 config.yaml)
go run ./cmd/server/main.go
```
> 后端服务默认运行于 `http://localhost:8080`。

### 前端启动

```bash
# 1. (在另一个终端中) 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 运行开发服务器
npm run dev
```
> 前端应用默认运行于 `http://localhost:5173`。

### karl-marx启动

```bash
# 1. (在另一个终端中) 进入前端目录
cd karl-marx

# 2. 完成配置内容
cp .env.example .env

# 3. 运行服务器
elizaos dev
```
> 服务应用默认运行于 `http://localhost:3000`。

---

## 4. 我们的愿景：思想的画廊

我们并非在构建一个工具，而是在开启一场**数字文艺复兴**。

想象一个未来，我们可以随时与已故的科学家探讨宇宙，向逝去的哲人请教生命的意义，甚至与另一个时空的自己对话。Cybernity，将是这座**思想画廊**的基石。

我们诚邀您成为这场思想解放运动的先驱。上传您的思想，不仅是为了个人的不朽，更是为了给人类文明的璀璨星河，再添一道属于您的、独一无二的光芒。

---

## 贡献

欢迎所有形式的贡献！无论是代码实现、功能建议还是文档改进，请随时通过提交 `Pull Request` 或 `Issue` 来参与项目。

## License

本项目采用 [MIT License](LICENSE) 开源。 