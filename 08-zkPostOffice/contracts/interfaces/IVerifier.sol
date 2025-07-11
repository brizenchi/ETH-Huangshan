// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IVerifier
 * @dev 零知识证明验证器接口
 */
interface IVerifier {
    /**
     * @dev 验证零知识证明
     * @param proof 8个元素的证明数组 [a.x, a.y, b.x[0], b.x[1], b.y[0], b.y[1], c.x, c.y]
     * @param input 公共输入数组
     * @return 验证结果
     */
    function verifyProof(
        uint256[8] memory proof,
        uint256[] memory input
    ) external view returns (bool);
}