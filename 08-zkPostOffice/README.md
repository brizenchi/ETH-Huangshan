# ZK Post Office - 零知识证明邮局合约

## 🌟 项目介绍

ZK Post Office 是一个基于零知识证明（ZK-SNARK）的区块链邮局系统，用户可以安全地发送带有数字资产附件的信件，收件人通过零知识证明验证身份领取，无需暴露密码明文。

### 🎯 核心特性

- **零知识证明**: 使用ZK-SNARK技术保护用户隐私
- **多资产支持**: 支持ETH、ERC20、ERC721、ERC1155代币作为附件
- **密码保护**: 发送者设置密码，收件人需要提供正确密码的ZK证明
- **超时机制**: 超时未领取的信件可由发送者收回
- **完整工作流**: 包含前端界面、API服务和智能合约

### 🏗️ 技术架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端界面      │    │   ZK证明服务     │    │   智能合约      │
│   (Vue.js)      │◄──►│   (Node.js)     │◄──►│   (Solidity)    │
│                 │    │                 │    │                 │
│ - 信件发送      │    │ - 密码哈希生成   │    │ - 信件存储      │
│ - 信件领取      │    │ - ZK证明生成     │    │ - 资产托管      │
│ - 钱包连接      │    │ - 证明验证       │    │ - 权限控制      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 项目结构

```
zk-post-office-contracts/
├── contracts/          # 智能合约
│   ├── ZKVault.sol    # 主合约
│   ├── Vault.sol      # 基础合约
│   └── libraries/     # 辅助库
├── circuits/          # ZK电路
│   └── password_verifier_simple.circom
├── services/          # ZK证明服务
│   ├── zkProofService.js
│   └── zkProofGenerator.js
├── web/              # 前端界面
│   └── src/
├── test/             # 测试文件
├── deploy/           # 部署脚本
├── scripts/          # 工具脚本
└── keys/             # ZK密钥文件
```

## 🚀 快速开始

### 1. 环境准备

确保已安装以下工具：
- Node.js (dev: 20.16.0)
- npm (dev: 10.9.3)

### 2. 克隆项目

```bash
git clone <repository-url>
cd 08-zkPostOffice #后续都在这目录为基础
```

### 3. 安装依赖

```bash
# 安装主项目依赖
npm install

# 安装ZK证明服务依赖
cd services && npm install && cd ..

# 安装前端依赖
cd web && npm install && cd ..
```

### 4. 编译合约

```bash
npx hardhat compile
```

#### 部署合约

已经部署到ethereum sepolia, 详细信息在`deployments`

#### 启动ZK证明服务
**note: 保证3000端口没被占用**
```bash
# 启动ZK证明服务
cd services && npm run dev
```

#### 启动前端
**note: 先启动一个新终端(记得切换到08-zkPostOffice)**
```bash
# 启动前端开发服务器
cd web && npm run dev
```

## 📖 使用说明
### **note: 不是专业前端，有些细节问题不要深究😀**

### 发送信件

1. 连接钱包
2. 输入信件内容和密码(会通过api获取password hash)
3. 选择要附加的数字资产
4. 确认交易并发送
5. 记得复制letterId(忘了复制就只能去tx找了)

### 领取信件

1. 连接钱包
2. 输入信件ID查询信件公开信息
3. 输入密码查询隐藏信息，或者直接领取
4. 后端服务生成ZK证明
5. 确认交易并领取

## 未来展望
1. 直接使用zk证明领取，无需letterId(现在就行，但是来不及了)
2. 发送的附件可以拆分领取，再次增加隐秘性