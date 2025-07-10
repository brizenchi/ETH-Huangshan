// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ManagedAgent
 * @author Gemini AI (for Hackathon)
 * @notice A marketplace where a Creator can register an Agent (identified by a CID)
 * and assign an Operator to manage it and receive payments.
 * The CID is the unique public identifier for an Agent.
 */
contract ManagedAgent is ReentrancyGuard, Ownable {

    // =============================================================
    //                           STRUCTS
    // =============================================================

    struct KnowledgeAgent {
        address creator;
        address operator;
        string name;
        string description;
        uint256 price;
        string cid;
        bool exists;
    }

    struct Question {
        uint256 id;
        bytes32 agentId;
        address questioner;
        string questionContent;
        string answerCID;
        bool isAnswered;
    }

    // =============================================================
    //                             STATE
    // =============================================================

    mapping(bytes32 => KnowledgeAgent) public knowledgeAgents;
    mapping(address => bytes32[]) public agentsByCreator;
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
        bytes32 indexed agentId,
        address indexed creator,
        address indexed operator,
        string cid,
        string name
    );

    // CHANGED: Added the original `cid` string to the event for off-chain services.
    event QuestionAsked(
        uint256 indexed questionId,
        bytes32 indexed agentId,
        address indexed questioner,
        string cid, // <-- ADDED: Original CID for backend service direct use
        string questionContent
    );

    event AnswerSubmitted(
        uint256 indexed questionId,
        string answerCID
    );

    // =============================================================
    //                     AGENT MANAGEMENT FUNCTIONS
    // =============================================================

    function registerAgent(
        string memory _cid,
        address _operator,
        string memory _name,
        string memory _description,
        uint256 _price
    ) external {
        require(bytes(_cid).length > 0, "CID cannot be empty");
        bytes32 agentId = keccak256(abi.encodePacked(_cid));
        
        require(!knowledgeAgents[agentId].exists, "Agent with this CID already exists");
        require(_operator != address(0), "Operator address cannot be zero");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_price > 0, "Price must be greater than zero");

        knowledgeAgents[agentId] = KnowledgeAgent({
            creator: msg.sender,
            operator: _operator,
            name: _name,
            description: _description,
            price: _price,
            cid: _cid,
            exists: true
        });

        agentsByCreator[msg.sender].push(agentId);

        emit AgentRegistered(agentId, msg.sender, _operator, _cid, _name);
    }

    // =============================================================
    //                       CLIENT FUNCTIONS
    // =============================================================

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

        (bool success, ) = agent.operator.call{value: msg.value}("");
        require(success, "Failed to send payment to the agent operator");

        // CHANGED: Pass the original `_cid` to the event.
        emit QuestionAsked(
            questionId,
            agentId,
            msg.sender,
            _cid, // <-- ADDED: Pass original CID to event
            _questionContent
        );
    }

    // =============================================================
    //                      SERVICE FUNCTIONS
    // =============================================================
    
    function submitAnswer(uint256 _questionId, string memory _answerCID) external {
        require(_questionId < questions.length, "Question ID is out of bounds");
        Question storage question = questions[_questionId];
        require(!question.isAnswered, "This question has already been answered");

        KnowledgeAgent storage agent = knowledgeAgents[question.agentId];
        require(msg.sender == agent.operator, "Caller is not the authorized operator for this Agent");

        question.answerCID = _answerCID;
        question.isAnswered = true;

        emit AnswerSubmitted(_questionId, _answerCID);
    }

    // =============================================================
    //                         VIEW FUNCTIONS
    // =============================================================

    function getAgentDetails(string memory _cid) 
        external 
        view 
        returns (
            address creator,
            address operator,
            string memory name,
            string memory description,
            uint256 price
        )
    {
        bytes32 agentId = keccak256(abi.encodePacked(_cid));
        KnowledgeAgent storage agent = knowledgeAgents[agentId];
        require(agent.exists, "Agent with this CID does not exist");

        return (
            agent.creator,
            agent.operator,
            agent.name,
            agent.description,
            agent.price
        );
    }

    function getAgentIdsByCreator(address _creator) external view returns (bytes32[] memory) {
        return agentsByCreator[_creator];
    }
}