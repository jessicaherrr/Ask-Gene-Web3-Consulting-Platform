// contracts/scripts/deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Update environment variable in .env.local file
 * @param {string} content - Current file content
 * @param {string} key - Environment variable key
 * @param {string} value - Environment variable value
 * @returns {string} Updated file content
 */
function updateEnvVariable(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, "m");
  const newLine = `${key}=${value}`;
  
  if (regex.test(content)) {
    return content.replace(regex, newLine);
  } else {
    return content + (content.endsWith("\n") ? "" : "\n") + newLine + "\n";
  }
}

/**
 * Save contract addresses to JSON file for frontend access
 * @param {Object} contractsData - Contract addresses and metadata
 */
function saveContractAddresses(contractsData) {
  const rootDir = path.join(__dirname, "../..");
  
  // Save to public directory for frontend access
  const publicDir = path.join(rootDir, "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(publicDir, "contracts.json"),
    JSON.stringify(contractsData, null, 2)
  );
  
  console.log("✅ Contract addresses saved to: public/contracts.json");
}

/**
 * Update .env.local file with contract addresses
 * @param {Object} addresses - Contract addresses
 */
function updateEnvFile(addresses) {
  const envPath = path.join(__dirname, "../..", ".env.local");
  
  // Read existing .env.local or create empty string
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }
  
  // Update contract addresses
  envContent = updateEnvVariable(
    envContent,
    "NEXT_PUBLIC_CONSULTING_SESSION_ADDRESS",
    addresses.consultingSession
  );
  
  envContent = updateEnvVariable(
    envContent,
    "NEXT_PUBLIC_FEEDBACK_STORAGE_ADDRESS",
    addresses.feedbackStorage
  );
  
  // Write back to file
  fs.writeFileSync(envPath, envContent);
  console.log("✅ Contract addresses updated in: .env.local");
}

/**
 * Display deployment information
 * @param {Object} deploymentInfo - Deployment details
 */
function displayDeploymentInfo(deploymentInfo) {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  
  console.log("\n📋 Contract Addresses:");
  console.log("├─ ConsultingSession:", deploymentInfo.consultingSession);
  console.log("└─ FeedbackStorage:", deploymentInfo.feedbackStorage);
  
  console.log("\n📝 Network:", deploymentInfo.network);
  console.log("👤 Deployer:", deploymentInfo.deployer);
  console.log("💰 Deployer Balance:", deploymentInfo.deployerBalance, "MATIC");
  console.log("📅 Deployment Time:", deploymentInfo.deployedAt);
  
  console.log("\n" + "=".repeat(60));
  console.log("🔗 Verification Commands:");
  console.log("=".repeat(60));
  
  console.log("\nTo verify contracts on Polygonscan, run:");
  console.log(`npx hardhat verify --network polygonAmoy ${deploymentInfo.consultingSession} "${deploymentInfo.platformWallet}"`);
  console.log(`npx hardhat verify --network polygonAmoy ${deploymentInfo.feedbackStorage} "${deploymentInfo.consultingSession}"`);
  
  console.log("\n" + "=".repeat(60));
  console.log("🎯 Next Steps:");
  console.log("=".repeat(60));
  
  console.log("\n1. Restart your Next.js development server:");
  console.log("   npm run dev");
  
  console.log("\n2. Test contract interaction at:");
  console.log("   http://localhost:3000");
  
  console.log("\n3. View contracts on Polygonscan:");
  console.log(`   https://amoy.polygonscan.com/address/${deploymentInfo.consultingSession}`);
  console.log(`   https://amoy.polygonscan.com/address/${deploymentInfo.feedbackStorage}`);
  
  console.log("\n✅ Deployment successful! Happy building! 🚀");
}

/**
 * Main deployment function
 */
