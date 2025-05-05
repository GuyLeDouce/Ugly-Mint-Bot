require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { ethers } = require('ethers');
const { getNFTImageURL } = require('./utils');

// Load environment variables from .env or Railway Variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const INFURA_API_KEY = process.env.INFURA_API_KEY; // full URL, not just project ID

// Print debug info
console.log("✅ Booting Ugly Mint Bot...");
console.log("📏 Using Discord token length:", DISCORD_TOKEN?.length || 'undefined');

// Setup Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Setup Ethereum provider using full Infura URL
const provider = new ethers.JsonRpcProvider(INFURA_API_KEY);

// Contract info
const contractAddress = '0x9492505633D74451bDF3079c09ccc979588Bc309';
const contractABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// When bot is ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Listen for mint events (Transfer from zero address)
contract.on('Transfer', async (from, to, tokenId) => {
  if (from !== ethers.ZeroAddress) return;

  const channel = await client.channels.fetch(CHANNEL_ID);
  const ethPrice = 0.0042; // update if your mint price changes
  const imageUrl = getNFTImageURL(tokenId);

  const message = `🟢 **New Mint Detected!**
**Wallet:** \`${to}\`
**Token ID:** \`${tokenId

