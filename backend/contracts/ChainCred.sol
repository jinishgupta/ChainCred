// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ChainCredOptimized
 * @dev Optimized blockchain-based credential verification system
 * @notice This contract manages the issuance, verification, and revocation of educational credentials
 */
contract ChainCred is ERC721, AccessControl {
    bytes32 public constant UNIVERSITY_ROLE = keccak256("UNIVERSITY_ROLE");
    uint256 private _tokenIdCounter = 1;
    
    enum UniversityStatus { NotRegistered, Pending, Verified, Rejected }
    
    struct UniversityInfo {
        string name;
        string country;
        string registrationNumber;
        address universityAddress;
        UniversityStatus status;
        uint256 registrationTimestamp;
    }
    
    struct Credential {
        uint256 tokenId;
        address studentAddress;
        address issuer;
        bool isRevoked;
        string tokenURI;
    }
    
    // Core mappings
    mapping(uint256 => Credential) public credentials;
    mapping(address => UniversityInfo) public universities;
    mapping(address => uint256[]) public studentCredentials;
    mapping(address => uint256[]) public universityIssuedCredentials;
    
    // Optimized pending universities tracking
    mapping(address => uint256) private pendingUniversityIndex;
    address[] public pendingUniversities;
    
    // Events
    event CredentialIssued(uint256 indexed tokenId, address indexed studentAddress, address indexed issuer, string tokenURI);
    event CredentialRevoked(uint256 indexed tokenId, address indexed revokedBy, uint256 timestamp);
    event UniversityRegistered(address indexed university, string name, uint256 timestamp);
    event UniversityApproved(address indexed university, address indexed approvedBy, uint256 timestamp);
    event UniversityRejected(address indexed university, address indexed rejectedBy, uint256 timestamp);
    event UniversityAdded(address indexed university,string name);

    constructor() ERC721("ChainCred Credential", "CRED") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    // ---------- UNIVERSITY MANAGEMENT ----------
    
    function registerUniversity(
        string calldata name,
        string calldata country,
        string calldata registrationNumber
    ) external {
        require(universities[msg.sender].status == UniversityStatus.NotRegistered, "Already registered");
        require(bytes(name).length > 0, "Name required");
        require(bytes(country).length > 0, "Country required");
        require(bytes(registrationNumber).length > 0, "Registration number required");
        
        universities[msg.sender] = UniversityInfo({
            name: name,
            country: country,
            registrationNumber: registrationNumber,
            universityAddress: msg.sender,
            status: UniversityStatus.Pending,
            registrationTimestamp: block.timestamp
        });
        
        // Optimized pending university tracking
        pendingUniversityIndex[msg.sender] = pendingUniversities.length;
        pendingUniversities.push(msg.sender);
        
        emit UniversityRegistered(msg.sender, name, block.timestamp);
    }
    
    function approveUniversity(address universityAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(universities[universityAddress].status == UniversityStatus.Pending, "Not pending");
        
        universities[universityAddress].status = UniversityStatus.Verified;
        _grantRole(UNIVERSITY_ROLE, universityAddress);
        
        _removePendingUniversity(universityAddress);
        
        emit UniversityApproved(universityAddress, msg.sender, block.timestamp);
    } 
    
    /**
     * @dev Reject a pending university
     * @param universityAddress Address of the university to reject
     */
    function rejectUniversity(address universityAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(universities[universityAddress].status == UniversityStatus.Pending, "Not pending");
        
        universities[universityAddress].status = UniversityStatus.Rejected;
        _removePendingUniversity(universityAddress);
        
        emit UniversityRejected(universityAddress, msg.sender, block.timestamp);
    }
    
    // Optimized O(1) removal
    function _removePendingUniversity(address universityAddress) private {
        uint256 index = pendingUniversityIndex[universityAddress];
        uint256 lastIndex = pendingUniversities.length - 1;
        
        if (index != lastIndex) {
            address lastUniversity = pendingUniversities[lastIndex];
            pendingUniversities[index] = lastUniversity;
            pendingUniversityIndex[lastUniversity] = index;
        }
        
        pendingUniversities.pop();
        delete pendingUniversityIndex[universityAddress];
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

    // ---------- CREDENTIAL MANAGEMENT ----------
    
    function issueCredential(
        address studentAddress,
        string calldata tokenURI
    ) external onlyRole(UNIVERSITY_ROLE) returns (uint256) {
        require(universities[msg.sender].status == UniversityStatus.Verified, "University not verified");
        require(studentAddress != address(0), "Invalid student address");
        require(bytes(tokenURI).length > 0, "IPFS CID required");
        
        uint256 tokenId = _tokenIdCounter++;
        
        _safeMint(studentAddress, tokenId);
        
        credentials[tokenId] = Credential({
            tokenId: tokenId,
            studentAddress: studentAddress,
            issuer: msg.sender,
            isRevoked: false,
            tokenURI: tokenURI
        });
        
        studentCredentials[studentAddress].push(tokenId);
        universityIssuedCredentials[msg.sender].push(tokenId);
        
        emit CredentialIssued(tokenId, studentAddress, msg.sender, tokenURI);
        
        return tokenId;
    }
    
    function revokeCredential(uint256 tokenId) external onlyRole(UNIVERSITY_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Credential does not exist");
        require(credentials[tokenId].issuer == msg.sender, "Only issuer can revoke");
        require(!credentials[tokenId].isRevoked, "Already revoked");
        
        credentials[tokenId].isRevoked = true;
        
        emit CredentialRevoked(tokenId, msg.sender, block.timestamp);
    }
    
    function verifyCredential(uint256 tokenId) external view returns (bool isValid, Credential memory credential) {
        if (_ownerOf(tokenId) == address(0)) {
            return (false, credential);
        }
        
        credential = credentials[tokenId];
        isValid = !credential.isRevoked;
        
        return (isValid, credential);
    }
    
    // ---------- SOULBOUND IMPLEMENTATION ----------
    
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == 0) and burning (to == 0)
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Non-transferable token");
        }
        
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override {
        revert("Soulbound: Approval not allowed");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: Approval not allowed");
    }

    // Transfer functions are handled by _update override above
        
    // ---------- VIEW FUNCTIONS ----------
    
    function getStudentCredentials(address studentAddress) external view returns (Credential[] memory) {
        uint256[] memory tokenIds = studentCredentials[studentAddress];
        Credential[] memory result = new Credential[](tokenIds.length);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            result[i] = credentials[tokenIds[i]];
        }
        
        return result;
    }
    
    function getUniversityCredentials(address universityAddress) external view returns (Credential[] memory) {
        uint256[] memory tokenIds = universityIssuedCredentials[universityAddress];
        Credential[] memory result = new Credential[](tokenIds.length);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            result[i] = credentials[tokenIds[i]];
        }
        
        return result;
    }
    
    function getTotalCredentials() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    function getUniversityInfo(address universityAddress) external view returns (UniversityInfo memory) {
        return universities[universityAddress];
    }
    
    function getUniversityStatus(address universityAddress) external view returns (UniversityStatus) {
        return universities[universityAddress].status;
    }
    
    function getPendingUniversities() external view returns (address[] memory) {
        return pendingUniversities;
    }
    
    function getPendingUniversitiesInfo() external view returns (UniversityInfo[] memory) {
        UniversityInfo[] memory result = new UniversityInfo[](pendingUniversities.length);
        for (uint256 i = 0; i < pendingUniversities.length; i++) {
            result[i] = universities[pendingUniversities[i]];
        }
        return result;
    }
    
    function getCredentialOwner(uint256 tokenId) external view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Credential does not exist");
        return ownerOf(tokenId);
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
}