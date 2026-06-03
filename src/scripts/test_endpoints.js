const BASE_URL = 'http://localhost:3123/api';

const test = async () => {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'kravionatech@gmail.com',
        password: 'Asdf@123'
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData?.token?.accessToken;
    console.log('Login successful. Token acquired:', !!token);

    const headers = { Authorization: `Bearer ${token}` };

    const endpoints = [
      { label: '/admin/leads/stats', url: `${BASE_URL}/admin/leads/stats`, headers },
      { label: '/admin/messages', url: `${BASE_URL}/admin/messages?limit=6&sort=createdAt&order=desc`, headers },
      { label: '/posts', url: `${BASE_URL}/posts?limit=5&sort=views&order=desc` },
      { label: '/subscribers', url: `${BASE_URL}/subscribers?limit=1`, headers },
      { label: '/v1/public/portfolio', url: `${BASE_URL}/v1/public/portfolio?limit=1` },
      { label: '/admin/notifications', url: `${BASE_URL}/admin/notifications?unread=true&limit=1`, headers },
      { label: '/v1/public/site-config', url: `${BASE_URL}/v1/public/site-config` }
    ];

    for (const ep of endpoints) {
      try {
        const start = Date.now();
        const res = await fetch(ep.url, { headers: ep.headers });
        const text = await res.text();
        let errMsg = '';
        if (res.status >= 400) {
          try {
            errMsg = JSON.parse(text).message || text;
          } catch {
            errMsg = text;
          }
        }
        if (res.status >= 400) {
          console.log(`❌ [${res.status}] ${ep.label} - Error: ${errMsg}`);
        } else {
          console.log(`✅ [${res.status}] ${ep.label} (${Date.now() - start}ms)`);
        }
      } catch (err) {
        console.log(`❌ [ERR] ${ep.label} - Error: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('Fatal test error:', err.message);
  }
};

test();
