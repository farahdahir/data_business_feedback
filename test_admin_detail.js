const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAdminDashboardDetail() {
    try {
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@kra.go.ke',
            password: 'Admin123!'
        });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('Admin logged in.');

        // 2. Get a dashboard ID (using the progress endpoint we just built)
        const progressRes = await axios.get(`${API_URL}/dashboards/progress`, { headers });
        if (progressRes.data.progress.length === 0) {
            console.log('No dashboards found to test.');
            return;
        }
        const dashboardId = progressRes.data.progress[0].id;
        console.log(`Testing with Dashboard ID: ${dashboardId}`);

        // 3. Fetch Dashboard Details
        console.log('Fetching Dashboard Details...');
        const dashboardRes = await axios.get(`${API_URL}/dashboards/${dashboardId}`, { headers });
        if (dashboardRes.status === 200 && dashboardRes.data.dashboard) {
            console.log('Dashboard details fetched successfully.');
            console.log('Name:', dashboardRes.data.dashboard.dashboard_name);
        } else {
            console.error('Failed to fetch dashboard details.');
        }

        // 4. Fetch Issues for Dashboard
        console.log('Fetching Issues for Dashboard...');
        const issuesRes = await axios.get(`${API_URL}/issues?dashboard_id=${dashboardId}`, { headers });
        if (issuesRes.status === 200 && Array.isArray(issuesRes.data.issues)) {
            console.log(`Issues fetched successfully. Count: ${issuesRes.data.issues.length}`);
        } else {
            console.error('Failed to fetch issues.');
        }

    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
}

testAdminDashboardDetail();
