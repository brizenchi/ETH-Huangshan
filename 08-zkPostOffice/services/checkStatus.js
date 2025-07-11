const axios = require('axios');

/**
 * 快速检查ZK证明服务状态
 */
async function checkServiceStatus(url = 'http://localhost:3000') {
    console.log('🔍 检查ZK证明服务状态...');
    console.log(`📡 服务地址: ${url}`);
    console.log('-'.repeat(40));

    try {
        // 健康检查
        const healthResponse = await axios.get(`${url}/health`, { timeout: 5000 });
        console.log('✅ 健康检查: 通过');
        
        // 服务状态
        const statusResponse = await axios.get(`${url}/api/status`, { timeout: 5000 });
        const status = statusResponse.data.data;
        
        console.log(`🏷️  服务名称: ${status.service}`);
        console.log(`📌 版本: ${status.version}`);
        console.log(`🔧 ZK生成器: ${status.zkGeneratorReady ? '✅ 就绪' : '❌ 未就绪'}`);
        console.log(`📅 时间: ${new Date(status.timestamp).toLocaleString()}`);
        console.log(`💬 状态: ${status.message}`);

        if (status.zkGeneratorReady) {
            console.log('\n🎯 服务完全可用，可以生成ZK证明');
        } else {
            console.log('\n⚠️  ZK生成器未就绪，请检查密钥文件');
            console.log('💡 运行以下命令生成密钥:');
            console.log('   node scripts/generateZKKeys.js');
        }

        return true;

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ 无法连接到服务');
            console.log('💡 请先启动服务:');
            console.log('   npm run service:start');
            console.log('   或: cd services && npm start');
        } else if (error.code === 'ENOTFOUND') {
            console.log('❌ 服务地址无效');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('❌ 连接超时');
        } else {
            console.log(`❌ 检查失败: ${error.message}`);
        }
        return false;
    }
}

// 主函数
async function main() {
    const url = process.argv[2] || 'http://localhost:3000';
    await checkServiceStatus(url);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { checkServiceStatus };
