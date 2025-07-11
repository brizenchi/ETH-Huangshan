const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const { RealZKProofGenerator } = require('./zkProofGenerator');

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 全局ZK证明生成器实例
let zkGenerator = null;

/**
 * 初始化ZK证明生成器
 */
async function initializeZKGenerator() {
    if (!zkGenerator) {
        try {
            console.log('🔧 初始化ZK证明生成器...');
            // 设置项目根目录路径（从services目录向上一级）
            const projectRoot = require('path').join(__dirname, '..');
            zkGenerator = new RealZKProofGenerator({ projectRoot });
            await zkGenerator.initialize();
            console.log('✅ ZK证明生成器初始化成功');
        } catch (error) {
            console.error('❌ ZK证明生成器初始化失败:', error.message);
            zkGenerator = null;
            throw error;
        }
    }
    return zkGenerator;
}

/**
 * 将字符串转换为电路可用的域元素（与ZK电路逻辑一致）
 */
function _stringToFieldElement(str) {
    const bytes = Buffer.from(str, 'utf8');
    let result = BigInt(0);
    for (let i = 0; i < Math.min(bytes.length, 31); i++) {
        result = result * BigInt(256) + BigInt(bytes[i]);
    }
    return result;
}

/**
 * 计算密码哈希（与ZK电路逻辑一致）
 * 这个函数使用和测试文件中相同的逻辑来计算密码哈希
 */
async function generatePasswordHash(password) {
    console.log("🔐 计算密码哈希...");
    console.log(`   密码长度: ${password.length}字符`);
    
    try {
        // 1. 将密码转换为字段元素
        const passwordFieldElement = _stringToFieldElement(password);
        
        // 2. 使用与ZK电路相同的哈希计算逻辑
        const p = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
        const passwordHash = (passwordFieldElement * passwordFieldElement) % p;
        
        // 3. 格式化为十六进制字符串
        const computedPasswordHash = `0x${passwordHash.toString(16).padStart(64, '0')}`;
        
        console.log(`   密码字段元素: ${passwordFieldElement}`);
        console.log(`   计算出的密码哈希: ${computedPasswordHash}`);
        console.log("✅ 密码哈希计算成功");
        
        return {
            passwordHash: computedPasswordHash
        };
        
    } catch (error) {
        console.error("❌ 密码哈希计算失败:", error);
        throw error;
    }
}

/**
 * 生成密码哈希
 * GET /api/generate-password-hash?password=MySecretPassword123!
 * 
 * 查询参数:
 * - password: 要生成哈希的密码
 * 
 * 响应:
 * {
 *   "passwordHash": "0x..."
 * }
 */

