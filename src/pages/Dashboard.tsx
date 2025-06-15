import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface DrivingLicense {
  license_uploaded: boolean;
  license_name?: string;
  license_number?: string;
  license_valid_till?: string;
}

export const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [license, setLicense] = useState<DrivingLicense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [isLoadingLicense, setIsLoadingLicense] = useState(true);
  const navigate = useNavigate();

  const [licenseForm, setLicenseForm] = useState({
    name: '',
    license_number: '',
    valid_till: ''
  });

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

  const fetchLicense = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/driving-license', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch license');
      }
      
      setLicense(data);
    } catch (error) {
      console.error('Error fetching license:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch license');
    } finally {
      setIsLoadingLicense(false);
    }
  };

  const handleLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:5000/api/upload-license', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(licenseForm)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to upload license');
      }
      
      toast.success('License uploaded successfully');
      await fetchLicense();
      setLicenseForm({ name: '', license_number: '', valid_till: '' });
      setShowLicenseModal(false);
    } catch (error) {
      console.error('Error uploading license:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload license');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const admin = localStorage.getItem('is_admin') === 'true';
    setIsAdmin(admin);

    // Initial fetch
    fetchRequests();
    fetchLicense();

    // Set up polling every 5 seconds
    const interval = setInterval(() => {
      fetchRequests();
      fetchLicense();
    }, 5000);
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <div className="mt-6 md:mt-0 flex flex-col items-end gap-4">
                <Link
                  to="/request"
                  className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Emergency Request
                </Link>
                
                {!isLoadingLicense && license && !license.license_uploaded && (
                  <button
                    onClick={() => setShowLicenseModal(true)}
                    className="inline-flex items-center bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Verify Your Driving License
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* License Verification Modal */}
        {showLicenseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Verify Your Driving License</h3>
                <button
                  onClick={() => setShowLicenseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleLicenseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name on Driving License
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseForm.name}
                    onChange={(e) => setLicenseForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driving License Number
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseForm.license_number}
                    onChange={(e) => setLicenseForm(prev => ({ ...prev, license_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Till
                  </label>
                  <input
                    type="date"
                    required
                    value={licenseForm.valid_till}
                    onChange={(e) => setLicenseForm(prev => ({ ...prev, valid_till: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowLicenseModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit License'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                    <div className="text-gray-400 text-xs">{new Date(req.created_at).toLocaleString()}</div>
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