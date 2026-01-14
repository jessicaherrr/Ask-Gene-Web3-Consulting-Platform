// Polygon Amoy Testnet Configuration for MetaMask
const polygonAmoyConfig = {
  networkName: 'Polygon Amoy Testnet',
  rpcUrl: 'https://rpc-amoy.polygon.technology',
  chainId: '0x13882', // 80002 in decimal
  currencySymbol: 'MATIC',
  blockExplorerUrl: 'https://www.oklink.com/amoy',
  chainIdDecimal: 80002
};

// Steps to add to MetaMask:
// 1. Open MetaMask
// 2. Click network dropdown (top center)
// 3. Click "Add network"
// 4. Click "Add a network manually"
// 5. Enter the following details:
console.log('📋 Network Details for Manual Addition:');
console.log('Network name:', polygonAmoyConfig.networkName);
console.log('New RPC URL:', polygonAmoyConfig.rpcUrl);
console.log('Chain ID:', polygonAmoyConfig.chainId + ' (or ' + polygonAmoyConfig.chainIdDecimal + ' in decimal)');
console.log('Currency symbol:', polygonAmoyConfig.currencySymbol);
console.log('Block explorer URL:', polygonAmoyConfig.blockExplorerUrl);
