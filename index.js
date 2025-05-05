require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { ethers } = require('ethers');
const { getNFTImageURL } = require('./utils');

// Load environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const INFURA_API_KEY = process.env.INFURA_API_KEY;

// Setup Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Setup Ethereum provider
const provider = new ethers.JsonRpcProvider(INFURA_API_KEY);

// Contract info
const contractAddress = '0x9492505633D74451bDF3079c09ccc979588Bc309';
const contractABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// When Discord bot is ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Watch for mint events
contract.on('Transfer', async (from, to, tokenId) => {
  if (from !== ethers.ZeroAddress) return; // Ignore transfers that aren't mints

  const channel = await client.channels.fetch(CHANNEL_ID);

  const ethPrice = 0.0042; // update if mint price changes
  const imageUrl = getNFTImageURL(tokenId);

  const message = `🟢 **New Mint Detected!**
**Wallet:** \`${to}\`
**Token ID:** \`${tokenId}\`
**Cost:** \`${ethPrice} ETH\`

📸 ${imageUrl}`;

  channel.send({ content: message });
});

// Listen for !minttest command
client.on('messageCreate', async message => {
  if (message.content === '!minttest') {
    const fakeWallet = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';
    const fakeTokenId = 123;
    const ethPrice = 0.0042;
    const imageUrl = getNFTImageURL(fakeTokenId);

    const testMsg = `🧪 **Mint Test Triggered!**
**Wallet:** \`${fakeWallet}\`
**Token ID:** \`${fakeTokenId}\`
**Cost:** \`${ethPrice} ETH\`

📸 ${imageUrl}`;

    message.channel.send({ content: testMsg });
  }
});

client.login(DISCORD_TOKEN);
