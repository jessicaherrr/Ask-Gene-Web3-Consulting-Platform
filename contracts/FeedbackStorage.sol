// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ConsultingSession.sol";

/**
 * @title FeedbackStorage
 * @dev Smart contract for storing hashed feedback on-chain
 * Ensures feedback immutability and links it to consulting sessions
 * @author Jessica He
 */
contract FeedbackStorage is Ownable {
    
    // ============ STRUCTS ============
    
    /**
     * @dev Feedback structure storing hash and metadata
     * @param feedbackHash Keccak256 hash of the feedback content
     * @param sessionId ID of the associated consulting session
     * @param client Address of the client who provided feedback
     * @param consultant Address of the consultant receiving feedback
     * @param timestamp When feedback was stored
     * @param isVerified Boolean indicating if feedback was verified (AI processed)
     */
    struct Feedback {
        bytes32 feedbackHash;
        uint256 sessionId;
        address client;
        address consultant;
        uint256 timestamp;
        bool isVerified;
    }
    
    // ============ STATE VARIABLES ============
    
    ConsultingSession public consultingSession;
    
    // Mapping from session ID to Feedback struct
    mapping(uint256 => Feedback) public sessionFeedback;
    
    // Mapping from feedback hash to session ID
    mapping(bytes32 => uint256) public hashToSessionId;
    
    // Array of all feedback entries
    Feedback[] public allFeedback;
    
    // ============ EVENTS ============
    
    /**
     * @dev Emitted when new feedback is stored
     */
    event FeedbackStored(
        uint256 indexed sessionId,
        address indexed client,
        address indexed consultant,
        bytes32 feedbackHash,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when feedback is verified by AI
     */
    event FeedbackVerified(uint256 indexed sessionId, bytes32 feedbackHash);
    
    // ============ MODIFIERS ============
    
    /**
     * @dev Modifier to check if caller is the session's client
     */
    modifier onlySessionClient(uint256 sessionId) {
        ConsultingSession.Session memory session = consultingSession.getSession(sessionId);
        require(
            session.client == msg.sender,
            "Not the session client"
        );
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Initialize contract with ConsultingSession address
     * @param _consultingSessionAddress Address of the ConsultingSession contract
     */
    constructor(address _consultingSessionAddress) Ownable(msg.sender) {
        require(
            _consultingSessionAddress != address(0),
            "Invalid ConsultingSession address"
        );
        consultingSession = ConsultingSession(_consultingSessionAddress);
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @notice Store feedback hash for a completed session
     * @dev Only session client can store feedback
     *      Session must be in COMPLETED status
     *      Automatically links feedback to ConsultingSession contract
     * @param sessionId ID of the completed session
     * @param feedbackHash Keccak256 hash of the feedback content
     */
    function storeFeedbackHash(uint256 sessionId, bytes32 feedbackHash)
        external
        onlySessionClient(sessionId)
    {
        // Get session details from ConsultingSession contract
        ConsultingSession.Session memory session = consultingSession.getSession(sessionId);
        
        require(
            session.status == ConsultingSession.SessionStatus.COMPLETED,
            "Session must be completed"
        );
        require(sessionFeedback[sessionId].sessionId == 0, "Feedback already stored");
        require(feedbackHash != bytes32(0), "Invalid feedback hash");
        require(
            hashToSessionId[feedbackHash] == 0,
            "Feedback hash already used"
        );
        
        // Create new feedback entry
        Feedback memory newFeedback = Feedback({
            feedbackHash: feedbackHash,
            sessionId: sessionId,
            client: session.client,
            consultant: session.consultant,
            timestamp: block.timestamp,
            isVerified: false
        });
        
        // Store feedback
        sessionFeedback[sessionId] = newFeedback;
        hashToSessionId[feedbackHash] = sessionId;
        allFeedback.push(newFeedback);
        
        // Link feedback to ConsultingSession contract
        consultingSession.linkFeedback(sessionId);
        
        emit FeedbackStored(
            sessionId,
            session.client,
            session.consultant,
            feedbackHash,
            block.timestamp
        );
    }
    
    /**
     * @notice Verify feedback (called by backend/AI service)
     * @dev Only contract owner (backend service) can verify feedback
     *      Marks feedback as AI-verified
     * @param sessionId ID of the session
     * @param feedbackHash Hash to verify
     */
    function verifyFeedback(uint256 sessionId, bytes32 feedbackHash)
        external
        onlyOwner
    {
        require(
            sessionFeedback[sessionId].feedbackHash == feedbackHash,
            "Feedback hash mismatch"
        );
        require(!sessionFeedback[sessionId].isVerified, "Feedback already verified");
        
        sessionFeedback[sessionId].isVerified = true;
        
        // Update in allFeedback array
        for (uint256 i = 0; i < allFeedback.length; i++) {
            if (allFeedback[i].sessionId == sessionId) {
                allFeedback[i].isVerified = true;
                break;
            }
        }
        
        emit FeedbackVerified(sessionId, feedbackHash);
    }
    
    /**
     * @notice Get feedback by session ID
     * @param sessionId ID of the session
     * @return feedback The complete feedback structure
     */
    function getFeedbackBySession(uint256 sessionId)
        external
        view
        returns (Feedback memory)
    {
        require(sessionFeedback[sessionId].sessionId != 0, "No feedback for session");
        return sessionFeedback[sessionId];
    }
    
    /**
     * @notice Get feedback by hash
     * @param feedbackHash Hash of the feedback
     * @return feedback The complete feedback structure
     */
    function getFeedbackByHash(bytes32 feedbackHash)
        external
        view
        returns (Feedback memory)
    {
        uint256 sessionId = hashToSessionId[feedbackHash];
        require(sessionId != 0, "No feedback with this hash");
        return sessionFeedback[sessionId];
    }
    
    /**
     * @notice Check if session has stored feedback
     * @param sessionId ID of the session
     * @return hasFeedback True if feedback exists for session
     */
    function hasFeedback(uint256 sessionId) external view returns (bool) {
        return sessionFeedback[sessionId].sessionId != 0;
    }
    
    /**
     * @notice Check if feedback is verified
     * @param sessionId ID of the session
     * @return isVerified True if feedback is AI-verified
     */
    function isFeedbackVerified(uint256 sessionId) external view returns (bool) {
        require(sessionFeedback[sessionId].sessionId != 0, "No feedback for session");
        return sessionFeedback[sessionId].isVerified;
    }
    
    /**
     * @notice Get all feedback entries with pagination
     * @param startIndex Starting index for pagination
     * @param count Number of entries to return
     * @return feedback Array of feedback entries
     */
    function getAllFeedback(uint256 startIndex, uint256 count)
        external
        view
        returns (Feedback[] memory)
    {
        require(startIndex < allFeedback.length, "Start index out of bounds");
        
        uint256 endIndex = startIndex + count;
        if (endIndex > allFeedback.length) {
            endIndex = allFeedback.length;
        }
        
        Feedback[] memory result = new Feedback[](endIndex - startIndex);
        
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = allFeedback[i];
        }
        
        return result;
    }
    
    /**
     * @notice Get total number of feedback entries
     * @return count Total feedback count
     */
    function getFeedbackCount() external view returns (uint256) {
        return allFeedback.length;
    }
    
    /**
     * @notice Get feedback for a specific consultant
     * @param consultant Address of the consultant
     * @return feedback Array of feedback for the consultant
     */
    function getFeedbackForConsultant(address consultant)
        external
        view
        returns (Feedback[] memory)
    {
        uint256 count = 0;
        
        // First pass: count matching entries
        for (uint256 i = 0; i < allFeedback.length; i++) {
            if (allFeedback[i].consultant == consultant) {
                count++;
            }
        }
        
        // Second pass: collect matching entries
        Feedback[] memory result = new Feedback[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allFeedback.length; i++) {
            if (allFeedback[i].consultant == consultant) {
                result[index] = allFeedback[i];
                index++;
            }
        }
        
        return result;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update ConsultingSession contract address
     * @dev Only contract owner can call
     * @param newConsultingSessionAddress New ConsultingSession contract address
     */
    function updateConsultingSession(address newConsultingSessionAddress)
        external
        onlyOwner
    {
        require(
            newConsultingSessionAddress != address(0),
            "Invalid ConsultingSession address"
        );
        consultingSession = ConsultingSession(newConsultingSessionAddress);
    }
    
    /**
     * @notice Calculate feedback hash from string
     * @dev Utility function for frontend/backend to calculate hash
     * @param feedbackString The feedback content as string
     * @return hash Keccak256 hash of the feedback
     */
    function calculateFeedbackHash(string memory feedbackString)
        external
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(feedbackString));
    }
}