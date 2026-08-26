// Default Settings
const defaultSettings = {
    speedUnit: 'Mbps',
    payloadSize: '10',
    pingHost: 'google.com',
    portTimeout: '2',
    theme: 'system'
};

let settings = { ...defaultSettings };

function loadSettings() {
    const saved = localStorage.getItem('donchich_settings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
    }
    applyTheme(settings.theme);
}

function saveSettings() {
    settings.speedUnit = document.getElementById('settingSpeedUnit').value;
    settings.payloadSize = document.getElementById('settingPayloadSize').value;
    settings.pingHost = document.getElementById('settingPingHost').value || 'google.com';
    settings.portTimeout = document.getElementById('settingPortTimeout').value;
    settings.theme = document.getElementById('settingTheme').value;
    
    localStorage.setItem('donchich_settings', JSON.stringify(settings));
    applyTheme(settings.theme);
    
    // Update UI elements dependent on settings
    document.getElementById('pingHostLabel').textContent = settings.pingHost;
}

function populateSettingsUI() {
    document.getElementById('settingSpeedUnit').value = settings.speedUnit;
    document.getElementById('settingPayloadSize').value = settings.payloadSize;
    document.getElementById('settingPingHost').value = settings.pingHost;
    document.getElementById('settingPortTimeout').value = settings.portTimeout;
    document.getElementById('portTimeoutValDisplay').textContent = settings.portTimeout + 's';
    document.getElementById('settingTheme').value = settings.theme;
}

function applyTheme(theme) {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Modal Logic
const modal = document.getElementById('settingsModal');
document.getElementById('openSettingsBtn').addEventListener('click', () => {
    populateSettingsUI();
    modal.classList.add('active');
});
document.getElementById('closeSettingsBtn').addEventListener('click', () => modal.classList.remove('active'));
document.getElementById('cancelSettingsBtn').addEventListener('click', () => modal.classList.remove('active'));
document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    saveSettings();
    modal.classList.remove('active');
});
document.getElementById('settingPortTimeout').addEventListener('input', (e) => {
    document.getElementById('portTimeoutValDisplay').textContent = e.target.value + 's';
});

// Network Info
function updateNetworkInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
        const type = conn.effectiveType ? conn.effectiveType.toUpperCase() : 'Unknown';
        const downlink = conn.downlink ? `${conn.downlink} Mbps` : 'Unknown';
        document.getElementById('netTypeVal').textContent = type;
        document.getElementById('netBandwidthVal').textContent = downlink;
    } else {
        document.getElementById('netTypeVal').textContent = 'Unknown (Ethernet?)';
        document.getElementById('netBandwidthVal').textContent = 'API Not Supported';
    }
}

// Public IP & Location
async function fetchIpAndLocation() {
    try {
        const res = await fetch('https://ipwho.is/');
        if (res.status === 429) throw new Error("Rate limited");
        const data = await res.json();
        
        if (data.success) {
            document.getElementById('ipAddressVal').textContent = data.ip;
            document.getElementById('ipLocationVal').textContent = `${data.city}, ${data.country} (${data.connection.isp})`;
            return;
        } else {
            throw new Error("Failed to load");
        }
    } catch (e) {
        // Fallback 1: ipapi.co
        try {
            const res2 = await fetch('https://ipapi.co/json/');
            if (res2.status === 429) throw new Error("Rate limited");
            const data2 = await res2.json();
            
            if (data2.ip) {
                document.getElementById('ipAddressVal').textContent = data2.ip;
                document.getElementById('ipLocationVal').textContent = `${data2.city}, ${data2.country_name} (${data2.org})`;
                return;
            }
        } catch (e2) {
            // Fallback 2: just ipify for IP
            try {
                const fbRes = await fetch('https://api.ipify.org?format=json');
                const fbData = await fbRes.json();
                document.getElementById('ipAddressVal').textContent = fbData.ip;
                document.getElementById('ipLocationVal').textContent = "Location unavailable (Rate limited)";
            } catch (err) {
                document.getElementById('ipAddressVal').textContent = "Error";
                document.getElementById('ipLocationVal').textContent = "Could not fetch IP";
            }
        }
    }
}

document.getElementById('copyIpBtn').addEventListener('click', () => {
    const ip = document.getElementById('ipAddressVal').textContent;
    if (ip && ip !== 'Loading...' && ip !== 'Error') {
        navigator.clipboard.writeText(ip);
        const btn = document.getElementById('copyIpBtn');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy IP', 2000);
    }
});

// HTTP Ping
document.getElementById('pingBtn').addEventListener('click', async () => {
    const host = settings.pingHost;
    let url = host.startsWith('http') ? host : `https://${host}`;
    const valEl = document.getElementById('pingVal');
    valEl.textContent = 'Pinging...';
    
    const start = performance.now();
    try {
        await fetch(url, { mode: 'no-cors', cache: 'no-cache' });
        const end = performance.now();
        valEl.textContent = `${Math.round(end - start)} ms`;
    } catch (e) {
        valEl.textContent = 'Error';
    }
});

// Speedtest
document.getElementById('speedtestBtn').addEventListener('click', async () => {
    const btn = document.getElementById('speedtestBtn');
    const status = document.getElementById('speedtestStatus');
    const valEl = document.getElementById('speedVal');
    const unitEl = document.getElementById('speedUnitVal');
    
    btn.disabled = true;
    status.textContent = 'Downloading...';
    valEl.textContent = '--';
    unitEl.textContent = settings.speedUnit;
    
    const filename = `${settings.payloadSize}mb.bin`;
    const url = `public/${filename}?t=${new Date().getTime()}`;
    
    const start = performance.now();
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network error');
        
        // Read response to make sure it's fully downloaded
        const reader = res.body.getReader();
        let received = 0;
        
        while(true) {
            const {done, value} = await reader.read();
            if (done) break;
            received += value.length;
        }
        
        const end = performance.now();
        const durationSec = (end - start) / 1000;
        
        // Calculate speed
        let speed = 0;
        const bytes = received;
        const bits = bytes * 8;
        
        if (settings.speedUnit === 'Mbps') {
            speed = (bits / 1000000) / durationSec;
        } else if (settings.speedUnit === 'MB/s') {
            speed = (bytes / 1048576) / durationSec;
        } else if (settings.speedUnit === 'Kbps') {
            speed = (bits / 1000) / durationSec;
        } else if (settings.speedUnit === 'Gbps') {
            speed = (bits / 1000000000) / durationSec;
        }
        
        valEl.textContent = speed.toFixed(2);
        status.textContent = 'Complete';
    } catch (e) {
        valEl.textContent = 'Error';
        status.textContent = 'Failed to download';
    }
    
    btn.disabled = false;
});

// Init
window.onload = () => {
    loadSettings();
    document.getElementById('pingHostLabel').textContent = settings.pingHost;
    document.getElementById('speedUnitVal').textContent = settings.speedUnit;
    
    updateNetworkInfo();
    if(navigator.connection) {
        navigator.connection.addEventListener('change', updateNetworkInfo);
    }
    
    fetchIpAndLocation();
};
