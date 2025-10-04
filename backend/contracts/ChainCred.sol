// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ChainCred
 * @dev Blockchain-based credential verification system for Latin America
 * @notice This contract manages the issuance, verification, and revocation of educational credentials
 */
contract ChainCred is ERC721, AccessControl {
    bytes32 public constant UNIVERSITY_ROLE = keccak256("UNIVERSITY_ROLE");
    uint256 private _tokenIdCounter;
    
    struct Credential {
        uint256 tokenId;
        string studentName;
        string studentId;
        string university;
        string degree;
        string major;
        string issueDate;
        string graduationDate;
        bool isRevoked;
        uint256 timestamp;
        address issuer;
    }
    
    // Mapping from token ID to credential data
    mapping(uint256 => Credential) public credentials;
    
    // Mapping from student address to their credential token IDs
    mapping(address => uint256[]) public studentCredentials;
    
    // Mapping from university address to their issued credential token IDs
    mapping(address => uint256[]) public universityIssuedCredentials;
    
    // Events
    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed student,
        address indexed university,
        string degree,
        string major
    );
    
    event CredentialRevoked(
        uint256 indexed tokenId,
        address indexed revokedBy,
        uint256 timestamp
    );
    
    event UniversityAdded(
        address indexed university,
        string name
    );
    
    constructor() ERC721("ChainCred Credential", "CRED") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Add a university that can issue credentials
     * @param universityAddress Address of the university
     */
    function addUniversity(address universityAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(universityAddress != address(0), "Invalid address");
        _grantRole(UNIVERSITY_ROLE, universityAddress);
        emit UniversityAdded(universityAddress, "University");
    }
    
    /**
     * @dev Issue a new credential to a student
     * @param studentAddress Address of the student receiving the credential
     * @param studentName Full name of the student
     * @param studentId Student identification number
     * @param university Name of the university
     * @param degree Type of degree (Bachelor's, Master's, etc.)
     * @param major Field of study
     * @param issueDate Date the credential is issued
     * @param graduationDate Date the student graduated
     * @return tokenId The ID of the newly minted credential
     */
    function issueCredential(
        address studentAddress,
        string memory studentName,
        string memory studentId,
        string memory university,
        string memory degree,
        string memory major,
        string memory issueDate,
        string memory graduationDate
    ) external onlyRole(UNIVERSITY_ROLE) returns (uint256) {
        require(studentAddress != address(0), "Invalid student address");
        require(bytes(studentName).length > 0, "Student name required");
        require(bytes(studentId).length > 0, "Student ID required");
        require(bytes(degree).length > 0, "Degree required");
        require(bytes(major).length > 0, "Major required");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(studentAddress, tokenId);
        
        credentials[tokenId] = Credential({
            tokenId: tokenId,
            studentName: studentName,
            studentId: studentId,
            university: university,
            degree: degree,
            major: major,
            issueDate: issueDate,
            graduationDate: graduationDate,
            isRevoked: false,
            timestamp: block.timestamp,
            issuer: msg.sender
        });
        
        studentCredentials[studentAddress].push(tokenId);
        universityIssuedCredentials[msg.sender].push(tokenId);
        
        emit CredentialIssued(tokenId, studentAddress, msg.sender, degree, major);
        
        return tokenId;
    }
    
    /**
     * @dev Revoke a credential
     * @param tokenId The ID of the credential to revoke
     */
    function revokeCredential(uint256 tokenId) external onlyRole(UNIVERSITY_ROLE) {
        require(_exists(tokenId), "Credential does not exist");
        require(credentials[tokenId].issuer == msg.sender, "Only issuer can revoke");
        require(!credentials[tokenId].isRevoked, "Already revoked");
        
        credentials[tokenId].isRevoked = true;
        
        emit CredentialRevoked(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verify a credential
     * @param tokenId The ID of the credential to verify
     * @return isValid Whether the credential is valid (exists and not revoked)
     * @return credential The credential data
     */
    function verifyCredential(uint256 tokenId) external view returns (bool isValid, Credential memory credential) {
        if (!_exists(tokenId)) {
            return (false, credential);
        }
        
        credential = credentials[tokenId];
        isValid = !credential.isRevoked;
        
        return (isValid, credential);
    }
    
    /**
     * @dev Get all credentials for a student
     * @param studentAddress Address of the student
     * @return Array of credential data
     */
    function getStudentCredentials(address studentAddress) external view returns (Credential[] memory) {
        uint256[] memory tokenIds = studentCredentials[studentAddress];
        Credential[] memory result = new Credential[](tokenIds.length);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            result[i] = credentials[tokenIds[i]];
        }
        
        return result;
    }
    
    /**
     * @dev Get all credentials issued by a university
     * @param universityAddress Address of the university
     * @return Array of credential data
     */
    function getUniversityCredentials(address universityAddress) external view returns (Credential[] memory) {
        uint256[] memory tokenIds = universityIssuedCredentials[universityAddress];
        Credential[] memory result = new Credential[](tokenIds.length);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            result[i] = credentials[tokenIds[i]];
        }
        
        return result;
    }
    
    /**
     * @dev Get the owner of a credential
     * @param tokenId The ID of the credential
     * @return Address of the credential owner
     */
    function getCredentialOwner(uint256 tokenId) external view returns (address) {
        require(_exists(tokenId), "Credential does not exist");
        return ownerOf(tokenId);
    }
    
    /**
     * @dev Get total number of credentials issued
     * @return Total count
     */
    function getTotalCredentials() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Check if an address is a university
     * @param account Address to check
     * @return True if the address has university role
     */
    function isUniversity(address account) external view returns (bool) {
        return hasRole(UNIVERSITY_ROLE, account);
    }
    
    // Override required functions
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}