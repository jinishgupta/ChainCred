import { create } from 'ipfs-http-client';

// IPFS client configuration
// Using public IPFS gateway - for production, use a dedicated service like Pinata, Infura, or Web3.Storage
let ipfsClient;

const getIPFSClient = () => {
  if (!ipfsClient) {
    // Try to use local IPFS node
    try {
      ipfsClient = create({
        host: 'localhost',
        port: 5001,
        protocol: 'http',
      });
    } catch (error) {
      console.warn('Could not connect to local IPFS node. Using public gateway.');
      // Fallback to a public IPFS gateway
      ipfsClient = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
      });
    }
  }
  return ipfsClient;
};

/**
 * Upload credential metadata to IPFS
 * @param {Object} credentialData - The credential data to upload
 * @returns {Promise<string>} - The IPFS CID
 */
export async function uploadCredentialToIPFS(credentialData) {
  try {
    // Create metadata object in NFT standard format
    const metadata = {
      name: `ChainCred Certificate - ${credentialData.studentName}`,
      description: `Educational Credential: ${credentialData.degree} in ${credentialData.major} from ${credentialData.university}`,
      image: 'ipfs://QmYourDefaultCredentialImageCID', // You can customize this
      attributes: [
        {
          trait_type: 'Student Name',
          value: credentialData.studentName,
        },
        {
          trait_type: 'Student ID',
          value: credentialData.studentId,
        },
        {
          trait_type: 'University',
          value: credentialData.university,
        },
        {
          trait_type: 'Degree',
          value: credentialData.degree,
        },
        {
          trait_type: 'Major',
          value: credentialData.major,
        },
        {
          trait_type: 'Issue Date',
          value: credentialData.issueDate,
        },
        {
          trait_type: 'Graduation Date',
          value: credentialData.graduationDate,
        },
        {
          trait_type: 'Issue Timestamp',
          value: new Date().toISOString(),
        },
      ],
      credentialData: credentialData,
    };

    const client = getIPFSClient();
    const metadataString = JSON.stringify(metadata);
    const result = await client.add(metadataString);
    
    console.log('Uploaded to IPFS with CID:', result.path);
    return result.path; // This is the CID
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload credential metadata to IPFS: ' + error.message);
  }
}

/**
 * Retrieve credential metadata from IPFS
 * @param {string} cid - The IPFS CID
 * @returns {Promise<Object>} - The credential metadata
 */
export async function getCredentialFromIPFS(cid) {
  try {
    const client = getIPFSClient();
    
    const stream = client.cat(cid);
    const decoder = new TextDecoder();
    let data = '';

    for await (const chunk of stream) {
      data += decoder.decode(chunk, { stream: true });
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    // Fallback to HTTP gateway
    try {
      const response = await fetch(getIPFSUrl(cid));
      return await response.json();
    } catch (fetchError) {
      throw new Error('Failed to retrieve credential metadata from IPFS: ' + error.message);
    }
  }
}

/**
 * Get IPFS gateway URL for a CID
 * @param {string} cid - The IPFS CID
 * @returns {string} - The full IPFS URL
 */
export function getIPFSUrl(cid) {
  // Remove 'ipfs://' prefix if present
  const cleanCID = cid.replace('ipfs://', '');
  // Use public IPFS gateway
  return `https://ipfs.io/ipfs/${cleanCID}`;
}

/**
 * Alternative: Mock upload for testing without IPFS node
 * @param {Object} credentialData - The credential data
 * @returns {Promise<string>} - A mock CID
 */
export async function uploadCredentialMock(credentialData) {
  // Generate a mock CID for testing
  const mockCID = 'Qm' + btoa(JSON.stringify(credentialData)).substring(0, 44);
  console.log('Mock upload - CID:', mockCID);
  return mockCID;
}
