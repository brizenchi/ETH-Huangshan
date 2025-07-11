# ZK Proof Service

一个用于ZKVault项目的零知识证明生成服务，提供密码哈希生成和ZK证明生成的HTTP API。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd services
npm install
```

### 2. 确保ZK密钥存在

在运行服务之前，确保项目根目录下有必要的ZK密钥文件：

```bash
# 生成Z# 生成ZK证明
curl -X POST http://localhost:3000/api/generate-zk-proof \
  -H "Content-Type: application/json" \
  -d '{
    "password": "MySecretPassword123!",
    "passwordHash": "0x..."
  }'成）
cd ..
node scripts/generateZKKeys.js
```

需要的文件：
- `keys/password_verifier_simple_final.zkey` - 证明密钥
- `build/password_verifier_simple.wasm` - 电路WASM文件
- `keys/verification_key.json` - 验证密钥

### 3. 启动服务

```bash
npm start
```

服务将在 http://localhost:3000 启动

### 4. 测试服务

```bash
# 基础功能测试
npm test

# 完整工作流测试
npm run test:workflow
```

## 📋 API 文档

### 1. 生成密码哈希

**端点:** `POST /api/generate-password-hash`

**请求体:**
```json
{
  "password": "MySecretPassword123!"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "password": "MySecretPassword123!",
    "standardHash": "0x...",
    "fieldElement": "442297944342896795044627454118771915841722266401",
    "hashForCircuit": "0x...",
    "metadata": {
      "fieldElementHex": "0x...",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "method": "fieldElement squared mod p"
    }
  }
}
```

**说明:**
- `standardHash`: 标准Keccak256哈希（用于一般用途）
- `hashForCircuit`: ZK电路兼容的哈希（用于证明生成）
- `fieldElement`: 密码的域元素表示

### 2. 生成ZK证明

**端点:** `POST /api/generate-zk-proof`

**请求体:**
```json
{
  "password": "MySecretPassword123!",
  "passwordHash": "0x..."
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "proof": [
      "12345678901234567890123456789012345678901234567890123456789012345",
      "..."
    ],
    "publicInputs": [
      "98765432109876543210987654321098765432109876543210987654321098765"
    ],
    "metadata": {
      "proveTime": 1500,
      "localVerification": true,
      "timestamp": "2024-01-01T00:00:00.000Z",
      "service": "zkProofService"
    }
  }
}
```

**说明:**
- `proof`: Groth16证明数组（8个元素）
- `publicInputs`: 公共输入数组
- `metadata.localVerification`: 本地验证结果

### 3. 服务状态

**端点:** `GET /api/status`

**响应:**
```json
{
  "success": true,
  "data": {
    "service": "ZK Proof Service",
    "version": "1.0.0",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "zkGeneratorReady": true,
    "message": "✅ 服务运行正常"
  }
}
```

### 4. 健康检查

**端点:** `GET /health`

**响应:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 使用示例

### JavaScript客户端示例

```javascript
const { ZKProofServiceClient } = require('./testClient');

async function example() {
    const client = new ZKProofServiceClient('http://localhost:3000');
    
    // 1. 生成密码哈希
    const hashResult = await client.generatePasswordHash('MyPassword123!');
    const passwordHash = hashResult.data.hashForCircuit;
    
    // 2. 生成ZK证明
    const proofResult = await client.generateZKProof(
        'MyPassword123!',
        passwordHash,
        '123456789',
        '0x1234567890123456789012345678901234567890'
    );
    
    // 3. 用于合约调用
    const formattedProof = {
        proof: proofResult.data.proof.map(x => BigInt(x)),
        publicInputs: proofResult.data.publicInputs.map(x => BigInt(x))
    };
    
    // 现在可以调用合约
    // await zkVault.connect(claimer).claimWithZKProof(letterId, formattedProof);
}
```

### curl示例

```bash
# 生成密码哈希
curl -X POST http://localhost:3000/api/generate-password-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "MySecretPassword123!"}'

# 生成ZK证明
curl -X POST http://localhost:3000/api/generate-zk-proof \
  -H "Content-Type: application/json" \
  -d '{
    "password": "MySecretPassword123!",
    "passwordHash": "0x...",
    "nonce": "123456789",
    "claimerAddress": "0x1234567890123456789012345678901234567890"
  }'
```

## 🔧 开发模式

```bash
# 开发模式（自动重启）
npm run dev

# 监视测试
npm run test:watch
```

## ⚠️ 注意事项

1. **密钥文件**: 确保所有必要的ZK密钥文件存在
2. **内存使用**: ZK证明生成需要较大内存（推荐8GB+）
3. **生成时间**: 证明生成可能需要1-5秒
4. **BigInt序列化**: 响应中的大整数以字符串形式返回
5. **错误处理**: 服务包含完整的错误处理和验证

## 🔗 集成指南

### 与测试文件的兼容性

此服务完全兼容 `ZKVault.realZK.test.js` 中的实现：

```javascript
// 测试文件中的用法
const passwordHash = ethers.keccak256(ethers.toUtf8Bytes(testPassword));
const zkProof = await realZKGenerator.generatePasswordProof(
    testPassword,
    passwordHash,
    letterInfo._nonce,
    ethers.toBigInt(claimer.address)
);

// 服务API等效用法
const hashResult = await client.generatePasswordHash(testPassword);
const proofResult = await client.generateZKProof(
    testPassword,
    hashResult.data.hashForCircuit,
    letterInfo._nonce.toString(),
    claimer.address
);
```

### 前端集成

可以直接在React/Vue等前端框架中使用：

```javascript
import axios from 'axios';

const zkService = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 30000
});

// 在组件中使用
const generateProof = async (password, hash) => {
    const response = await zkService.post('/api/generate-zk-proof', {
        password, passwordHash: hash
    });
    return response.data;
};
```

## � 可用脚本

```bash
# 服务管理
npm start                 # 启动服务
npm run dev              # 开发模式（自动重启）

# 测试相关
npm test                 # 基础API测试
npm run test:workflow    # 完整工作流测试

# 演示相关
npm run demo            # 完整演示
npm run demo:send       # 发送信件演示
npm run demo:claim      # 领取信件演示
npm run demo:performance # 性能测试演示

# 实用工具
node checkStatus.js     # 检查服务状态
```

### 便捷启动脚本

Windows用户可以直接双击运行：
```bash
start.bat              # Windows启动脚本
```

Linux/Mac用户：
```bash
chmod +x start.sh
./start.sh             # Linux/Mac启动脚本
```
