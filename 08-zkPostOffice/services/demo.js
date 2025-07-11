const { ethers } = require('ethers');
const { ZKProofServiceClient } = require('./testClient');

/**
 * 演示如何集成ZK证明服务到实际应用中
 * 模拟完整的信件发送和领取流程
 */
class ZKVaultDemo {
    constructor(serviceUrl = 'http://localhost:3000') {
        this.zkClient = new ZKProofServiceClient(serviceUrl);
    }

    /**
     * 演示1: 发送信件流程
     */
    async demonstrateSendLetter() {
        console.log('📮 演示发送信件流程');
        console.log('='.repeat(40));

        try {
            // 1. 用户输入密码
            const userPassword = 'MySecretMessage2024!';
            console.log(`👤 用户设置密码: ${userPassword}`);

            // 2. 生成密码哈希
            console.log('\n🔐 生成密码哈希...');
            const hashResult = await this.zkClient.generatePasswordHash(userPassword);
            
            if (!hashResult.success) {
                throw new Error(`哈希生成失败: ${hashResult.error}`);
            }

            const passwordHash = hashResult.data.hashForCircuit;
            console.log(`✅ 密码哈希: ${passwordHash.slice(0, 20)}...`);

            // 3. 模拟发送到合约
            const letterData = {
                message: '这是一条秘密消息，只有知道密码的人才能领取',
                secretWords: '秘密暗号',
                passwordHash: passwordHash,
                ethAmount: '0.1',
                deadline: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7天后过期
                sender: '0x1234567890123456789012345678901234567890'
            };

            console.log('\n📋 信件信息:');
            console.log(`   消息: ${letterData.message}`);
            console.log(`   金额: ${letterData.ethAmount} ETH`);
            console.log(`   过期时间: ${new Date(letterData.deadline * 1000).toLocaleString()}`);
            console.log(`   发送者: ${letterData.sender}`);

            // 4. 返回信件ID和密码（用于分享）
            const shareableData = {
                letterId: 'demo_letter_123', // 模拟的信件ID
                password: userPassword,
                hint: '这是我们的秘密密码',
                serviceUrl: 'http://localhost:3000'
            };

            console.log('\n🔗 可分享的信件信息:');
            console.log(`   信件ID: ${shareableData.letterId}`);
            console.log(`   密码: ${shareableData.password}`);
            console.log(`   提示: ${shareableData.hint}`);

            return shareableData;

        } catch (error) {
            console.error(`❌ 发送信件演示失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 演示2: 领取信件流程
     */
    async demonstrateClaimLetter(shareableData, claimerAddress) {
        console.log('\n🎯 演示领取信件流程');
        console.log('='.repeat(40));

        try {
            const { letterId, password } = shareableData;
            console.log(`🆔 信件ID: ${letterId}`);
            console.log(`👤 领取者: ${claimerAddress}`);

            // 1. 生成密码哈希（验证密码）
            console.log('\n🔐 验证密码...');
            const hashResult = await this.zkClient.generatePasswordHash(password);
            
            if (!hashResult.success) {
                throw new Error(`密码哈希生成失败: ${hashResult.error}`);
            }

            const passwordHash = hashResult.data.hashForCircuit;
            console.log(`✅ 密码验证通过`);

            // 2. 模拟从合约获取信件信息
            const mockLetterInfo = {
                _nonce: '987654321098765432109876543210',
                _claimed: false,
                _deadline: Math.floor(Date.now() / 1000) + (6 * 24 * 60 * 60),
                _ethAmount: ethers.parseEther('0.1')
            };

            console.log('\n📄 信件状态:');
            console.log(`   已领取: ${mockLetterInfo._claimed ? '是' : '否'}`);
            console.log(`   Nonce: ${mockLetterInfo._nonce.slice(0, 20)}...`);
            console.log(`   金额: ${ethers.formatEther(mockLetterInfo._ethAmount)} ETH`);

            if (mockLetterInfo._claimed) {
                throw new Error('信件已被领取');
            }

            // 3. 生成ZK证明
            console.log('\n🔐 生成ZK证明...');
            const startTime = Date.now();
            
            const proofResult = await this.zkClient.generateZKProof(
                password,
                passwordHash,
                mockLetterInfo._nonce,
                claimerAddress
            );

            const proofTime = Date.now() - startTime;

            if (!proofResult.success) {
                throw new Error(`ZK证明生成失败: ${proofResult.error}`);
            }

            console.log(`✅ ZK证明生成成功 (${proofTime}ms)`);
            console.log(`🔍 本地验证: ${proofResult.data.metadata.localVerification ? '通过' : '失败'}`);

            // 4. 格式化证明用于合约调用
            const formattedProof = {
                proof: proofResult.data.proof.map(x => BigInt(x)),
                publicInputs: proofResult.data.publicInputs.map(x => BigInt(x))
            };

            console.log('\n📋 证明格式化完成:');
            console.log(`   证明数组长度: ${formattedProof.proof.length}`);
            console.log(`   公共输入数量: ${formattedProof.publicInputs.length}`);

            // 5. 模拟合约调用
            console.log('\n💰 模拟合约领取...');
            const mockTransactionHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
            const mockGasUsed = '145892';

            console.log(`✅ 信件领取成功!`);
            console.log(`   交易哈希: ${mockTransactionHash}`);
            console.log(`   Gas消耗: ${mockGasUsed}`);
            console.log(`   获得金额: ${ethers.formatEther(mockLetterInfo._ethAmount)} ETH`);

            return {
                success: true,
                transactionHash: mockTransactionHash,
                gasUsed: mockGasUsed,
                amountReceived: mockLetterInfo._ethAmount,
                proofGenerationTime: proofTime
            };

        } catch (error) {
            console.error(`❌ 领取信件演示失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 演示3: 性能测试
     */
    async demonstratePerformance() {
        console.log('\n📊 演示性能测试');
        console.log('='.repeat(40));

        const testPasswords = [
            'Short123!',
            'MediumLengthPassword123!',
            'VeryLongPasswordWithManyCharacters2024!@#$%'
        ];

        const results = [];

        for (let i = 0; i < testPasswords.length; i++) {
            const password = testPasswords[i];
            console.log(`\n🧪 测试 ${i + 1}/${testPasswords.length}: 密码长度 ${password.length}`);

            try {
                // 测试密码哈希生成时间
                const hashStart = Date.now();
                const hashResult = await this.zkClient.generatePasswordHash(password);
                const hashTime = Date.now() - hashStart;

                // 测试ZK证明生成时间
                const proofStart = Date.now();
                const proofResult = await this.zkClient.generateZKProof(
                    password,
                    hashResult.data.hashForCircuit,
                    '123456789',
                    '0x1234567890123456789012345678901234567890'
                );
                const proofTime = Date.now() - proofStart;

                const result = {
                    passwordLength: password.length,
                    hashTime,
                    proofTime,
                    totalTime: hashTime + proofTime,
                    success: hashResult.success && proofResult.success
                };

                results.push(result);

                console.log(`   哈希生成: ${hashTime}ms`);
                console.log(`   证明生成: ${proofTime}ms`);
                console.log(`   总时间: ${result.totalTime}ms`);

            } catch (error) {
                console.log(`   ❌ 失败: ${error.message}`);
                results.push({
                    passwordLength: password.length,
                    error: error.message,
                    success: false
                });
            }
        }

        // 性能统计
        const successfulTests = results.filter(r => r.success);
        if (successfulTests.length > 0) {
            const avgProofTime = successfulTests.reduce((sum, r) => sum + r.proofTime, 0) / successfulTests.length;
            const maxProofTime = Math.max(...successfulTests.map(r => r.proofTime));
            const minProofTime = Math.min(...successfulTests.map(r => r.proofTime));

            console.log('\n📈 性能统计:');
            console.log(`   平均证明时间: ${avgProofTime.toFixed(1)}ms`);
            console.log(`   最快证明时间: ${minProofTime}ms`);
            console.log(`   最慢证明时间: ${maxProofTime}ms`);
        }

        return results;
    }

    /**
     * 完整演示
     */
    async runCompleteDemo() {
        console.log('🎭 ZK Vault 完整演示');
        console.log('='.repeat(50));

        try {
            // 检查服务状态
            console.log('🔍 检查服务状态...');
            const status = await this.zkClient.getStatus();
            if (!status.success || !status.data.zkGeneratorReady) {
                throw new Error('ZK证明服务未就绪');
            }
            console.log(`✅ 服务状态: ${status.data.message}`);

            // 演示发送信件
            const shareableData = await this.demonstrateSendLetter();

            // 演示领取信件
            const claimerAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
            const claimResult = await this.demonstrateClaimLetter(shareableData, claimerAddress);

            // 性能测试
            await this.demonstratePerformance();

            console.log('\n🎉 完整演示成功完成!');
            console.log('='.repeat(50));

            return {
                sendDemo: shareableData,
                claimDemo: claimResult,
                success: true
            };

        } catch (error) {
            console.error(`💥 演示失败: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 主函数
async function main() {
    const demo = new ZKVaultDemo();
    
    if (process.argv.includes('--send')) {
        await demo.demonstrateSendLetter();
    } else if (process.argv.includes('--claim')) {
        const mockData = {
            letterId: 'demo_letter_123',
            password: 'MySecretMessage2024!'
        };
        await demo.demonstrateClaimLetter(mockData, '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
    } else if (process.argv.includes('--performance')) {
        await demo.demonstratePerformance();
    } else {
        await demo.runCompleteDemo();
    }
}

// 导出演示类
module.exports = { ZKVaultDemo };

// 直接运行演示
if (require.main === module) {
    main().catch(console.error);
}
