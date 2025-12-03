import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const AdminDashboardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('updated_at');
    const [filterStatus, setFilterStatus] = useState('');

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchDashboard();
        fetchIssues();
    }, [id, sortBy, filterStatus]);

    const fetchDashboard = async () => {
        try {
            const response = await axios.get(`${API_URL}/dashboards/${id}`);
            setDashboard(response.data.dashboard);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        }
    };

    const fetchIssues = async () => {
        try {
            const params = new URLSearchParams();
            params.append('dashboard_id', id);
            if (filterStatus) params.append('status', filterStatus);
            params.append('sort_by', sortBy);

            const response = await axios.get(`${API_URL}/issues?${params}`);
            setIssues(response.data.issues);
        } catch (error) {
            console.error('Error fetching issues:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-400';
            case 'in_progress':
                return 'bg-kra-red-500';
            case 'complete':
                return 'bg-kra-black-900';
            default:
                return 'bg-gray-400';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'in_progress':
                return 'In Progress';
            case 'complete':
                return 'Complete';
            default:
                return status;
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="px-4 py-6">
            <button
                onClick={() => navigate('/admin')}
                className="mb-4 text-kra-red-600 hover:text-kra-red-700 font-medium"
            >
                ← Back to Overview
            </button>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{dashboard?.dashboard_name}</h1>
                {dashboard?.description && (
                    <p className="text-gray-600 mt-2">{dashboard.description}</p>
                )}
                <div className="mt-2 text-sm text-gray-500">
                    Team: <span className="font-medium text-gray-900">{dashboard?.team_name || 'Unassigned'}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
                <div className="flex space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kra-red-500 focus:border-kra-red-500"
                        >
                            <option value="updated_at">Date Modified</option>
                            <option value="status">Status</option>
                            <option value="created_at">Date Created</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kra-red-500 focus:border-kra-red-500"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="complete">Complete</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Threads List */}
            <div className="space-y-4">
                {issues.map((issue) => (
                    <div key={issue.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(issue.status)}`}></div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {issue.subject || `Thread #${issue.id}`}
                                    </h3>
                                    {issue.chart_name && (
                                        <p className="text-sm text-gray-500">Chart: {issue.chart_name}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(issue.status)} text-white`}>
                                    {getStatusLabel(issue.status)}
                                </span>
                                {issue.second_count > 1 && (
                                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                        {issue.second_count} seconds
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-700 mb-3">{issue.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex space-x-4">
                                <span>By: {issue.submitted_by_name}</span>
                                <span>Updated: {format(new Date(issue.updated_at), 'MMM d, yyyy')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {issues.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                    No threads found for this dashboard.
                </div>
            )}
        </div>
    );
};

export default AdminDashboardDetail;
