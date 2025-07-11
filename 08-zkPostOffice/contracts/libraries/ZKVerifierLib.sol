// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title ZKVerifierLib
 * @dev 零知识证明验证器库 - 集成Groth16验证系统
 * 使用password_verifier_simple.circom电路的真实验证密钥
 */
library ZKVerifierLib {
    // ============== 数据结构 ==============

    struct G1Point {
        uint256 X;
        uint256 Y;
    }

    struct G2Point {
        uint256[2] X;
        uint256[2] Y;
    }

    struct VerifyingKey {
        G1Point alpha;
        G2Point beta;
        G2Point gamma;
        G2Point delta;
        G1Point[] gamma_abc;
    }

    struct Proof {
        G1Point a;
        G2Point b;
        G1Point c;
    }

    // ============== 常数定义 ==============

    // BN254曲线参数
    uint256 constant FIELD_ORDER = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
    uint256 constant GEN_ORDER = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // ============== 核心验证函数 ==============

    /**
     * @dev 获取真实的验证密钥（从password_verifier_simple电路生成）
     */
    function getRealVerifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alpha = G1Point(
            2911067560956003489024943952335866471458629375826063170287557710018668738899, 
            14360464997856870042143902358097371582005132321762034022657109592749434245855
        );
        
        vk.beta = G2Point({
            X: [14932019986030422231521332474610432755711424070676691052314672389853988775562, 17399300290253197908307003165906955655728672955044044292813453559610461543689],
            Y: [16188676036473203583905616850046327769708148331282701067321814152195211630088, 13726202729215909871138606722447882177488428257301352103612535719341999544299]
        });
        
        vk.gamma = G2Point({
            X: [11559732032986387107991004021392285783925812861821192530917403151452391805634, 10857046999023057135944570762232829481370756359578518086990519993285655852781],
            Y: [4082367875863433681332203403145435568316851327593401208105741076214120093531, 8495653923123431417604973247489272438418190587263600148770280649306958101930]
        });
        
        vk.delta = G2Point({
            X: [6609936434416628110144442466813297421507170160492660429222852076884527310595, 11386068247985606029843093792228852503754062072088166300548215760807129923183],
            Y: [15599912747120464301362628977793487469111185726449624117889074198632005476946, 3514778236844765523501790508201526254146673474375309527416201555705026385809]
        });
        
        // IC数组 - password_verifier_simple电路支持2个公共输入
        vk.gamma_abc = new G1Point[](3);
        vk.gamma_abc[0] = G1Point(8026766644554531811303835052584886422458802620875668938808803818966212361472, 3293192426388331798003929825159729798203531748039231826070769286205912394749);
        vk.gamma_abc[1] = G1Point(8398671413336031077775046020474579270264639489357841383398068518042064423128, 7320082548207887374868921357620286676045778256402382395970652587786416541090);
        vk.gamma_abc[2] = G1Point(1113738509148725233099375379449193372256493800058638881230893861021797139963, 1696771457979343777264130696330266341754480517388895127181476203698226717378);
    }

    /**
     * @dev 验证Groth16零知识证明
     * @param proof 证明数据 [a.x, a.y, b.x[0], b.x[1], b.y[0], b.y[1], c.x, c.y]
     * @param input 公共输入数组
     * @return 验证结果
     */
    function verifyProof(uint256[8] memory proof, uint256[] memory input) internal view returns (bool) {
        VerifyingKey memory vk = getRealVerifyingKey();
        
        // 检查公共输入数量
        if (input.length + 1 != vk.gamma_abc.length) {
            return false;
        }

        // 解析证明
        Proof memory p = Proof({ 
            a: G1Point(proof[0], proof[1]), 
            b: G2Point([proof[2], proof[3]], [proof[4], proof[5]]), 
            c: G1Point(proof[6], proof[7]) 
        });

        // 计算 vk_x = gamma_abc[0] + sum(input[i] * gamma_abc[i+1])
        G1Point memory vk_x = vk.gamma_abc[0];
        for (uint256 i = 0; i < input.length; i++) {
            vk_x = _ecAdd(vk_x, _ecMul(vk.gamma_abc[i + 1], input[i]));
        }

        // Groth16验证等式: e(-A,B) * e(alpha,beta) * e(vk_x,gamma) * e(C,delta) = 1
        return _pairing4(
            _ecNegate(p.a), p.b,
            vk.alpha, vk.beta,
            vk_x, vk.gamma,
            p.c, vk.delta
        );
    }

    // ============== 内部椭圆曲线运算 ==============

    function _ecAdd(G1Point memory p1, G1Point memory p2) private view returns (G1Point memory r) {
        uint256[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
        }
        require(success, "EC addition failed");
    }

    function _ecMul(G1Point memory p, uint256 s) private view returns (G1Point memory r) {
        uint256[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
        }
        require(success, "EC multiplication failed");
    }

    function _ecNegate(G1Point memory p) private pure returns (G1Point memory) {
        if (p.X == 0 && p.Y == 0) return G1Point(0, 0);
        return G1Point(p.X, FIELD_ORDER - (p.Y % FIELD_ORDER));
    }

    function _pairing4(
        G1Point memory a1, G2Point memory a2,
        G1Point memory b1, G2Point memory b2,
        G1Point memory c1, G2Point memory c2,
        G1Point memory d1, G2Point memory d2
    ) private view returns (bool) {
        uint256[24] memory input;
        
        // 第一个配对
        input[0] = a1.X;
        input[1] = a1.Y;
        input[2] = a2.X[0];
        input[3] = a2.X[1];
        input[4] = a2.Y[0];
        input[5] = a2.Y[1];
        
        // 第二个配对
        input[6] = b1.X;
        input[7] = b1.Y;
        input[8] = b2.X[0];
        input[9] = b2.X[1];
        input[10] = b2.Y[0];
        input[11] = b2.Y[1];
        
        // 第三个配对
        input[12] = c1.X;
        input[13] = c1.Y;
        input[14] = c2.X[0];
        input[15] = c2.X[1];
        input[16] = c2.Y[0];
        input[17] = c2.Y[1];
        
        // 第四个配对
        input[18] = d1.X;
        input[19] = d1.Y;
        input[20] = d2.X[0];
        input[21] = d2.X[1];
        input[22] = d2.Y[0];
        input[23] = d2.Y[1];

        uint256[1] memory out;
        bool success;
        
        assembly {
            success := staticcall(sub(gas(), 2000), 8, input, 768, out, 32)
        }
        
        require(success, "Pairing check failed");
        return out[0] != 0;
    }
}
