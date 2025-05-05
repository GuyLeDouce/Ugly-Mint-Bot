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

// Multi-mint grouping
const pendingMints = new Map();

contract.on('Transfer', async (from, to, tokenId, event) => {
  if (from !== ethers.ZeroAddress) return;

  const txHash = event.transactionHash;
  const existing = pendingMints.get(txHash) || {
    wallet: to,
    tokenIds: [],
    timer: null,
  };

  existing.tokenIds.push(tokenId.toString());

  if (existing.timer) clearTimeout(existing.timer);

  existing.timer = setTimeout(async () => {
    pendingMints.delete(txHash);

    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      const count = existing.tokenIds.length;
      const ethPricePer = 0.007;
      const totalSpent = (ethPricePer * count).toFixed(4);

      const message = `🟢 **New Mint Detected!**
**Wallet:** \`${existing.wallet}\`
**Total NFTs:** \`${count}\`
**Total Spent:** \`${totalSpent} ETH\``;

      channel.send({ content: message });
    } catch (err) {
      console.error("❌ Error posting mint to Discord:", err);
    }
  }, 3000);

  pendingMints.set(txHash, existing);
});

// Manual !minttest command
client.on('messageCreate', async message => {
  if (message.content === '!minttest') {
    const fakeWallet = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';
    const fakeTokenIds = ['123', '124'];
    const ethPricePer = 0.007;
    const totalSpent = (ethPricePer * fakeTokenIds.length).toFixed(4);

    const testMsg = `🧪 **Mint Test Triggered!**
**Wallet:** \`${fakeWallet}\`
**Total NFTs:** \`${fakeTokenIds.length}\`
**Total Spent:** \`${totalSpent} ETH\``;

    message.channel.send({ content: testMsg });
  }

  // Simulate real multi-mint event
  if (message.content === '!simulate') {
    console.log("🔁 Simulating a real multi-mint event...");

    const fakeTxHash = '0xtesttxhash1234567890';
    const fakeWallet = '0xFAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKE';
    const ethPricePer = 0.007;

    const tokenIds = ['2001', '2002', '2003'];

    const existing = {
      wallet: fakeWallet,
      tokenIds: [...tokenIds],
      timer: null,
    };

    if (existing.timer) clearTimeout(existing.timer);

    existing.timer = setTimeout(async () => {
      pendingMints.delete(fakeTxHash);

      try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        const totalSpent = (ethPricePer * existing.tokenIds.length).toFixed(4);

        const messageContent = `🧪 **Simulated Multi-Mint!**
**Wallet:** \`${existing.wallet}\`
**Total NFTs:** \`${existing.tokenIds.length}\`
**Total Spent:** \`${totalSpent} ETH\``;

        channel.send({ content: messageContent });
      } catch (err) {
        console.error("❌ Error posting simulated mint:", err);
      }
    }, 3000);

    pendingMints.set(fakeTxHash, existing);
  }
});

// Login the bot
client.login(DISCORD_TOKEN);
