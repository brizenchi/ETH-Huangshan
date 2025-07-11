import { ethers, Contract } from "ethers";
import { erc20Abi, postOfficAbi } from './config'

export async function getDecimals(address, provider) {
    const erc20 = new Contract(element.address, erc20Abi, provider)
    console.log(erc20);
    const decimals = await erc20.decimals();
    return decimals;
}