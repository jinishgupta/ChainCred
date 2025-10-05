import { PinataSDK } from 'pinata';
import { Blob, File } from 'buffer';

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: import.meta.env.VITE_GATEWAY_URL
});

// Upload image file to IPFS
const uploadImageToIPFS = async (req, res) => {
  try {
    const imageBlob = new Blob([req.file.buffer]);
    const imageFile = new File([imageBlob], req.file.originalname, { type: req.file.mimetype });
    let imageUpload = pinata.upload.public.file(imageFile);
    if (req.body.group) imageUpload = imageUpload.group(req.body.group);
    if (req.body.imageName) imageUpload = imageUpload.name(req.body.imageName);
    if (req.body.keyvalues) imageUpload = imageUpload.keyvalues(req.body.keyvalues);
    const imageResult = await imageUpload;
    res.json({
    success: true,
      imageCid: imageResult.cid,
      imageUrl: `${process.env.GATEWAY_URL}/ipfs/${imageResult.cid}`
    });
} catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Utility function to upload metadata JSON to IPFS (no file, just data)
async function uploadMetadataToIPFS(data) {
  // Limit metadata size
  if (JSON.stringify(data).length > 10 * 1024) {
    throw new Error('Metadata too large.');
  }

  let metadataUpload = pinata.upload.public.json(data);
  if (data.name) {
    metadataUpload = metadataUpload.name(data.name + '.json');
  }
  const metadataResult = await metadataUpload;
  return {
    success: true,
    metadataCid: metadataResult.cid,
    metadataUrl: `${import.meta.env.VITE_GATEWAY_URL}/ipfs/${metadataResult.cid}`,
    id: metadataResult.id
  };
}

// Get NFT metadata by CID
const getDataByCid = async (cid) => {
  try {
    return `${import.meta.env.VITE_GATEWAY_URL}/ipfs/${cid}`;
  } catch (error) {
    throw new Error('NFT not found');
  }
};

export {
  uploadImageToIPFS,
  uploadMetadataToIPFS,
  getDataByCid,
};