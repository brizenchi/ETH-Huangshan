// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CIDCentricAgent
 * @author Gemini AI (for Hackathon)
 * @notice A marketplace where each knowledge base CID represents a unique, queryable Agent.
 * An address can own multiple Agents (CIDs).
 */
contract CIDCentricAgent is ReentrancyGuard, Ownable {

    // =============================================================
    //                           STRUCTS
    // =============================================================

    // 每个Agent的元数据，与一个唯一的CID绑定
    struct KnowledgeAgent {
        address owner;
        string name;
        string description;
        uint256 price;
        string cid; // 知识库的原文CID，用于展示和链下获取
        bool exists;
    }

    // Question现在与一个agentId (CID的哈希) 关联
    struct Question {
        uint256 id;
        bytes32 agentId; // 问题的目标Agent ID (keccak256 of CID)
        address questioner;
        string questionContent;
        string answerCID;
        bool isAnswered;
    }

    // =============================================================
    //                             STATE
    // =============================================================

    // NEW: CID的哈希是主键 (primary key)
    mapping(bytes32 => KnowledgeAgent) public knowledgeAgents;

    // NEW: 追踪一个地址拥有的所有Agent的ID
    mapping(address => bytes32[]) public agentsByOwner;

    Question[] public questions;
    uint256 private _questionCounter;

    // =============================================================
    //                          CONSTRUCTOR
    // =============================================================

    constructor() Ownable(msg.sender) {}

    // =============================================================
    //                            EVENTS
    // =============================================================

    event AgentRegistered(
        bytes32 indexed agentId, // CID的哈希值
        address indexed owner,
        string cid,
        string name
    );

    event QuestionAsked(
        uint256 indexed questionId,
        bytes32 indexed agentId,
        address indexed questioner,
        string questionContent
    );

    event AnswerSubmitted(
        uint256 indexed questionId,
        string answerCID
    );

    // =============================================================
    //                     AGENT MANAGEMENT FUNCTIONS
    // =============================================================

    // CHANGED: 创建时必须传入CID作为唯一标识
    function registerAgent(
        string memory _cid,
        string memory _name,
        string memory _description,
        uint256 _price
    ) external {
        require(bytes(_cid).length > 0, "CID cannot be empty");
        bytes32 agentId = keccak256(abi.encodePacked(_cid));
        
        require(!knowledgeAgents[agentId].exists, "Agent with this CID already exists");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_price > 0, "Price must be greater than zero");

        knowledgeAgents[agentId] = KnowledgeAgent({
            owner: msg.sender,
            name: _name,
            description: _description,
            price: _price,
            cid: _cid,
            exists: true
        });

        agentsByOwner[msg.sender].push(agentId);

        emit AgentRegistered(agentId, msg.sender, _cid, _name);
    }

    // =============================================================
    //                       CLIENT FUNCTIONS
    // =============================================================

    // CHANGED: 提问时必须传入CID
    function askQuestion(string memory _cid, string memory _questionContent) external payable nonReentrant {
        bytes32 agentId = keccak256(abi.encodePacked(_cid));
        KnowledgeAgent storage agent = knowledgeAgents[agentId];
        
        require(agent.exists, "Agent with this CID does not exist");
        require(msg.value == agent.price, "Payment must match the agent's price");

        uint256 questionId = _questionCounter;
        
        questions.push(Question({
            id: questionId,
            agentId: agentId,
            questioner: msg.sender,
            questionContent: _questionContent,
            answerCID: "",
            isAnswered: false
        }));
        _questionCounter++;

        (bool success, ) = agent.owner.call{value: msg.value}("");
        require(success, "Failed to send payment to the agent owner");

        emit QuestionAsked(questionId, agentId, msg.sender, _questionContent);
    }

    // =============================================================
    //                      SERVICE FUNCTIONS
    // =============================================================
    
    // CHANGED: Authorization now checks against the owner of the agentId
    function submitAnswer(uint256 _questionId, string memory _answerCID) external {
        require(_questionId < questions.length, "Question ID is out of bounds");
        Question storage question = questions[_questionId];
        require(!question.isAnswered, "This question has already been answered");

        KnowledgeAgent storage agent = knowledgeAgents[question.agentId];
        require(msg.sender == agent.owner, "Caller is not the owner of this Agent");

        question.answerCID = _answerCID;
        question.isAnswered = true;

        emit AnswerSubmitted(_questionId, _answerCID);
    }

    // =============================================================
    //                         VIEW FUNCTIONS
    // =============================================================

    // CHANGED: 查询时必须传入CID
    function getAgentDetails(string memory _cid) 
        external 
        view 
        returns (
            address owner,
            string memory name,
            string memory description,
            uint256 price
        )
    {
        bytes32 agentId = keccak256(abi.encodePacked(_cid));
        KnowledgeAgent storage agent = knowledgeAgents[agentId];
        require(agent.exists, "Agent with this CID does not exist");

        return (
            agent.owner,
            agent.name,
            agent.description,
            agent.price
        );
    }

    // NEW: 辅助查询函数，获取一个地址拥有的所有Agent的ID列表
    function getAgentIdsByOwner(address _owner) external view returns (bytes32[] memory) {
        return agentsByOwner[_owner];
    }
}