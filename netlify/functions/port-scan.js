const net = require('net');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const host = event.queryStringParameters.host;
  let ports = event.queryStringParameters.ports || "80,443";
  let timeout = parseInt(event.queryStringParameters.timeout) || 2;
  
  // Timeout in milliseconds
  timeout = timeout * 1000;

  if (!host) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Host is required" })
    };
  }

  const portArray = ports.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
  const open = [];
  const closed = [];

  const checkPort = (port) => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let status = 'closed';

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        status = 'open';
        socket.destroy();
      });

      socket.on('timeout', () => {
        status = 'closed';
        socket.destroy();
      });

      socket.on('error', (err) => {
        status = 'closed';
      });

      socket.on('close', () => {
        resolve({ port, status });
      });

      socket.connect(port, host);
    });
  };

  const results = await Promise.all(portArray.map(port => checkPort(port)));
  
  results.forEach(res => {
    if (res.status === 'open') {
      open.push(res.port);
    } else {
      closed.push(res.port);
    }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ host, open, closed })
  };
};
