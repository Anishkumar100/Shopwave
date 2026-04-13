const dns = require('dns');

const clusterUrl = '_mongodb._tcp.ak.6hiiare.mongodb.net';

console.log("=== DEEP DNS DIAGNOSTICS ===");
console.log("Current Node DNS Servers:", dns.getServers());

// Test 1: Default OS Resolution
console.log(`\n[Test 1] Testing Default OS DNS routing...`);
dns.resolveSrv(clusterUrl, (err, addresses) => {
  if (err) {
    console.error('   ❌ FAILED:', err.code);
  } else {
    console.log('   ✅ SUCCESS! Found:', addresses[0].name);
  }

  // Test 2: Forced Google DNS Resolution
  console.log(`\n[Test 2] Forcing Node to use Google DNS (8.8.8.8)...`);
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log("   Servers successfully updated to:", dns.getServers());
    
    dns.resolveSrv(clusterUrl, (err2, addresses2) => {
      if (err2) {
        console.error('   ❌ FAILED:', err2.code);
        console.error('\n🚨 CONCLUSION: Even when forcing Google DNS, the connection was refused. Your router, antivirus (like Windows Defender/McAfee), or ISP is strictly blocking this request at the network layer.');
      } else {
        console.log('   ✅ SUCCESS! Found:', addresses2[0].name);
        console.log('\n🚨 CONCLUSION: Node.js was using a bad default DNS server (likely a virtual adapter like WSL or a VPN). Forcing Google DNS inside the code works.');
      }
    });
  } catch (error) {
    console.error("   ❌ Failed to set DNS servers:", error.message);
  }
});