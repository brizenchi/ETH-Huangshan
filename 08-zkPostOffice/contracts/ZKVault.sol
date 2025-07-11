// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import "./libraries/ZKVerifierLib.sol";

/**
 * @title ZKVault
 * @dev 使用零知识证明保护密码的信件保险库合约
 * 用户可以存储信件和附件，使用ZK证明验证身份而无需暴露密码明文
 */
contract ZKVault is OwnableUpgradeable, ERC721Holder, ERC1155Holder {
    using ZKVerifierLib for *;

    uint8 public constant ETH_TYPE = 0;
    uint8 public constant ERC20_TYPE = 1;
    uint8 public constant ERC721_TYPE = 2;
    uint8 public constant ERC1155_TYPE = 3;

    // 事件
    event SendLetter(bytes32 indexed _letterId, address indexed _sender, bytes32 _passwordHash, bytes[] _annexKeys);
    event Claim(bytes32 indexed _letterId, address indexed _claimer);
    event TimeoutClaim(bytes32 indexed _letterId, address indexed _sender);
    event ZKProofVerified(bytes32 indexed _letterId, address indexed _claimer, bool _success);

    // 附件结构
    struct Annex {
        uint8 _type;
        address _address;
        uint256 _amount;
        uint256 _id;
    }

    // 信件结构 - 不再存储明文密码
    struct Letter {
        bytes32 _letterId;
        address _sender;
        uint256 _annexAmount;
        uint256 _deadline;
        string _message;
        string _secretWords;
        bytes32 _passwordHash; // 存储密码哈希而非明文
        uint256 _nonce; // 防止重放攻击
        bool _claimed; // 是否已被领取
    }

    // ZK验证相关结构
    struct ZKProofData {
        uint256[8] proof; // Groth16 证明
        uint256[] publicInputs; // 公共输入：[isValid, passwordHash]
    }

    // 批量读取结果结构
    struct LetterReadResult {
        bytes32 letterId;
        bool success;
        string message;
        string secretWords;
        Annex[] annexes;
    }

    // 存储映射
    mapping(bytes32 => Letter) private letters; // letterId => Letter
    mapping(bytes32 => bytes32) private passwordHashToId; // passwordHash => letterId
    mapping(bytes => Annex) private annex; // annexKey => Annex

    // 错误定义
    error UnauthorizedAccess();
    error LetterNotExists();
    error LetterAlreadyClaimed();
    error LetterExpired();
    error LetterNotExpired();
    error InvalidProof();
    error InsufficientETH();
    error PasswordHashExists();

    constructor() {
        initialize();
    }

    function initialize() public initializer {
        __Ownable_init();
    }

    // ================== write function ==================

    /**
     * @dev 发送信件 - 使用密码哈希而非明文，nonce由外部传入
     * @param _annex 附件数组
     * @param _message 信件消息
     * @param _secretWords 密语
     * @param _passwordHash 密码的哈希值（keccak256(password)）
     * @param _deadline 截止时间
     * @param _nonce 外部传入的nonce（建议使用时间戳）
     */
    function sendLetter(
        Annex[] memory _annex,
        string memory _message,
        string memory _secretWords,
        bytes32 _passwordHash,
        uint256 _deadline,
        uint256 _nonce
    ) external payable returns (bytes32 _letterId) {
        Letter memory _letter;
        // 注释掉密码哈希重复检查，因为钱包绑定的哈希允许不同钱包使用相同密码
        if (passwordHashToId[_passwordHash] != bytes32(0)) {
            _letter = letters[passwordHashToId[_passwordHash]];
            delete letters[_letterId];
            delete passwordHashToId[_passwordHash];
            _transferAnnexes(_letter, _letter._sender);
            revert PasswordHashExists();
        }

        // 生成唯一的信件ID
        _letterId = _buildId(_annex, _message, _secretWords, _passwordHash, _deadline);

        bytes[] memory _keys = new bytes[](_annex.length);

        // 处理附件转移
        for (uint256 _i = 0; _i < _annex.length; _i++) {
            _transferAnnexToVault(_annex[_i]);
            bytes memory _annexKey = abi.encodePacked(_letterId, _i);
            annex[_annexKey] = _annex[_i];
            _keys[_i] = _annexKey;
        }

        // 创建信件
        _letter = Letter({
            _letterId: _letterId,
            _sender: msg.sender,
            _annexAmount: _annex.length,
            _message: _message,
            _secretWords: _secretWords,
            _passwordHash: _passwordHash,
            _deadline: _deadline,
            _nonce: _nonce,
            _claimed: false
        });

        letters[_letterId] = _letter;
        passwordHashToId[_passwordHash] = _letterId;

        emit SendLetter(_letterId, msg.sender, _passwordHash, _keys);
    }

    /**
     * @dev 使用零知识证明领取信件
     * @param _letterId 信件ID
     * @param _zkProof ZK证明数据
     */
    function claimWithZKProof(bytes32 _letterId, ZKProofData memory _zkProof) external {
        Letter storage _letter = letters[_letterId];
        if (_letter._sender == address(0)) revert LetterNotExists();
        if (_letter._claimed) revert LetterAlreadyClaimed();
        if (_letter._deadline <= block.timestamp) revert LetterExpired();

        // 验证ZK证明
        // 公共输入应该是: [isValid, passwordHash]
        // 私密输入是: password（在电路中验证 password^2 == passwordHash）
        bool _proofValid = _verifyZKProof(_letter, _zkProof);

        emit ZKProofVerified(_letterId, msg.sender, _proofValid);

        if (!_proofValid) revert InvalidProof();

        // 标记为已领取
        _letter._claimed = true;
        delete passwordHashToId[_letter._passwordHash];

        // 转移所有附件给领取者
        _transferAnnexes(_letter, msg.sender);

        emit Claim(_letterId, msg.sender);
    }

    /**
     * @dev 超时后发送者可以收回信件
     */
    function timeoutClaim(bytes32 _letterId) external {
        Letter storage _letter = letters[_letterId];
        if (_letter._sender == address(0)) revert LetterNotExists();
        if (_letter._sender != msg.sender) revert UnauthorizedAccess();
        if (_letter._deadline > block.timestamp) revert LetterNotExpired();
        if (_letter._claimed) revert LetterAlreadyClaimed();

        // 标记为已领取（防止重复领取）
        _letter._claimed = true;
        delete passwordHashToId[_letter._passwordHash];
        delete letters[_letterId];

        // 退还所有附件给发送者
        _transferAnnexes(_letter, _letter._sender);

        emit TimeoutClaim(_letterId, msg.sender);
    }

    // ================== view function ==================

    /**
     * @dev 获取信件的公开参数
     */
    function letterPublicParams(bytes32 _letterId) external view returns (address _sender, string memory _message, uint256 _deadline, bytes32 _passwordHash, uint256 _nonce, bool _claimed) {
        Letter memory _letter = letters[_letterId];
        return (_letter._sender, _letter._message, _letter._deadline, _letter._passwordHash, _letter._nonce, _letter._claimed);
    }

    /**
     * @dev 通过密码哈希查询信件ID
     */
    function getLetterIdByPasswordHash(bytes32 _passwordHash) external view returns (bytes32) {
        return passwordHashToId[_passwordHash];
    }

    /**
     * @dev 获取信件的附件信息（需要知道letterId）
     */
    function getLetterAnnexes(bytes32 _letterId) external view returns (Annex[] memory _annexes) {
        Letter memory _letter = letters[_letterId];
        if (_letter._sender == address(0)) return _annexes;

        _annexes = new Annex[](_letter._annexAmount);
        for (uint256 _i = 0; _i < _letter._annexAmount; _i++) {
            _annexes[_i] = annex[abi.encodePacked(_letterId, _i)];
        }
    }

    /**
     * @dev 测试函数：直接验证ZK证明（用于调试对比）
     */
    function testVerifyProof(uint256[8] memory proof, uint256[] memory input) external view returns (bool) {
        return ZKVerifierLib.verifyProof(proof, input);
    }

    /**
     * @dev 通过ZK证明读取信件的加密信息
     * @param _letterId 信件ID
     * @param _zkProof ZK证明数据
     * @return _success 验证是否成功
     * @return _secretWords 密语（仅在验证成功时返回）
     * @return _message 信件消息
     * @return _annexes 附件信息
     */
    function readLetterWithZKProof(bytes32 _letterId, ZKProofData memory _zkProof) external view returns (bool _success, string memory _secretWords, string memory _message, Annex[] memory _annexes) {
        Letter memory _letter = letters[_letterId];

        // 检查信件是否存在
        if (_letter._sender == address(0)) {
            return (false, "", "", new Annex[](0));
        }

        // 验证ZK证明
        bool _proofValid = _verifyZKProof(_letter, _zkProof);

        if (!_proofValid) {
            return (false, "", "", new Annex[](0));
        }

        // 验证成功，返回加密信息
        _annexes = new Annex[](_letter._annexAmount);
        for (uint256 _i = 0; _i < _letter._annexAmount; _i++) {
            _annexes[_i] = annex[abi.encodePacked(_letterId, _i)];
        }

        return (true, _letter._secretWords, _letter._message, _annexes);
    }

    /**
     * @dev 通过ZK证明读取信件的完整信息（包括敏感信息）
     * @param _letterId 信件ID
     * @param _zkProof ZK证明数据
     * @return _success 验证是否成功
     * @return _letter 完整的信件信息（如果验证成功）
     */
    function getLetterDetailWithZKProof(bytes32 _letterId, ZKProofData memory _zkProof) external view returns (bool _success, Letter memory _letter) {
        _letter = letters[_letterId];

        // 检查信件是否存在
        if (_letter._sender == address(0)) {
            return (false, _letter);
        }

        // 验证ZK证明
        bool _proofValid = _verifyZKProof(_letter, _zkProof);

        if (!_proofValid) {
            // 验证失败，清空敏感信息
            _letter._secretWords = "";
            _letter._message = "";
            return (false, _letter);
        }

        // 验证成功，返回完整信件信息
        return (true, _letter);
    }

    // ================== 内部函数 ==================

    /**
     * @dev 验证零知识证明
     * @param _letter 信件信息
     * @param _zkProof ZK证明数据
     */
    function _verifyZKProof(Letter memory _letter, ZKProofData memory _zkProof) internal view returns (bool) {
        // 实际的公共输入顺序：[isValid, passwordHash]
        // 验证公共输入数量
        if (_zkProof.publicInputs.length != 2) {
            return false;
        }

        // 验证第一个公共输入（isValid）应该为1
        if (_zkProof.publicInputs[0] != 1) {
            return false;
        }

        // 关键验证：验证证明中的passwordHash是否与信件的passwordHash匹配
        // 注意：两者都应该使用相同的哈希方法（password^2 或 keccak256(password)）
        uint256 letterPasswordHash = uint256(_letter._passwordHash);
        if (_zkProof.publicInputs[1] != letterPasswordHash) {
            return false;
        }

        // 使用ZKVerifierLib验证证明
        return ZKVerifierLib.verifyProof(_zkProof.proof, _zkProof.publicInputs);
    }

    /**
     * @dev 将附件转移到保险库
     */
    function _transferAnnexToVault(Annex memory _annex) internal {
        if (_annex._type == ETH_TYPE) {
            if (msg.value < _annex._amount) revert InsufficientETH();
        } else if (_annex._type == ERC20_TYPE) {
            IERC20(_annex._address).transferFrom(msg.sender, address(this), _annex._amount);
        } else if (_annex._type == ERC721_TYPE) {
            IERC721(_annex._address).transferFrom(msg.sender, address(this), _annex._id);
        } else if (_annex._type == ERC1155_TYPE) {
            IERC1155(_annex._address).safeTransferFrom(msg.sender, address(this), _annex._id, _annex._amount, new bytes(0));
        }
    }

    /**
     * @dev 将附件转移给领取者
     */
    function _transferAnnexes(Letter memory _letter, address _recipient) internal {
        for (uint256 _i = 0; _i < _letter._annexAmount; _i++) {
            bytes memory _annexId = abi.encodePacked(_letter._letterId, _i);
            Annex memory _annex = annex[_annexId];

            if (_annex._type == ETH_TYPE) {
                payable(_recipient).transfer(_annex._amount);
            } else if (_annex._type == ERC20_TYPE) {
                IERC20(_annex._address).transfer(_recipient, _annex._amount);
            } else if (_annex._type == ERC721_TYPE) {
                IERC721(_annex._address).safeTransferFrom(address(this), _recipient, _annex._id);
            } else if (_annex._type == ERC1155_TYPE) {
                IERC1155(_annex._address).safeTransferFrom(address(this), _recipient, _annex._id, _annex._amount, new bytes(0));
            }

            delete annex[_annexId];
        }
    }

    /**
     * @dev 构建信件ID - 简化版本，减少堆栈使用
     */
    function _buildId(Annex[] memory _annex, string memory _message, string memory _secretWords, bytes32 _passwordHash, uint256 _deadline) internal view returns (bytes32) {
        bytes32 annexHash = _annex.length > 0 ? keccak256(abi.encode(_annex)) : bytes32(0);
        return keccak256(abi.encodePacked(annexHash, _message, _secretWords, _passwordHash, _deadline, msg.sender, block.timestamp, block.number));
    }

    /**
     * @dev 接收ETH
     */
    receive() external payable {}
}
