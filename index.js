require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { ethers } = require('ethers');
const { getNFTImageURL } = require('./utils');

// Load environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const INFURA_API_KEY = process.env.INFURA_API_KEY;

console.log("✅ Booting Ugly Mint Bot...");
console.log("📏 Using Discord token length:", DISCORD_TOKEN?.length || 'undefined');

// Setup Discord bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Setup Ethereum provider
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

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    const ethPrice = 0.0042;

    const message = `🟢 **New Mint Detected!**
**Wallet:** \`${to}\`
**Token ID:** \`${tokenId}\`
**Cost:** \`${ethPrice} ETH\``;

    channel.send({ content: message });
  } catch (err) {
    console.error("❌ Error posting mint to Discord:", err);
  }
});

// Test command: !minttest
client.on('messageCreate', async message => {
  if (message.content === '!minttest') {
    const fakeWallet = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';
    const fakeTokenId = 123;
    const ethPrice = 0.0042;

    const testMsg = `🧪 **Mint Test Triggered!**
**Wallet:** \`${fakeWallet}\`
**Token ID:** \`${fakeTokenId}\`
**Cost:** \`${ethPrice} ETH\``;

    message.channel.send({ content: testMsg });
  }
});

// Login the bot
client.login(DISCORD_TOKEN);

