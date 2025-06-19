import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { Copy } from 'lucide-react';
import { API_URL } from '../config';

interface Request {
  id: string;
  patient_name: string;
  problem_description: string;
  age: number;
  status: 'pending' | 'granted' | 'dismissed';
  created_at: string;
  code?: string;
  granted_at?: string;
}

const RequestStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

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
        throw new Error('Failed to fetch request');
      }
      const data = await res.json();
      setRequest(data);
      setError(null);

      if (data.status === 'granted' && data.granted_at) {
        const grantedTime = new Date(data.granted_at).getTime();
        const now = Date.now();
        const diff = Math.max(0, 10 * 60 - Math.floor((now - grantedTime) / 1000));
        setTimeRemaining(diff);
      } else {
        setTimeRemaining(null);
      }

    } catch (err) {
      setError('Failed to load request status');
      console.error('Error fetching request:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError('No request ID provided');
      setLoading(false);
      return;
    }

    fetchRequest();
    const interval = setInterval(fetchRequest, 5000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [id]);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emergency mx-auto mb-4" />
          <p className="text-gray-600">Loading request status...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <FaTimesCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error || 'Request not found'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-emergency text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'text-green-500';
      case 'dismissed':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return <FaCheckCircle className="text-4xl text-green-500" />;
      case 'dismissed':
        return <FaTimesCircle className="text-4xl text-red-500" />;
      default:
        return <FaSpinner className="animate-spin text-4xl text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 py-8 px-2 sm:px-4 lg:px-6">
      <div className="max-w-3xl mx-auto w-full bg-white rounded-lg shadow-lg overflow-hidden p-6 flex flex-col">
        <div className="space-y-6 flex flex-col flex-grow">
          <div className="text-center flex-shrink-0 mb-2">
            {getStatusIcon(request.status)}
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Request Status: <span className={getStatusColor(request.status)}>{request.status}</span>
            </h2>
          </div>

          {request.status === 'granted' && request.code && timeRemaining !== null && timeRemaining > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-4 text-white text-center shadow-md">
              <h3 className="text-lg font-semibold mb-1">Your Siren Code</h3>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl font-bold font-mono tracking-wider">{request.code}</span>
                <button
                  onClick={() => copyToClipboard(request.code || '')}
                  className="bg-white bg-opacity-20 p-2 rounded-md hover:bg-opacity-30 transition-colors"
                  aria-label="Copy code to clipboard"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs opacity-90 mt-1">Share this code with traffic authorities if needed</p>
            </div>
          )}

          {request.status === 'granted' && timeRemaining !== null && timeRemaining > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center shadow-md">
              <h3 className="text-lg font-semibold text-yellow-800 mb-1">ETA</h3>
              <div className="text-4xl font-bold text-yellow-600 mb-1">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-yellow-700">Siren code is valid for 10 minutes from approval</p>
            </div>
          )}

          <div className="flex flex-col space-y-6 flex-grow">
            <div className="flex-grow min-h-0">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-x-4 md:gap-y-2">
                <div className="min-w-0 flex flex-col">
                  <p className="text-sm font-medium text-gray-500 flex-shrink-0">Name</p>
                  <p className="mt-0.5 text-base text-gray-900 font-semibold break-words overflow-hidden">{request.patient_name}</p>
                </div>
                <div className="min-w-0 flex flex-col">
                  <p className="text-sm font-medium text-gray-500 flex-shrink-0">Age</p>
                  <p className="mt-0.5 text-base text-gray-900 font-semibold">{request.age}</p>
                </div>
              </div>
            </div>

            <div className="flex-grow min-h-0">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Problem Description</h3>
              <p className="mt-1 text-base text-gray-900 leading-relaxed break-words overflow-hidden">{request.problem_description}</p>
            </div>

            <div className="flex-grow min-h-0">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Request Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-x-4 md:gap-y-2">
                <div className="min-w-0 flex flex-col">
                  <p className="text-sm font-medium text-gray-500 flex-shrink-0">Request ID</p>
                  <p className="mt-0.5 text-base text-gray-900 font-semibold">{request.id}</p>
                </div>
                <div className="min-w-0 flex flex-col">
                  <p className="text-sm font-medium text-gray-500 flex-shrink-0">Submitted On</p>
                  <p className="mt-0.5 text-base text-gray-900 font-semibold">
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center flex-shrink-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-emergency text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestStatus;