const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

/**
 * 真实的ZK证明生成器（服务版本）
 */
class RealZKProofGenerator {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || path.join(__dirname, '..');
        this.buildDir = path.join(this.projectRoot, "build");
        this.keysDir = path.join(this.projectRoot, "keys");
        
        // 文件路径
        this.provingKeyPath = options.provingKeyPath || 
            path.join(this.keysDir, "password_verifier_simple_final.zkey");
        this.circuitWasmPath = options.circuitWasmPath || 
            path.join(this.buildDir, "password_verifier_simple.wasm");
        this.verifyingKeyPath = options.verifyingKeyPath || 
            path.join(this.keysDir, "verification_key.json");
        
        this.initialized = false;
    }
    
    /**
     * 初始化证明生成器
     */
    async initialize() {
        console.log("🔧 初始化ZK证明生成器...");
        
        // 检查必需文件
        const requiredFiles = [
            { path: this.provingKeyPath, name: "证明密钥" },
            { path: this.circuitWasmPath, name: "电路WASM" },
            { path: this.verifyingKeyPath, name: "验证密钥" }
        ];
        
        for (const file of requiredFiles) {
            if (!fs.existsSync(file.path)) {
                throw new Error(`缺少${file.name}文件: ${file.path}`);
            }
            console.log(`   ✅ ${file.name}: ${path.relative(this.projectRoot, file.path)}`);
        }
        
        // 加载验证密钥
        this.verifyingKey = JSON.parse(fs.readFileSync(this.verifyingKeyPath, 'utf8'));
        console.log(`   📊 验证密钥信息: ${this.verifyingKey.protocol}, ${this.verifyingKey.nPublic}个公共输入`);
        
        this.initialized = true;
        console.log("✅ ZK证明生成器初始化完成");
    }
    
    /**
     * 为密码验证生成ZK证明（优化版本，电路内计算哈希）
     * @param {string} password - 原始密码（私密输入）
     */
    async generatePasswordProof(password) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        console.log("🔐 生成密码验证ZK证明...");
        console.log(`   密码长度: ${password.length}字符`);
        
        try {
            // 1. 准备电路输入
            const passwordFieldElement = this._stringToFieldElement(password);
            
            // 2. 内联计算哈希值（与电路逻辑一致）
            const p = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
            const passwordHash = (passwordFieldElement * passwordFieldElement) % p;
            
            const circuitInputs = {
                password: passwordFieldElement,
                passwordHash: passwordHash
            };
            
            console.log("   📝 电路输入准备完成");
            console.log(`   密码字段元素: ${passwordFieldElement}`);
            console.log(`   电路计算哈希: 0x${passwordHash.toString(16).padStart(64, '0')}`);
            
            // 3. 计算见证
            const witnessPath = path.join(this.buildDir, `witness_${Date.now()}.wtns`);
            await snarkjs.wtns.calculate(
                circuitInputs,
                this.circuitWasmPath,
                witnessPath
            );
            
            console.log("   🧮 见证计算完成");
            
            // 4. 生成证明
            const startTime = Date.now();
            const { proof, publicSignals } = await snarkjs.groth16.prove(
                this.provingKeyPath,
                witnessPath
            );
            const proveTime = Date.now() - startTime;
            
            console.log(`   ⚡ 证明生成完成 (${proveTime}ms)`);
            
            // 5. 清理临时文件
            if (fs.existsSync(witnessPath)) {
                fs.unlinkSync(witnessPath);
            }
            
            // 6. 格式化为Solidity兼容格式
            const solidityProof = this._formatProofForSolidity(proof);
            
            // 7. 本地验证
            const isValid = await this._verifyProofLocally(proof, publicSignals);
            console.log(`   🔍 本地验证: ${isValid ? "通过" : "失败"}`);
            
            // 8. 使用我们计算的哈希作为密码哈希
            const computedPasswordHash = `0x${passwordHash.toString(16).padStart(64, '0')}`;
            
            const result = {
                proof: solidityProof,
                publicInputs: publicSignals.map(x => BigInt(x)),
                passwordHash: computedPasswordHash,
                metadata: {
                    proveTime,
                    circuitInputs: Object.keys(circuitInputs),
                    localVerification: isValid,
                    passwordLength: password.length,
                    isValid: BigInt(publicSignals[1]) === 1n
                }
            };
            
            console.log("✅ ZK证明生成成功");
            console.log(`   计算出的密码哈希: ${computedPasswordHash}`);
            return result;
            
        } catch (error) {
            console.error("❌ ZK证明生成失败:");
            console.error(`   错误: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 计算基于钱包签名的派生密钥（防止密码哈希碰撞）
     * @param {string} password - 明文密码
     * @param {Signer} signer - 用户的以太坊钱包签名器
     */
    async calculateWalletBoundPasswordHash(password, signer) {
        // 1. 构造签名消息
        const message = `ZKPOSTOFFICE_PASSWORD_DERIVE:${password}`;
        
        // 2. 用用户钱包私钥签名消息
        const signature = await signer.signMessage(message);
        
        // 3. 从签名中提取确定性的派生密钥
        const { ethers } = require("ethers");
        const derivedKey = ethers.keccak256(
            ethers.solidityPacked(
                ["string", "bytes"],
                [password, signature]
            )
        );
        
        return {
            derivedKey: derivedKey,
            signature: signature,
            message: message,
            signer: await signer.getAddress()
        };
    }

    /**
     * 生成基于钱包绑定的ZK证明
     * @param {string} password - 明文密码
     * @param {Signer} signer - 用户的以太坊钱包签名器
     */
    async generateWalletBoundPasswordProof(password, signer) {
        // 1. 计算钱包绑定的派生密钥
        const keyResult = await this.calculateWalletBoundPasswordHash(password, signer);
        
        // 2. 直接生成ZK证明（使用派生密钥的字段元素作为私密输入）
        if (!this.initialized) {
            await this.initialize();
        }
        
        try {
            console.log("🔐 生成钱包绑定密码验证ZK证明...");
            console.log(`   派生密钥长度: ${keyResult.derivedKey.length}字符`);
            
            // 准备电路输入 - 直接使用派生密钥的字段元素
            const derivedKeyFieldElement = this._hexStringToFieldElement(keyResult.derivedKey);
            
            // 内联计算哈希值（与电路逻辑一致）
            const p = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
            const expectedHash = (derivedKeyFieldElement * derivedKeyFieldElement) % p;
            
            const circuitInputs = {
                password: derivedKeyFieldElement,
                passwordHash: expectedHash
            };
            
            console.log("   📝 电路输入准备完成");
            console.log(`   派生密钥字段元素: ${derivedKeyFieldElement}`);
            console.log(`   电路计算哈希: 0x${expectedHash.toString(16).padStart(64, '0')}`);
            
            // 计算见证
            const witnessPath = path.join(this.buildDir, `witness_${Date.now()}.wtns`);
            await snarkjs.wtns.calculate(
                circuitInputs,
                this.circuitWasmPath,
                witnessPath
            );
            
            console.log("   🧮 见证计算完成");
            
            // 生成证明
            const startTime = Date.now();
            const { proof, publicSignals } = await snarkjs.groth16.prove(
                this.provingKeyPath,
                witnessPath
            );
            const proveTime = Date.now() - startTime;
            
            console.log(`   ⚡ 证明生成完成 (${proveTime}ms)`);
            
            // 清理临时文件
            if (fs.existsSync(witnessPath)) {
                fs.unlinkSync(witnessPath);
            }
            
            // 格式化为Solidity兼容格式
            const solidityProof = this._formatProofForSolidity(proof);
            
            // 本地验证
            const isValid = await this._verifyProofLocally(proof, publicSignals);
            console.log(`   🔍 本地验证: ${isValid ? "通过" : "失败"}`);
            
            // 使用我们计算的哈希作为密码哈希
            const computedPasswordHash = `0x${expectedHash.toString(16).padStart(64, '0')}`;
            
            const zkProof = {
                proof: solidityProof,
                publicInputs: publicSignals.map(x => BigInt(x)),
                passwordHash: computedPasswordHash,  // 从证明中得到的哈希
                metadata: {
                    proveTime,
                    circuitInputs: Object.keys(circuitInputs),
                    localVerification: isValid,
                    passwordLength: keyResult.derivedKey.length,
                    isValid: BigInt(publicSignals[1]) === 1n  // 第二个公共输出是验证结果
                }
            };
        
            return {
                ...zkProof,
                walletBinding: {
                    signature: keyResult.signature,
                    message: keyResult.message,
                    signer: keyResult.signer
                }
            };
        
        } catch (error) {
            console.error("❌ 钱包绑定ZK证明生成失败:", error);
            throw error;
        }
    }

    /**
     * 将十六进制字符串转换为字段元素
     */
    _hexStringToFieldElement(hexString) {
        // 移除0x前缀
        const cleanHex = hexString.replace('0x', '');
        return BigInt('0x' + cleanHex);
    }

    /**
     * 本地验证证明
     */
    async _verifyProofLocally(proof, publicSignals) {
        try {
            return await snarkjs.groth16.verify(
                this.verifyingKey,
                publicSignals,
                proof
            );
        } catch (error) {
            console.error("本地验证失败:", error.message);
            return false;
        }
    }
    
    /**
     * 将字符串转换为电路可用的域元素
     */
    _stringToFieldElement(str) {
        const bytes = Buffer.from(str, 'utf8');
        let result = BigInt(0);
        for (let i = 0; i < Math.min(bytes.length, 31); i++) {
            result = result * BigInt(256) + BigInt(bytes[i]);
        }
        return result;
    }
    
    /**
     * 将snarkjs的证明格式转换为Solidity格式
     */
    _formatProofForSolidity(proof) {
        return [
            proof.pi_a[0],    // a.X
            proof.pi_a[1],    // a.Y
            proof.pi_b[0][1], // b.X[1] (交换!)
            proof.pi_b[0][0], // b.X[0] (交换!)
            proof.pi_b[1][1], // b.Y[1] (交换!)
            proof.pi_b[1][0], // b.Y[0] (交换!)
            proof.pi_c[0],    // c.X
            proof.pi_c[1]     // c.Y
        ].map(x => BigInt(x));
    }
}

module.exports = { RealZKProofGenerator };
