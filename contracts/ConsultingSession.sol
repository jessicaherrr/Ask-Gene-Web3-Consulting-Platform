// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ConsultingSession
 * @dev Smart contract for managing consulting sessions with escrow payments
 * Implements session lifecycle: creation → confirmation → payment release/refund
 * @author Jessica He
 */
contract ConsultingSession is ReentrancyGuard, Ownable {
    
    // ============ ENUMS ============
    
    /**
     * @dev Session status enumeration
     * CREATED: Session created, awaiting consultant confirmation
     * ACTIVE: Session confirmed by consultant, in progress
     * COMPLETED: Session marked as completed by client
     * PAYMENT_RELEASED: Payment released to consultant
     * REFUNDED: Payment refunded to client
     */
    enum SessionStatus {
        CREATED,
        ACTIVE,
        COMPLETED,
        PAYMENT_RELEASED,
        REFUNDED
    }
    
    // ============ STRUCTS ============
    
    /**
     * @dev Session structure storing all session details
     * @param client Address of the client who booked the session
     * @param consultant Address of the consultant providing service
     * @param amount Total payment amount in wei
     * @param duration Session duration in minutes
     * @param scheduledTime Unix timestamp of scheduled session
     * @param status Current status of the session
     * @param createdAt Timestamp when session was created
     * @param completedAt Timestamp when session was completed
     * @param isConfirmed Boolean indicating if consultant confirmed the session
     */
    struct Session {
        address client;
        address consultant;
        uint256 amount;
        uint256 duration;
        uint256 scheduledTime;
        SessionStatus status;
        uint256 createdAt;
        uint256 completedAt;
        bool isConfirmed;
    }
    
    // ============ STATE VARIABLES ============
    
    uint256 public sessionCounter;
    uint256 public platformFeePercentage = 5; // 5% platform fee
    address public platformWallet;
    
    // Mapping from session ID to Session struct
    mapping(uint256 => Session) public sessions;
    
    // Mapping from session ID to whether feedback is stored
    mapping(uint256 => bool) public feedbackStored;
    
    // ============ EVENTS ============
    
    /**
     * @dev Emitted when a new consulting session is created
     */
    event SessionCreated(
        uint256 indexed sessionId,
        address indexed client,
        address indexed consultant,
        uint256 amount,
        uint256 duration,
        uint256 scheduledTime
    );
    
    /**
     * @dev Emitted when a consultant confirms a session
     */
    event SessionConfirmed(uint256 indexed sessionId, address indexed consultant);
    
    /**
     * @dev Emitted when a session is marked as completed
     */
    event SessionCompleted(uint256 indexed sessionId, address indexed client);
    
    /**
     * @dev Emitted when payment is released to consultant
     */
    event PaymentReleased(
        uint256 indexed sessionId,
        address indexed consultant,
        uint256 amount,
        uint256 platformFee
    );
    
    /**
     * @dev Emitted when payment is refunded to client
     */
    event PaymentRefunded(
        uint256 indexed sessionId,
        address indexed client,
        uint256 amount
    );
    
    /**
     * @dev Emitted when feedback is linked to a session
     */
    event FeedbackLinked(uint256 indexed sessionId, bytes32 feedbackHash);
    
    // ============ MODIFIERS ============
    
    /**
     * @dev Modifier to check if caller is the session's client
     */
    modifier onlyClient(uint256 sessionId) {
        require(sessions[sessionId].client == msg.sender, "Not the session client");
        _;
    }
    
    /**
     * @dev Modifier to check if caller is the session's consultant
     */
    modifier onlyConsultant(uint256 sessionId) {
        require(sessions[sessionId].consultant == msg.sender, "Not the session consultant");
        _;
    }
    
    /**
     * @dev Modifier to check if session exists
     */
    modifier sessionExists(uint256 sessionId) {
        require(sessionId <= sessionCounter && sessionId > 0, "Session does not exist");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Initialize contract with platform wallet address
     * @param _platformWallet Address to receive platform fees
     */
    constructor(address _platformWallet) Ownable(msg.sender) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
        sessionCounter = 0;
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @notice Create a new consulting session with escrow payment
     * @dev Client books a session and deposits payment into escrow
     * @param consultant Address of the consultant
     * @param duration Session duration in minutes
     * @param scheduledTime Unix timestamp for the session
     * @return sessionId The ID of the newly created session
     */
    function createSession(
        address consultant,
        uint256 duration,
        uint256 scheduledTime
    ) external payable nonReentrant returns (uint256) {
        require(consultant != address(0), "Invalid consultant address");
        require(consultant != msg.sender, "Cannot book yourself");
        require(duration > 0, "Duration must be greater than 0");
        require(scheduledTime > block.timestamp, "Scheduled time must be in the future");
        require(msg.value > 0, "Payment amount must be greater than 0");
        
        sessionCounter++;
        
        Session storage newSession = sessions[sessionCounter];
        newSession.client = msg.sender;
        newSession.consultant = consultant;
        newSession.amount = msg.value;
        newSession.duration = duration;
        newSession.scheduledTime = scheduledTime;
        newSession.status = SessionStatus.CREATED;
        newSession.createdAt = block.timestamp;
        newSession.isConfirmed = false;
        
        emit SessionCreated(
            sessionCounter,
            msg.sender,
            consultant,
            msg.value,
            duration,
            scheduledTime
        );
        
        return sessionCounter;
    }
    
    /**
     * @notice Consultant confirms the session
     * @dev Consultant must confirm before session can be marked as active
     * @param sessionId ID of the session to confirm
     */
    function confirmSession(uint256 sessionId) 
        external 
        sessionExists(sessionId)
        onlyConsultant(sessionId)
        nonReentrant 
    {
        Session storage session = sessions[sessionId];
        
        require(!session.isConfirmed, "Session already confirmed");
        require(session.status == SessionStatus.CREATED, "Invalid session status");
        
        session.isConfirmed = true;
        session.status = SessionStatus.ACTIVE;
        
        emit SessionConfirmed(sessionId, msg.sender);
    }
    
    /**
     * @notice Mark session as completed
     * @dev Only client can mark session as completed
     * @param sessionId ID of the session to complete
     */
    function confirmCompletion(uint256 sessionId) 
        external 
        sessionExists(sessionId)
        onlyClient(sessionId)
        nonReentrant 
    {
        Session storage session = sessions[sessionId];
        
        require(session.status == SessionStatus.ACTIVE, "Session must be active");
        require(session.isConfirmed, "Session not confirmed by consultant");
        require(block.timestamp >= session.scheduledTime, "Session time not reached");
        
        session.status = SessionStatus.COMPLETED;
        session.completedAt = block.timestamp;
        
        emit SessionCompleted(sessionId, msg.sender);
    }
    
    /**
     * @notice Release payment to consultant
     * @dev Can be called by either client or consultant after session completion
     *      Platform fee is deducted and sent to platform wallet
     * @param sessionId ID of the session
     */
    function releasePayment(uint256 sessionId) 
        external 
        sessionExists(sessionId)
        nonReentrant 
    {
        Session storage session = sessions[sessionId];
        
        require(
            msg.sender == session.client || msg.sender == session.consultant,
            "Only client or consultant can release payment"
        );
        require(session.status == SessionStatus.COMPLETED, "Session must be completed");
        require(feedbackStored[sessionId], "Feedback must be stored first");
        
        uint256 platformFee = (session.amount * platformFeePercentage) / 100;
        uint256 consultantAmount = session.amount - platformFee;
        
        // Update status before transfer to prevent reentrancy
        session.status = SessionStatus.PAYMENT_RELEASED;
        
        // Transfer platform fee
        (bool platformSuccess, ) = platformWallet.call{value: platformFee}("");
        require(platformSuccess, "Platform fee transfer failed");
        
        // Transfer consultant payment
        (bool consultantSuccess, ) = session.consultant.call{value: consultantAmount}("");
        require(consultantSuccess, "Consultant payment transfer failed");
        
        emit PaymentReleased(sessionId, session.consultant, consultantAmount, platformFee);
    }
    
    /**
     * @notice Refund payment to client
     * @dev Can be called by either party under specific conditions
     *      Refund allowed if: consultant didn't confirm, session time passed without completion
     * @param sessionId ID of the session
     */
    function refund(uint256 sessionId) 
        external 
        sessionExists(sessionId)
        nonReentrant 
    {
        Session storage session = sessions[sessionId];
        
        require(
            msg.sender == session.client || msg.sender == session.consultant,
            "Only client or consultant can initiate refund"
        );
        
        bool refundable = false;
        
        // Case 1: Consultant never confirmed within 24 hours of scheduled time
        if (!session.isConfirmed && block.timestamp > session.scheduledTime + 1 days) {
            refundable = true;
        }
        // Case 2: Session time passed without completion
        else if (
            session.status == SessionStatus.ACTIVE && 
            block.timestamp > session.scheduledTime + session.duration * 1 minutes + 1 hours
        ) {
            refundable = true;
        }
        // Case 3: Session still in CREATED status 7 days after creation
        else if (
            session.status == SessionStatus.CREATED && 
            block.timestamp > session.createdAt + 7 days
        ) {
            refundable = true;
        }
        
        require(refundable, "Session not eligible for refund");
        
        // Update status before transfer to prevent reentrancy
        session.status = SessionStatus.REFUNDED;
        
        // Refund full amount to client
        (bool success, ) = session.client.call{value: session.amount}("");
        require(success, "Refund transfer failed");
        
        emit PaymentRefunded(sessionId, session.client, session.amount);
    }
    
    /**
     * @notice Link feedback hash to session (called by FeedbackStorage contract)
     * @dev Only contract owner (FeedbackStorage) can call this function
     * @param sessionId ID of the session
     */
    function linkFeedback(uint256 sessionId) external onlyOwner {
        require(sessionId <= sessionCounter && sessionId > 0, "Session does not exist");
        require(!feedbackStored[sessionId], "Feedback already stored");
        
        feedbackStored[sessionId] = true;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get session details by ID
     * @param sessionId ID of the session
     * @return session The complete session structure
     */
    function getSession(uint256 sessionId) 
        external 
        view 
        sessionExists(sessionId) 
        returns (Session memory) 
    {
        return sessions[sessionId];
    }
    
    /**
     * @notice Check if session is eligible for payment release
     * @param sessionId ID of the session
     * @return eligible True if payment can be released
     */
    function isPaymentReleasable(uint256 sessionId) external view returns (bool) {
        Session memory session = sessions[sessionId];
        
        return (
            session.status == SessionStatus.COMPLETED &&
            feedbackStored[sessionId] &&
            sessionId <= sessionCounter &&
            sessionId > 0
        );
    }
    
    /**
     * @notice Check if session is eligible for refund
     * @param sessionId ID of the session
     * @return eligible True if refund can be processed
     */
    function isRefundable(uint256 sessionId) external view returns (bool) {
        if (sessionId > sessionCounter || sessionId == 0) return false;
        
        Session memory session = sessions[sessionId];
        
        // Check refund conditions
        if (!session.isConfirmed && block.timestamp > session.scheduledTime + 1 days) {
            return true;
        }
        
        if (
            session.status == SessionStatus.ACTIVE && 
            block.timestamp > session.scheduledTime + session.duration * 1 minutes + 1 hours
        ) {
            return true;
        }
        
        if (
            session.status == SessionStatus.CREATED && 
            block.timestamp > session.createdAt + 7 days
        ) {
            return true;
        }
        
        return false;
    }
    
    /**
     * @notice Get contract balance
     * @return balance Current ETH balance held in escrow
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update platform fee percentage
     * @dev Only contract owner can call
     * @param newPercentage New platform fee percentage (0-20)
     */
    function updatePlatformFee(uint256 newPercentage) external onlyOwner {
        require(newPercentage <= 20, "Fee percentage too high");
        platformFeePercentage = newPercentage;
    }
    
    /**
     * @notice Update platform wallet address
     * @dev Only contract owner can call
     * @param newWallet New platform wallet address
     */
    function updatePlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet address");
        platformWallet = newWallet;
    }
    
    /**
     * @notice Emergency withdrawal (only in case of issues)
     * @dev Only contract owner can call, should never be needed in normal operation
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}