// index.js
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { ethers } = require('ethers');
const { getNFTImageURL } = require('./utils');

// Load secrets
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const INFURA_API_KEY = process.env.INFURA_API_KEY;

// Setup Discord bot
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Connect to Ethereum
const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_API_KEY}`);

// Contract info
const contractAddress = '0x9492505633D74451bDF3079c09ccc979588Bc309';
const contractABI = [
  // Minimal ABI to capture Transfer events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Event listener
contract.on('Transfer', async (from, to, tokenId) => {
  // Ignore mints that aren't from the zero address
  if (from !== ethers.ZeroAddress) return;

  const channel = await client.channels.fetch(CHANNEL_ID);
  const imageUrl = getNFTImageURL(tokenId);

  const ethPrice = 0.0042; // Hardcode if constant; update if dynamic
  const message = `🟢 New Mint Detected!
Wallet: \`${to}\`
Token ID: \`${tokenId}\`
Cost: \`${ethPrice} ETH\`

${imageUrl}`;

  channel.send({ content: message });
});

client.login(DISCORD_TOKEN);
