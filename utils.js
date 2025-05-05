// utils.js
function getNFTImageURL(tokenId) {
  return `https://ipfs.io/ipfs/bafybeie5o7afc4yxyv3xx4jhfjzqugjwl25wuauwn3554jrp26mlcmprhe/${tokenId}.jpg`;
}

module.exports = {
  getNFTImageURL,
};
