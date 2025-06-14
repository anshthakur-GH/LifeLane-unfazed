import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:5000/api/emergency-requests/user', {
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
    const admin = localStorage.getItem('is_admin') === 'true';
    setIsAdmin(admin);

    // Initial fetch
    fetchRequests();

    // Set up polling every 5 seconds
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  // Summary counts
  const total = requests.length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const granted = requests.filter(r => r.status === 'granted').length;
  const dismissed = requests.filter(r => r.status === 'dismissed').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 inline-block align-middle" />;
      case 'granted':
        return <CheckCircle className="w-4 h-4 text-green-600 inline-block align-middle" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-red-600 inline-block align-middle" />;
      default:
        return null;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-header mb-2">
                Welcome back!
              </h1>
              <p className="text-gray-600">
                {isAdmin ? 'Manage all emergency requests' : 'Manage your emergency requests and track active transports'}
              </p>
            </div>
            {!isAdmin && (
              <Link
                to="/request"
                className="mt-6 md:mt-0 inline-flex items-center bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Emergency Request
              </Link>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Requests</h3>
            <p className="text-3xl font-bold text-header">{total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-600 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-green-600 mb-2">Granted</h3>
            <p className="text-3xl font-bold text-green-600">{granted}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Dismissed</h3>
            <p className="text-3xl font-bold text-red-600">{dismissed}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Recent Requests</h2>
          {requests.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-lg">No emergency requests found.</div>
          ) : (
            <div className="space-y-6">
              {requests.map((req: any) => (
                <div key={req.id} className="border rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg text-header capitalize">{req.patient_name}</span>
                      <span className={`ml-2 font-semibold ${getStatusColor(req.status)}`}>
                        {getStatusIcon(req.status)} {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-gray-600 mb-1">{req.problem_description}</div>
                    <div className="text-gray-500 text-sm mb-1">Age: {req.age}</div>
                    <div className="text-gray-400 text-xs">{new Date(req.date).toLocaleString()}</div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Link
                      to={`/status/${req.id}`}
                      className="inline-flex items-center bg-gray-100 text-header px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};