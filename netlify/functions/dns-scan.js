const dns = require('dns').promises;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const domain = event.queryStringParameters.domain;

  if (!domain) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Domain is required" })
    };
  }

  try {
    const results = {};
    
    try {
      results.A = await dns.resolve(domain, 'A');
    } catch (e) {
      results.A = [];
    }
    
    try {
      results.MX = await dns.resolve(domain, 'MX');
    } catch (e) {
      results.MX = [];
    }
    
    try {
      results.TXT = await dns.resolve(domain, 'TXT');
    } catch (e) {
      results.TXT = [];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ domain, records: results })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to resolve DNS records", details: error.message })
    };
  }
};
