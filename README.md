# Network Device Scanner

A modern web application to discover and display all devices connected to your local network. Built with Node.js and Express.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

## Features

- **Real-time Network Discovery**: Scan your local network to find all connected devices
- **Beautiful Modern UI**: Clean, responsive design with gradient styling
- **Network Information**: Display your IP address, MAC address, and network interface details
- **Device Details**: Shows IP address and MAC address for each discovered device
- **Cross-Platform**: Works on macOS, Linux, and Windows
- **Fast Scanning**: Uses ARP table and ping sweep for quick device discovery

## Screenshots

The app features a modern gradient design with:
- Network information card showing your connection details
- One-click network scanning
- Device list with IP and MAC addresses
- Responsive layout for desktop and mobile

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14.0.0 or higher)
- npm (comes with Node.js)

## Installation

1. **Clone or download this repository:**
   ```bash
   git clone <repository-url>
   cd network-device-scanner
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

1. **View Your Network Info**: The app automatically displays your network interface details (IP, MAC, netmask)

2. **Scan for Devices**: Click the "Scan Network" button to discover all devices connected to your router

3. **View Results**: Connected devices will appear in the list with their IP and MAC addresses

4. **Refresh**: Click "Refresh" to reload the page and clear results

## How It Works

The scanner uses two methods to discover devices:

1. **Ping Sweep**: Pings IP addresses in your subnet to trigger ARP requests
2. **ARP Table Parsing**: Reads the system's ARP cache to find device MAC addresses

This approach is fast and doesn't require special permissions or external tools.

## API Endpoints

- `GET /api/network-info` - Returns your network interface information
- `GET /api/devices` - Scans and returns all connected devices

## Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| macOS    | ✅ Full | Uses `arp -a` command |
| Linux    | ✅ Full | Uses `arp -a` or `ip neigh` |
| Windows  | ✅ Full | Uses `arp -a` command |

## Development

To run in development mode with auto-restart:

```bash
npm run dev
```

## Troubleshooting

### No devices found
- Some devices may not respond to ping requests
- Try accessing the device (e.g., open a webpage) before scanning to populate the ARP table
- Ensure you're connected to the same network as the devices you want to discover

### Permission errors
- On some systems, you may need elevated permissions to access the ARP table
- Try running with `sudo` (macOS/Linux) or as Administrator (Windows)

### Slow scanning
- The scanner pings the first 50 IP addresses in your subnet
- This is intentionally limited to keep scanning fast
- Modify the `pingSweep` function in `server.js` to scan more addresses if needed

## Security Notes

- This tool only scans your **local network** (same subnet)
- It uses standard system commands (`arp`, `ping`) that don't require special network permissions
- No data is sent to external servers - everything stays local

## Technical Details

### Built With
- **Backend**: Node.js, Express
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Network**: System ARP commands, ICMP ping

### File Structure
```
.
├── package.json      # Project dependencies
├── server.js         # Express server and API
└── public/
    └── index.html    # Frontend UI
```

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## Acknowledgments

- Icons inspired by Feather Icons
- Color scheme based on modern gradient trends
