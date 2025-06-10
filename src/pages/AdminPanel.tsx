import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:5000/api/emergency-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      
      // Sort requests by date (newest first)
      const sortedData = data.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setRequests(sortedData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
  };

  const handleGrant = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`http://localhost:5000/api/emergency-request/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'granted' }),
      });
      if (!res.ok) throw new Error('Failed to grant request');
      await fetchRequests(); // Refresh the list
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error granting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`http://localhost:5000/api/emergency-request/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'dismissed' }),
      });
      if (!res.ok) throw new Error('Failed to dismiss request');
      await fetchRequests(); // Refresh the list
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error dismissing request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'granted':
        return 'text-green-600';
      case 'dismissed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-bg-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-header mb-8">Admin Panel - Emergency Requests</h1>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-header mb-6">All Emergency Requests</h2>
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-lg">No emergency requests found.</div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg text-header">{request.patient_name}</span>
                      <span className={`ml-2 font-semibold ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{request.problem_description}</p>
                    <div className="text-sm text-gray-500">
                      <span>Age: {request.age}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(request.date).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="inline-flex items-center bg-gray-100 text-header px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={handleCloseDetails}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-header mb-4">Request Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Patient Information</h3>
                  <p className="text-gray-600">Name: {selectedRequest.patient_name}</p>
                  <p className="text-gray-600">Age: {selectedRequest.age}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Emergency Description</h3>
                  <p className="text-gray-600">{selectedRequest.problem_description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Request Details</h3>
                  <p className="text-gray-600">Status: {selectedRequest.status}</p>
                  <p className="text-gray-600">Date: {new Date(selectedRequest.date).toLocaleString()}</p>
                </div>
                {selectedRequest.status === 'granted' && selectedRequest.code && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-700">Activation Code</h3>
                    <p className="text-2xl font-mono text-green-600 mt-2">{selectedRequest.code}</p>
                  </div>
                )}
              </div>
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-4 mt-6">
                  <button
                    className="bg-success text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all flex-1"
                    onClick={() => handleGrant(selectedRequest.id)}
                    disabled={loading}
                  >
                    Grant & Issue Code
                  </button>
                  <button
                    className="bg-emergency text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all flex-1"
                    onClick={() => handleDismiss(selectedRequest.id)}
                    disabled={loading}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 