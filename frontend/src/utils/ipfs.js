import dotenv from 'dotenv';
dotenv.config();

import { PinataSDK } from 'pinata';
import { Blob, File } from 'buffer';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
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
    metadataUrl: `${process.env.GATEWAY_URL}/ipfs/${metadataResult.cid}`,
    id: metadataResult.id
  };
}

// Upload NFT metadata JSON to IPFS (no file)
const uploadDataToIPFS = async (req, res) => {
  try {
    const data = req.body;
    const result = await uploadMetadataToIPFS(data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get NFT metadata by CID
const getDataByCid = async (req, res) => {
  try {
    const { cid } = req.params;
    return `${process.env.GATEWAY_URL}/ipfs/${cid}`;
  } catch (error) {
    res.status(404).json({ success: false, message: 'NFT not found' });
  }
};

export {
  uploadImageToIPFS,
  uploadDataToIPFS,
  getDataByCid,
};