import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { API_URL } from '../config';

export const Status: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`${API_URL}/api/emergency-requests/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error('Request not found');
        }
        const data = await res.json();
        setRequest(data);
        if (data.status === 'granted' && data.granted_at) {
          const grantedTime = new Date(data.granted_at).getTime();
          const now = Date.now();
          const diff = Math.max(0, 10 * 60 - Math.floor((now - grantedTime) / 1000));
          setTimeRemaining(diff);
        } else {
          setTimeRemaining(null);
        }
      } catch (err) {
        setError('Failed to fetch request status');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
    const interval = setInterval(fetchRequest, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [id, navigate]);

  useEffect(() => {
    if (timeRemaining === null) return;
    if (timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

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
              <h2 className="text-lg font-semibold text-gray-700">Hospital Information</h2>
              <p className="text-gray-600">Hospital: {request.hospital_name}</p>
              <p className="text-gray-600">Location: {request.hospital_location}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700">Emergency Description</h2>
              <p className="mt-2 text-gray-600">{request.problem_description}</p>
            </div>

            {request.status === 'granted' && request.code && timeRemaining !== null && timeRemaining > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-green-700">Activation Code</h2>
                <p className="mt-2 text-2xl font-mono text-green-600">{request.code}</p>
                <p className="mt-2 text-sm text-green-600">
                  Use this code to activate your siren device. This code is valid for one-time use only.
                </p>
              </div>
            )}
            {request.status === 'granted' && timeRemaining !== null && timeRemaining > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-700">Time Remaining</h2>
                <p className="text-2xl font-mono text-yellow-600">{formatTime(timeRemaining)}</p>
                <p className="text-sm text-yellow-700">Siren code is valid for 10 minutes from approval</p>
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