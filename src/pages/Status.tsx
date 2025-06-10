import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const Status: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/emergency-request/${id}`);
        if (!res.ok) {
          throw new Error('Request not found');
        }
        const data = await res.json();
        setRequest(data);
      } catch (err) {
        setError('Failed to fetch request status');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
    const interval = setInterval(fetchRequest, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'granted':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'dismissed':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'granted':
        return 'text-green-500';
      case 'dismissed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading request status...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="pt-16 min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">{error || 'Request not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-bg-light">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            {getStatusIcon(request.status)}
            <h1 className="text-2xl font-bold text-header mt-4">
              Request Status: <span className={getStatusColor(request.status)}>{request.status}</span>
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Patient Details</h2>
              <p className="mt-2 text-gray-600">Name: {request.patient_name}</p>
              <p className="text-gray-600">Age: {request.age}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700">Emergency Description</h2>
              <p className="mt-2 text-gray-600">{request.problem_description}</p>
            </div>

            {request.status === 'granted' && request.code && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-green-700">Activation Code</h2>
                <p className="mt-2 text-2xl font-mono text-green-600">{request.code}</p>
                <p className="mt-2 text-sm text-green-600">
                  Use this code to activate your siren device. This code is valid for one-time use only.
                </p>
              </div>
            )}

            {request.status === 'dismissed' && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-red-700">Request Dismissed</h2>
                <p className="mt-2 text-red-600">
                  Your request has been dismissed. Please contact support for more information.
                </p>
              </div>
            )}

            <div className="pt-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 