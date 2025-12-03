const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@kra.go.ke';
const ADMIN_PASSWORD = 'Admin123!';

async function run() {
    try {
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test GET /dashboards/progress without filters
        console.log('Testing /dashboards/progress (no filters)...');
        const res1 = await axios.get(`${API_URL}/dashboards/progress`, { headers });
        console.log('Total dashboards:', res1.data.progress.length);
        if (res1.data.progress.length > 0) {
            console.log('Sample dashboard:', res1.data.progress[0].name, 'Team:', res1.data.progress[0].team);
        }

        // 3. Test Search Filter
        const searchTerm = 'Feedback'; // Assuming there's a dashboard with "Feedback" or similar
        console.log(`Testing Search Filter: "${searchTerm}"...`);
        const res2 = await axios.get(`${API_URL}/dashboards/progress?search=${searchTerm}`, { headers });
        console.log(`Found ${res2.data.progress.length} dashboards matching "${searchTerm}"`);

        // 4. Test Sort
        console.log('Testing Sort by Name...');
        const res3 = await axios.get(`${API_URL}/dashboards/progress?sort_by=dashboard_name`, { headers });
        if (res3.data.progress.length > 1) {
            const first = res3.data.progress[0].name;
            const second = res3.data.progress[1].name;
            console.log(`First: ${first}, Second: ${second}`);
            if (first.localeCompare(second) <= 0) {
                console.log('Sort seems correct (A-Z)');
            } else {
                console.error('Sort might be incorrect');
            }
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

run();
