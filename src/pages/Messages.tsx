import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Mail, CheckCircle } from 'lucide-react';

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError('Failed to load messages. Please try again later.');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/messages/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }

      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, is_read: true } : msg
      ));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, is_read: true });
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/adminpanel')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Return to Admin Panel
        </button>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-bg-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-header">Contact Messages</h1>
          <button
            onClick={() => navigate('/adminpanel')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Admin Panel
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-header mb-6">All Messages</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Messages List */}
            <div className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center">No messages found.</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedMessage?.id === message.id
                        ? 'border-primary bg-primary/5'
                        : message.is_read
                        ? 'border-gray-200 bg-white'
                        : 'border-primary/50 bg-primary/5'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{message.name}</h3>
                        <p className="text-sm text-gray-600">{message.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        {!message.is_read && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Details */}
            {selectedMessage && (
              <div className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedMessage.name}</h3>
                    <p className="text-gray-600">{selectedMessage.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {format(new Date(selectedMessage.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
                {!selectedMessage.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(selectedMessage.id)}
                    className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-all"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Mark as Read
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages; 