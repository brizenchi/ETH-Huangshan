require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('hardhat-deploy');
require('dotenv').config();

const privateKey = process.env.PRIVATE_KEY;
const scanKey = process.env.ETHERSCAN_API_KEY ?? "ETHERSCAN_API_KEY";
const bscKey = process.env.BSC_KEY ?? scanKey;

// 构建网络配置，只有在有有效私钥时才添加外部网络
const networks = {
  hardhat: {
    // 本地测试网络
  }
};

// 只有在有有效私钥时才添加外部网络配置
if (privateKey) {
  networks.sepolia = {
    url: 'https://eth-sepolia.public.blastapi.io',
    accounts: [`${privateKey}`],
    chainId: 11155111,
  };
  networks["arb-t"] = {
    url: 'https://arbitrum-sepolia.gateway.tenderly.co',
    accounts: [`${privateKey}`],
    chainId: 421614,
  };
  networks.arbitrum = {
    chainId: 42161,
    url: 'https://arb1.arbitrum.io/rpc',
    accounts: [`${privateKey}`],
    gasPrice: 1000000000,
  };
  networks["base-mainnet"] = {
    url: 'https://mainnet.base.org',
    accounts: [`${privateKey}`],
    gasPrice: 1000000000,
  };
  networks["base-sepolia"] = {
    url: "https://sepolia.base.org",
    accounts: [`${privateKey}`],
    gasPrice: 1000000000,
  };
  networks["polygon-mumbai"] = {
    url: 'https://gateway.tenderly.co/public/polygon-mumbai',
    accounts: [`${privateKey}`],
  };
  networks["bsc-test"] = {
    url: 'https://data-seed-prebsc-2-s2.bnbchain.org:8545',
    accounts: [`${privateKey}`],
  };
  networks["bsc-test2"] = {
    url: 'https://data-seed-prebsc-2-s2.bnbchain.org:8545',
    accounts: [`${privateKey}`],
  };
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks,
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
    deploy: "./deploy",
    deployments: "./deployments",
  },
  namedAccounts: {
    deployer: 0
  },
  etherscan: {
    apiKey: {
      bscTestnet: bscKey,
      arbitrumOne: scanKey,
    }
  },
  sourcify: {
    enabled: true
  },
};