async function main() {
  console.log("🚀 Starting smart contract deployment...");
  console.log("=".repeat(60));
  
  // Get deployer information
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address;
  const deployerBalance = await ethers.provider.getBalance(deployerAddress);
  
  console.log("👤 Deployer Address:", deployerAddress);
  console.log("💰 Deployer Balance:", ethers.formatEther(deployerBalance), "MATIC");
  console.log("🌐 Network:", (await ethers.provider.getNetwork()).name);
  
  // Check if deployer has sufficient balance
  const minBalance = ethers.parseEther("0.05"); // 0.05 MATIC minimum
  if (deployerBalance < minBalance) {
    throw new Error(
      `Insufficient balance. Need at least ${ethers.formatEther(minBalance)} MATIC. ` +
      `Current balance: ${ethers.formatEther(deployerBalance)} MATIC`
    );
  }
  
  // ============================================
  // 1. DEPLOY CONSULTINGSESSION CONTRACT
  // ============================================
  console.log("\n" + "-".repeat(60));
  console.log("1. Deploying ConsultingSession contract...");
  
  const ConsultingSession = await ethers.getContractFactory("ConsultingSession");
  
  // Use deployer address as platform wallet (can be changed later)
  const platformWallet = deployerAddress;
  
  console.log("📝 Platform Wallet:", platformWallet);
  console.log("⏳ Deploying...");
  
  const consultingSession = await ConsultingSession.deploy(platformWallet);
  await consultingSession.waitForDeployment();
  const consultingSessionAddress = await consultingSession.getAddress();
  
  console.log("✅ ConsultingSession deployed to:", consultingSessionAddress);
  console.log("📊 Transaction:", consultingSession.deploymentTransaction().hash);
  
  // ============================================
  // 2. DEPLOY FEEDBACKSTORAGE CONTRACT
  // ============================================
  console.log("\n" + "-".repeat(60));
  console.log("2. Deploying FeedbackStorage contract...");
  
  const FeedbackStorage = await ethers.getContractFactory("FeedbackStorage");
  
  console.log("🔗 Linking to ConsultingSession:", consultingSessionAddress);
  console.log("⏳ Deploying...");
  
  const feedbackStorage = await FeedbackStorage.deploy(consultingSessionAddress);
  await feedbackStorage.waitForDeployment();
  const feedbackStorageAddress = await feedbackStorage.getAddress();
  
  console.log("✅ FeedbackStorage deployed to:", feedbackStorageAddress);
  console.log("📊 Transaction:", feedbackStorage.deploymentTransaction().hash);
  
  // ============================================
  // 3. TRANSFER OWNERSHIP
  // ============================================
  console.log("\n" + "-".repeat(60));
  console.log("3. Transferring ownership...");
  
  console.log("🔄 Transferring ConsultingSession ownership to FeedbackStorage...");
  const transferTx = await consultingSession.transferOwnership(feedbackStorageAddress);
  await transferTx.wait();
  
  console.log("✅ Ownership transferred successfully");
  console.log("📊 Transaction:", transferTx.hash);
  
  // Verify ownership transfer
  const newOwner = await consultingSession.owner();
  console.log("👑 New owner of ConsultingSession:", newOwner);
  
  if (newOwner.toLowerCase() !== feedbackStorageAddress.toLowerCase()) {
    throw new Error("Ownership transfer failed!");
  }
  
  // ============================================
  // 4. SAVE CONTRACT ADDRESSES
  // ============================================
  console.log("\n" + "-".repeat(60));
  console.log("4. Saving contract addresses...");
  
  const contractsData = {
    consultingSession: consultingSessionAddress,
    feedbackStorage: feedbackStorageAddress,
    platformWallet: platformWallet,
    network: "polygon-amoy",
    chainId: 80002,
    deployer: deployerAddress,
    deployerBalance: ethers.formatEther(deployerBalance),
    deployedAt: new Date().toISOString(),
    transactions: {
      consultingSession: consultingSession.deploymentTransaction().hash,
      feedbackStorage: feedbackStorage.deploymentTransaction().hash,
      ownershipTransfer: transferTx.hash,
    },
  };
  
  // Save addresses to JSON file
  saveContractAddresses(contractsData);
  
  // Update .env.local file
  updateEnvFile({
    consultingSession: consultingSessionAddress,
    feedbackStorage: feedbackStorageAddress,
  });
  
  // ============================================
  // 5. VERIFICATION INSTRUCTIONS
  // ============================================
  console.log("\n" + "-".repeat(60));
  console.log("5. Verification instructions...");
  
  displayDeploymentInfo({
    consultingSession: consultingSessionAddress,
    feedbackStorage: feedbackStorageAddress,
    platformWallet: platformWallet,
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployerAddress,
    deployerBalance: ethers.formatEther(deployerBalance),
    deployedAt: new Date().toLocaleString(),
  });
  
  return contractsData;
}

/**
 * Handle deployment errors
 */
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error("Error:", error.message);
    
    // Provide helpful error messages
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solution:");
      console.log("1. Get test MATIC from: https://faucet.polygon.technology/");
      console.log("2. Select 'Polygon Amoy' network");
      console.log("3. Enter your address:", process.env.PRIVATE_KEY ? 
        ethers.computeAddress(`0x${process.env.PRIVATE_KEY}`) : 
        "Configure PRIVATE_KEY in .env");
    } else if (error.message.includes("network")) {
      console.log("\n💡 Solution:");
      console.log("1. Check your RPC URL in .env.local");
      console.log("2. Ensure you're connected to Polygon Amoy testnet");
      console.log("3. Try: npm run deploy:local for local testing");
    }
    
    process.exit(1);
  });