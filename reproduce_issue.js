const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const BUSINESS_EMAIL = 'b_user10@kra.go.ke';
const BUSINESS_PASSWORD = 'B_user10@kra.go.ke';
const ADMIN_EMAIL = 'admin@kra.go.ke';
const ADMIN_PASSWORD = 'Admin123!';

async function run() {
    try {
        // 1. Login as Admin to get a dashboard ID
        console.log('Logging in as Admin...');
        const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const adminToken = adminLoginRes.data.token;
        const adminHeaders = { Authorization: `Bearer ${adminToken}` };

        // Fetch dashboards
        console.log('Fetching dashboards...');
        // Admin likely has an endpoint to list dashboards.
        // Try /dashboards or /admin/dashboards
        // Looking at routes (I haven't seen dashboards.js yet, but likely exists)
        // Let's try GET /dashboards
        let dashboardId;
        try {
            const dashRes = await axios.get(`${API_URL}/dashboards`, { headers: adminHeaders });
            // Response structure might be { dashboards: [...] }
            const dashboards = dashRes.data.dashboards || dashRes.data;
            if (dashboards.length > 0) {
                dashboardId = dashboards[0].id;
                console.log('Found Dashboard ID:', dashboardId);
            } else {
                console.error('No dashboards found.');
                return;
            }
        } catch (e) {
            console.error('Failed to fetch dashboards:', e.message);
            // Fallback: try to create one if possible, or just fail
            return;
        }

        // 2. Login as Business User
        console.log('Logging in as Business User...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: BUSINESS_EMAIL,
            password: BUSINESS_PASSWORD
        });
        const token = loginRes.data.token;
        const user = loginRes.data.user;
        console.log('Logged in as:', user.email, 'ID:', user.id, 'Type:', typeof user.id);

        const headers = { Authorization: `Bearer ${token}` };

        // 3. Create a thread
        console.log('Creating thread...');
        const threadRes = await axios.post(`${API_URL}/issues`, {
            dashboard_id: dashboardId,
            description: 'Test thread for self-seconding',
            subject: 'Self Second Test'
        }, { headers });

        const issueId = threadRes.data.issue.id;
        const submittedBy = threadRes.data.issue.submitted_by_user_id;
        console.log('Created thread ID:', issueId, 'Submitted By:', submittedBy, 'Type:', typeof submittedBy);

        // 4. Try to second the thread
        console.log('Attempting to second the thread...');
        try {
            await axios.post(`${API_URL}/issues/${issueId}/second`, {}, { headers });
            console.log('SUCCESS: Thread seconded (unexpectedly!)');
        } catch (error) {
            console.log('EXPECTED ERROR:', error.response ? error.response.data : error.message);
        }

        // 5. Cleanup
        console.log('Cleaning up...');
        await axios.delete(`${API_URL}/issues/${issueId}`, { headers });
        console.log('Thread deleted.');

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

run();
