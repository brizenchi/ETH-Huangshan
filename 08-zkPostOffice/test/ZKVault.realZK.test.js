const { expect } = require("chai");
const { ethers } = require("hardhat");
const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

/**
 * 真实的ZK证明生成器（内联版本）
 */
class RealZKProofGenerator {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || process.cwd();
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
     * 计算密码哈希（直接对密码进行哈希）
     * @param {string} password - 明文密码
     */
    async calculatePasswordHash(password) {
        // 直接对密码进行哈希
        const { ethers } = require("hardhat");
        const passwordHash = ethers.keccak256(
            ethers.toUtf8Bytes(password)
        );

        return {
            passwordHash: passwordHash
        };
    }

    /**
     * 生成密码验证ZK证明
     * @param {string} password - 明文密码
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
            const expectedHash = (passwordFieldElement * passwordFieldElement) % p;

            const circuitInputs = {
                password: passwordFieldElement,
                passwordHash: expectedHash
            };

            console.log("   📝 电路输入准备完成");
            console.log(`   密码字段元素: ${passwordFieldElement}`);
            console.log(`   电路计算哈希: 0x${expectedHash.toString(16).padStart(64, '0')}`);

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
            const computedPasswordHash = `0x${expectedHash.toString(16).padStart(64, '0')}`;

            const zkProof = {
                proof: solidityProof,
                publicInputs: publicSignals.map(x => BigInt(x)),
                passwordHash: computedPasswordHash,  // 从证明中得到的哈希
                metadata: {
                    proveTime,
                    circuitInputs: Object.keys(circuitInputs),
                    localVerification: isValid,
                    passwordLength: password.length,
                    isValid: BigInt(publicSignals[1]) === 1n  // 第二个公共输出是验证结果
                }
            };

            console.log("✅ ZK证明生成成功");
            console.log(`   计算出的密码哈希: ${computedPasswordHash}`);
            return zkProof;

        } catch (error) {
            console.error("❌ ZK证明生成失败:", error);
            throw error;
        }
    }

    /**
     * 为密码验证生成ZK证明（优化版本，内联计算哈希）
     * @param {string} password - 原始密码（私密输入）
     * @deprecated 使用 generatePasswordProof 代替
     */
    async generatePasswordProofDeprecated(password) {
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
     * 将十六进制字符串转换为字段元素
     * @deprecated 不再使用
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

describe("ZKVault - ZK证明测试", function () {
    let zkVault;
    let owner, sender, claimer;
    let realZKGenerator;

    // 唯一的明文密码
    const password = "MySecretPassword123!";

    before(async function () {
        console.log("🔧 初始化ZK证明测试环境...");

        // 检查ZK密钥文件
        const provingKeyPath = path.join(process.cwd(), "keys", "password_verifier_simple_final.zkey");

        if (!fs.existsSync(provingKeyPath)) {
            throw new Error("❌ 未找到ZK密钥文件，请先运行 'node scripts/generateZKKeys.js'");
        }

        // 初始化ZK证明生成器
        realZKGenerator = new RealZKProofGenerator();
        await realZKGenerator.initialize();
        console.log("✅ ZK证明生成器初始化完成");

        // 获取账户
        [owner, sender, claimer] = await ethers.getSigners();

        // 部署合约
        const ZKVault = await ethers.getContractFactory("ZKVault");
        zkVault = await ZKVault.deploy();
        await zkVault.initialize();

        console.log("✅ 测试环境准备完成");
        console.log(`   合约地址: ${await zkVault.getAddress()}`);
        console.log(`   发送者: ${sender.address}`);
        console.log(`   领取者: ${claimer.address}`);
    });

    it("应该能够使用密码哈希发送和领取信件", async function () {
        console.log("\n🎯 测试密码哈希流程");
        console.log("=".repeat(60));

        // 1. 生成ZK证明并获取密码哈希
        console.log("步骤1: 生成ZK证明...");
        const zkProof = await realZKGenerator.generatePasswordProof(password);

        console.log(`   明文密码: "${password}"`);
        console.log(`   计算出的密码哈希: ${zkProof.passwordHash}`);
        console.log(`   证明生成耗时: ${zkProof.metadata.proveTime}ms`);

        // 2. 发送信件
        console.log("\n📮 步骤2: 发送信件...");
        const ethAnnex = {
            _type: 0,
            _address: ethers.ZeroAddress,
            _amount: ethers.parseEther("0.1"),
            _id: 0
        };

        const deadline = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
        const nonce = Math.floor(Date.now() / 1000);

        const sendTx = await zkVault.connect(sender).sendLetter(
            [ethAnnex],
            "测试密码哈希",
            "Test Password Hash",
            zkProof.passwordHash,  // 使用从ZK证明中得到的哈希
            deadline,
            nonce,
            { value: ethers.parseEther("0.1") }
        );

        const sendReceipt = await sendTx.wait();
        const letterId = await zkVault.getLetterIdByPasswordHash(zkProof.passwordHash);

        console.log(`   信件ID: ${letterId}`);
        console.log(`   Gas消耗: ${sendReceipt.gasUsed}`);

        // 3. 使用ZK证明领取信件
        console.log("\n💰 步骤3: 使用ZK证明领取信件...");
        const claimerBalanceBefore = await ethers.provider.getBalance(sender.address);

        const claimTx = await zkVault.connect(sender).claimWithZKProof(letterId, {
            proof: zkProof.proof,
            publicInputs: zkProof.publicInputs
        });

        const claimReceipt = await claimTx.wait();
        const claimerBalanceAfter = await ethers.provider.getBalance(sender.address);
        const balanceIncrease = claimerBalanceAfter - claimerBalanceBefore;

        console.log(`   领取Gas消耗: ${claimReceipt.gasUsed}`);
        console.log(`   余额增加: ${ethers.formatEther(balanceIncrease)} ETH`);
        console.log("✅ 密码哈希测试完成");
    });

    it("应该能够通过ZK证明读取信件的加密信息", async function () {
        console.log("\n🔍 测试通过ZK证明读取信件加密信息");
        console.log("=".repeat(60));

        // 1. 首先发送一个信件
        console.log("步骤1: 发送信件...");
        const zkProof = await realZKGenerator.generatePasswordProof(password);
        
        const ethAnnex = {
            _type: 0,
            _address: ethers.ZeroAddress,
            _amount: ethers.parseEther("0.05"),
            _id: 0
        };

        const deadline = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
        const nonce = Math.floor(Date.now() / 1000) + 1000; // 不同的nonce

        const sendTx = await zkVault.connect(sender).sendLetter(
            [ethAnnex],
            "这是一个秘密消息",
            "只有知道密码的人才能看到这个密语",
            zkProof.passwordHash,
            deadline,
            nonce,
            { value: ethers.parseEther("0.05") }
        );

        await sendTx.wait();
        const letterId = await zkVault.getLetterIdByPasswordHash(zkProof.passwordHash);
        console.log(`   信件ID: ${letterId}`);

        // 2. 尝试用错误的ZK证明读取（应该失败）
        console.log("\n步骤2: 尝试用错误的ZK证明读取...");
        const wrongZkProof = await realZKGenerator.generatePasswordProof("WrongPassword");
        
        const wrongResult = await zkVault.readLetterWithZKProof(letterId, {
            proof: wrongZkProof.proof,
            publicInputs: wrongZkProof.publicInputs
        });

        console.log(`   错误证明读取成功: ${wrongResult[0]}`);
        expect(wrongResult[0]).to.be.false; // 应该失败

        // 3. 用正确的ZK证明读取信件
        console.log("\n步骤3: 用正确的ZK证明读取信件...");
        const correctResult = await zkVault.readLetterWithZKProof(letterId, {
            proof: zkProof.proof,
            publicInputs: zkProof.publicInputs
        });

        console.log(`   正确证明读取成功: ${correctResult[0]}`);
        console.log(`   读取到的消息: "${correctResult[2]}"`);
        console.log(`   读取到的密语: "${correctResult[1]}"`);
        console.log(`   附件数量: ${correctResult[3].length}`);

        expect(correctResult[0]).to.be.true; // 应该成功
        expect(correctResult[2]).to.equal("这是一个秘密消息");
        expect(correctResult[1]).to.equal("只有知道密码的人才能看到这个密语");
        expect(correctResult[3].length).to.equal(1);
        expect(correctResult[3][0]._amount).to.equal(ethers.parseEther("0.05"));

        // 4. 测试获取完整信件详情
        console.log("\n步骤4: 测试获取完整信件详情...");
        const detailResult = await zkVault.getLetterDetailWithZKProof(letterId, {
            proof: zkProof.proof,
            publicInputs: zkProof.publicInputs
        });

        console.log(`   获取详情成功: ${detailResult[0]}`);
        console.log(`   信件发送者: ${detailResult[1]._sender}`);
        console.log(`   信件截止时间: ${detailResult[1]._deadline}`);

        expect(detailResult[0]).to.be.true;
        expect(detailResult[1]._sender).to.equal(sender.address);
        expect(detailResult[1]._message).to.equal("这是一个秘密消息");
        expect(detailResult[1]._secretWords).to.equal("只有知道密码的人才能看到这个密语");

        console.log("✅ ZK证明读取信件测试完成");
    });
});
