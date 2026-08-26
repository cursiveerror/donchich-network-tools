# [Donchich Network Tools](https://donchich-nt.netlify.app/)

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Netlify](https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7)

A minimalist, client-server network utility application designed to provide quick insights into local and public network metrics. Built with Vanilla JavaScript on the frontend and Node.js serverless functions (Netlify Functions) on the backend.

## Features

### Dashboard
*   **Network Info:** Interfaces with the `navigator.connection` API to estimate connection type (e.g., 4G) and downlink bandwidth. Note that this API is hardware and browser dependent.
*   **Public Identity:** Retrieves the client's public IPv4 address and geographic location using the `ipwho.is` API, with an automatic fallback mechanism to `ipify.org` to handle rate limiting (HTTP 429).
*   **HTTP Ping:** Calculates network latency by measuring the round-trip time (RTT) of an HTTP request to a configurable target host.
*   **Speedtest:** Measures download bandwidth by fetching a predetermined binary payload (10MB, 50MB, or 100MB) from the edge CDN. The results can be dynamically displayed in Mbps, MB/s, Kbps, or Gbps.

### Tools
*   **Port Scanner:** A server-side utility that attempts TCP connections to a comma-separated list of ports on a specified host to determine their status (open/closed). Configurable connection timeout.
*   **DNS Lookup:** Performs DNS resolution queries against a provided domain name, returning A, MX, and TXT records.

### Settings
*   A persistent configuration module utilizing `localStorage`. Users can define custom ping targets, preferred measurement units, test payload sizes, port scanner timeouts, and toggle between Light, Dark, or System UI themes.

## Technology Stack

*   **Frontend:** HTML5, CSS3 (Custom Properties, Glassmorphism UI), Vanilla ES6 JavaScript.
*   **Backend:** Node.js (Netlify Functions).
*   **Dependencies:** Built-in Node modules (`net`, `dns.promises`). No external frameworks (e.g., React or Vue) are used.

## Architecture

The application is structured into two main layers:
1.  **Static Client:** The `index.html` and `tools.html` pages serve as the presentation layer. They manage state locally and interact with third-party APIs directly for stateless operations (like IP resolution).
2.  **Serverless API:** To bypass CORS restrictions and utilize low-level networking protocols (TCP sockets for port scanning, native DNS resolution), specific tasks are offloaded to Netlify Functions located in the `netlify/functions/` directory.

## Local Development

To run this project locally, you need an environment capable of serving both static files and simulating the Netlify Functions environment.

1.  Clone the repository.
2.  Install the Netlify CLI globally if you haven't already:
    ```bash
    npm install -g netlify-cli
    ```
3.  Start the local development server:
    ```bash
    netlify dev
    ```
    This command will serve the static files and spin up local endpoints for the functions at `/.netlify/functions/`.

## Note on Local Speedtesting

When running the application locally via localhost, the Speedtest feature will fetch the binary payloads directly from your local disk. This will result in artificially inflated metrics (e.g., >2000 Mbps) as it measures disk read speed and loopback interface throughput rather than actual external network bandwidth. To measure real internet speed, the application must be deployed to a remote server.
