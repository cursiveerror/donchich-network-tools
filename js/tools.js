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

// Tools Logic
document.getElementById('scanPortsBtn').addEventListener('click', async () => {
    const hostInput = document.getElementById('portHostInput');
    const portsInput = document.getElementById('portListInput');
    const resBox = document.getElementById('portResultBox');
    
    const host = hostInput.value.trim();
    const ports = portsInput.value.trim();
    
    if (!host) {
        alert("Please enter a target host");
        return;
    }
    
    resBox.classList.remove('d-none');
    resBox.textContent = 'Scanning...';
    
    try {
        const res = await fetch(`/.netlify/functions/port-scan?host=${encodeURIComponent(host)}&ports=${encodeURIComponent(ports)}&timeout=${settings.portTimeout}`);
        const data = await res.json();
        
        if (data.error) {
            resBox.textContent = `Error: ${data.error}`;
        } else {
            resBox.innerHTML = `<strong>Host:</strong> ${data.host}\n`;
            resBox.innerHTML += `<strong>Open Ports:</strong> ${data.open.length > 0 ? data.open.join(', ') : 'None'}\n`;
            resBox.innerHTML += `<strong>Closed Ports:</strong> ${data.closed.length > 0 ? data.closed.join(', ') : 'None'}`;
        }
    } catch (e) {
        resBox.textContent = 'Failed to connect to the backend API.';
    }
});

document.getElementById('scanDnsBtn').addEventListener('click', async () => {
    const hostInput = document.getElementById('dnsHostInput');
    const resBox = document.getElementById('dnsResultBox');
    
    const domain = hostInput.value.trim();
    
    if (!domain) {
        alert("Please enter a domain name");
        return;
    }
    
    resBox.classList.remove('d-none');
    resBox.textContent = 'Looking up...';
    
    try {
        const res = await fetch(`/.netlify/functions/dns-scan?domain=${encodeURIComponent(domain)}`);
        const data = await res.json();
        
        if (data.error) {
            resBox.textContent = `Error: ${data.error}`;
        } else {
            resBox.textContent = JSON.stringify(data.records, null, 2);
        }
    } catch (e) {
        resBox.textContent = 'Failed to connect to the backend API.';
    }
});

window.onload = () => {
    loadSettings();
};