app.get('/api/generate-password-hash', async (req, res) => {
    try {
        const { password } = req.query;

        if (!password || typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid password parameter'
            });
        }

        console.log(`📝 生成密码哈希 - 密码长度: ${password.length}`);

        // 使用与ZK电路逻辑一致的哈希计算方法
        const result = await generatePasswordHash(password);

        console.log(`✅ 哈希生成成功: ${result.passwordHash.slice(0, 10)}...`);

        // 返回计算出的密码哈希（与测试文件格式一致）
        res.json({
            success: true,
            passwordHash: result.passwordHash
        });

    } catch (error) {
        console.error('❌ 生成密码哈希失败:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 生成ZK证明
 * GET /api/generate-zk-proof?password=MySecretPassword123!
 * 
 * 查询参数:
 * - password: 要生成证明的密码
 * 
 * 响应:
 * {
 *   "proof": ["...", "...", "..."],
 *   "passwordHash": "0x..."
 * }
 */
app.get('/api/generate-zk-proof', async (req, res) => {
    try {
        const { password } = req.query; // 从查询参数获取password

        // 参数验证
        if (!password || typeof password !== 'string') {
            return res.status(400).json({
                error: 'Missing or invalid password parameter'
            });
        }

        console.log(`🔐 生成ZK证明请求:`);
        console.log(`   密码长度: ${password.length}`);

        // 确保ZK生成器已初始化
        const generator = await initializeZKGenerator();
        if (!generator) {
            return res.status(503).json({
                error: 'ZK证明生成器未可用，请检查密钥文件是否存在'
            });
        }

        // 生成ZK证明，完全复用 ZKVault.realZK.test.js 的实现方式
        try {
            // 1. 准备电路输入
            const passwordFieldElement = generator._stringToFieldElement(password);
            // 2. 内联计算哈希值（与电路逻辑一致）
            const p = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
            const expectedHash = (passwordFieldElement * passwordFieldElement) % p;
            const circuitInputs = {
                password: passwordFieldElement,
                passwordHash: expectedHash
            };
            // 3. 计算见证
            const witnessPath = require('path').join(generator.buildDir, `witness_${Date.now()}.wtns`);
            await require('snarkjs').wtns.calculate(
                circuitInputs,
                generator.circuitWasmPath,
                witnessPath
            );
            // 4. 生成证明
            const startTime = Date.now();
            const { proof, publicSignals } = await require('snarkjs').groth16.prove(
                generator.provingKeyPath,
                witnessPath
            );
            const proveTime = Date.now() - startTime;
            // 5. 清理临时文件
            if (require('fs').existsSync(witnessPath)) {
                require('fs').unlinkSync(witnessPath);
            }
            // 6. 格式化为Solidity兼容格式
            const solidityProof = generator._formatProofForSolidity(proof);
            // 7. 本地验证
            const isValid = await generator._verifyProofLocally(proof, publicSignals);
            // 8. 使用我们计算的哈希作为密码哈希
            const computedPasswordHash = `0x${expectedHash.toString(16).padStart(64, '0')}`;
            // 9. 返回结构
            res.json({
                success: true,
                proof: solidityProof.map(x => x.toString()),
                publicInputs: publicSignals.map(x => x.toString()),
                passwordHash: computedPasswordHash,
                metadata: {
                    proveTime,
                    circuitInputs: Object.keys(circuitInputs),
                    localVerification: isValid,
                    passwordLength: password.length,
                    isValid: BigInt(publicSignals[1]) === 1n
                }
            });
        } catch (error) {
            console.error('❌ 生成ZK证明失败:', error.message);
            res.status(500).json({
                error: error.message
            });
        }

    } catch (error) {
        console.error('❌ 生成ZK证明失败:', error.message);
        res.status(500).json({
            error: error.message
        });
    }
});

/**
 * 获取服务状态
 * GET /api/status
 */
app.get('/api/status', async (req, res) => {
    try {
        const status = {
            service: 'ZK Proof Service',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            zkGeneratorReady: zkGenerator !== null
        };

        if (!zkGenerator) {
            status.message = '🔧 ZK证明生成器未初始化，请调用需要证明的API进行自动初始化';
        } else {
            status.message = '✅ 服务运行正常';
        }

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 健康检查
 * GET /health
 */
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * 辅助函数：将字符串转换为电路可用的域元素
 */
function stringToFieldElement(str) {
    const bytes = Buffer.from(str, 'utf8');
    let result = BigInt(0);
    for (let i = 0; i < Math.min(bytes.length, 31); i++) {
        result = result * BigInt(256) + BigInt(bytes[i]);
    }
    return result;
}

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('💥 未处理的错误:', error);
    res.status(500).json({
        success: false,
        error: '内部服务器错误',
        message: error.message
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '路径未找到',
        availableEndpoints: [
            'GET /api/generate-password-hash?password=xxx',
            'GET /api/generate-zk-proof?password=xxx',
            'GET /api/status',
            'GET /health'
        ]
    });
});

// 启动服务器
async function startServer() {
    try {
        console.log('🚀 启动ZK证明服务...');
        console.log(`📡 服务将运行在端口 ${port}`);

        app.listen(port, () => {
            console.log(`✅ ZK证明服务已启动`);
            console.log(`🌐 访问地址: http://localhost:${port}`);
            console.log(`📋 API端点:`);
            console.log(`   GET /api/generate-password-hash?password=xxx - 生成密码哈希`);
            console.log(`   GET /api/generate-zk-proof?password=xxx - 生成ZK证明`);
            console.log(`   GET  /api/status - 服务状态`);
            console.log(`   GET  /health - 健康检查`);
            console.log('');
            console.log('💡 提示: ZK证明生成器将在首次使用时自动初始化');
        });
    } catch (error) {
        console.error('❌ 服务启动失败:', error.message);
        process.exit(1);
    }
}

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 收到停止信号，正在关闭服务...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 收到终止信号，正在关闭服务...');
    process.exit(0);
});

// 启动服务器
if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
