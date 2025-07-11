
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy('ZKVault', {
        from: deployer,
        args: [],
        log: true,
        skipIfAlreadyDeployed: true,
    });
}


module.exports.tags = ['ZKVault'];