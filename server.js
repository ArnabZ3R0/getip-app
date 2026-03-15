const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Get local network info
function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const networks = [];

  for (const [name, iface] of Object.entries(interfaces)) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        networks.push({
          interface: name,
          ip: addr.address,
          netmask: addr.netmask,
          mac: addr.mac
        });
      }
    }
  }
  return networks;
}

// Parse ARP table to get devices
function parseArpTable(output) {
  const devices = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // Match patterns for different OS
    // macOS/Linux: ? (192.168.1.1) at ab:cd:ef:12:34:56 on en0
    // Windows: 192.168.1.1 ab-cd-ef-12-34-56 dynamic
    const macMatch = line.match(/(?:[0-9a-f]{1,2}[:-]){5}[0-9a-f]{1,2}/i);
    const ipMatch = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);

    if (macMatch && ipMatch) {
      devices.push({
        ip: ipMatch[1],
        mac: macMatch[0].toLowerCase(),
        status: 'Connected'
      });
    }
  }

  return devices;
}

// Get ARP table based on OS
function getArpTable() {
  return new Promise((resolve, reject) => {
    const platform = os.platform();
    let command;

    if (platform === 'darwin') {
      command = 'arp -a';
    } else if (platform === 'linux') {
      command = 'arp -a || ip neigh';
    } else if (platform === 'win32') {
      command = 'arp -a';
    } else {
      reject(new Error('Unsupported platform'));
      return;
    }

    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error && !stdout) {
        reject(error);
        return;
      }
      resolve(parseArpTable(stdout));
    });
  });
}

// Ping sweep to discover devices
function pingSweep(subnet) {
  return new Promise((resolve) => {
    const promises = [];
    const baseIp = subnet.substring(0, subnet.lastIndexOf('.') + 1);

    // Ping first 50 addresses
    for (let i = 1; i <= 50; i++) {
      const ip = baseIp + i;
      promises.push(
        new Promise((res) => {
          const cmd = os.platform() === 'win32'
            ? `ping -n 1 -w 1000 ${ip}`
            : `ping -c 1 -W 1 ${ip}`;

          exec(cmd, { timeout: 5000 }, () => res());
        })
      );
    }

    Promise.all(promises).then(() => resolve());
  });
}

// API Routes
app.get('/api/network-info', (req, res) => {
  res.json(getNetworkInfo());
});

app.get('/api/devices', async (req, res) => {
  try {
    // Try to refresh ARP table by pinging network
    const networks = getNetworkInfo();
    if (networks.length > 0) {
      const subnet = networks[0].ip;
      await pingSweep(subnet);
    }

    // Get ARP table
    const devices = await getArpTable();

    // Remove duplicates
    const uniqueDevices = devices.filter((device, index, self) =>
      index === self.findIndex(d => d.ip === device.ip)
    );

    res.json({
      success: true,
      devices: uniqueDevices,
      count: uniqueDevices.length,
      network: networks[0] || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Network interfaces:');
  getNetworkInfo().forEach(n => {
    console.log(`  ${n.interface}: ${n.ip}`);
  });
});
