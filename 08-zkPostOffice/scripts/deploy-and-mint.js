const { ethers } = require("hardhat");

async function main() {
  console.log("启动部署和铸造脚本...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log(`使用部署者账户: ${deployer.address}`);
  
  // 定义接收代币的地址 - 可以修改为您想要的地址
  // 这里默认使用部署者的地址作为接收者
  const receiverAddress = deployer.address;
  console.log(`接收代币的地址: ${receiverAddress}`);

  // 部署ERC20代币合约
  console.log("\n开始部署ERC20代币合约...");
  const TestERC20 = await ethers.getContractFactory("TestERC20");
  const erc20 = await TestERC20.deploy("Test Token", "TT");
  await erc20.waitForDeployment();
  const erc20Address = await erc20.getAddress();
  console.log(`TestERC20 合约部署成功，地址: ${erc20Address}`);

  // 铸造ERC20代币
  const erc20MintAmount = ethers.parseEther("1000");  // 铸造1000个代币
  await erc20.mint(receiverAddress, erc20MintAmount);
  console.log(`铸造 ${ethers.formatEther(erc20MintAmount)} 个ERC20代币到地址 ${receiverAddress} 成功`);
  
  // 检查余额
  const erc20Balance = await erc20.balanceOf(receiverAddress);
  console.log(`${receiverAddress} 的ERC20代币余额: ${ethers.formatEther(erc20Balance)}`);

  // 部署ERC721代币合约
  console.log("\n开始部署ERC721代币合约...");
  const TestERC721 = await ethers.getContractFactory("TestERC721");
  const erc721 = await TestERC721.deploy("Test NFT", "TNFT");
  await erc721.waitForDeployment();
  const erc721Address = await erc721.getAddress();
  console.log(`TestERC721 合约部署成功，地址: ${erc721Address}`);

  // 铸造ERC721代币
  const tokenId = 1;
  await erc721.safeMint(receiverAddress, tokenId);
  console.log(`铸造 NFT #${tokenId} 到地址 ${receiverAddress} 成功`);
  
  // 检查所有权
  const nftOwner = await erc721.ownerOf(tokenId);
  console.log(`NFT #${tokenId} 的所有者: ${nftOwner}`);

  // 部署ERC1155代币合约
  console.log("\n开始部署ERC1155代币合约...");
  const TestERC1155 = await ethers.getContractFactory("TestERC1155");
  const erc1155 = await TestERC1155.deploy("https://game.example/api/item/{id}.json");
  await erc1155.waitForDeployment();
  const erc1155Address = await erc1155.getAddress();
  console.log(`TestERC1155 合约部署成功，地址: ${erc1155Address}`);

  // 铸造ERC1155代币
  const erc1155Id = 1;
  const erc1155Amount = 100;
  await erc1155.mint(receiverAddress, erc1155Id, erc1155Amount, "0x");
  console.log(`铸造 ${erc1155Amount} 个ID为 ${erc1155Id} 的ERC1155代币到地址 ${receiverAddress} 成功`);
  
  // 检查余额
  const erc1155Balance = await erc1155.balanceOf(receiverAddress, erc1155Id);
  console.log(`${receiverAddress} 的ERC1155代币 ID:${erc1155Id} 余额: ${erc1155Balance}`);

  // 输出部署摘要
  console.log("\n=== 部署和铸造摘要 ===");
  console.log(`接收者地址: ${receiverAddress}`);
  console.log(`ERC20 地址: ${erc20Address}, 余额: ${ethers.formatEther(erc20Balance)}`);
  console.log(`ERC721 地址: ${erc721Address}, 拥有NFT ID: ${tokenId}`);
  console.log(`ERC1155 地址: ${erc1155Address}, 代币ID:${erc1155Id} 余额: ${erc1155Balance}`);
}

// 执行主函数并捕获错误
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署过程中出错:", error);
    process.exit(1);
  });
