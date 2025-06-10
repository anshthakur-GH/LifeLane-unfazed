import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, FileText, AlertCircle } from 'lucide-react';

export const EmergencyRequestForm: React.FC = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    problemDescription: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    } else {
      setImage(null);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioURL(URL.createObjectURL(audioBlob));
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied or not available.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('/api/emergency-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_name: formData.patientName,
          age: formData.age,
          problem_description: formData.problemDescription
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.id) {
        // Navigate to status page with the request ID
        navigate(`/status/${data.id}`);
      } else {
        setError(data.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-bg-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-8">
            <div className="bg-emergency bg-opacity-10 p-3 rounded-lg mr-4">
              <AlertCircle className="w-8 h-8 text-emergency" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-header">Emergency Request</h1>
              <p className="text-gray-600">Please provide accurate information for immediate assistance</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-header mb-3">
                  Patient Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter patient's full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-header mb-3">
                  Age *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter patient's age"
                    min="1"
                    max="120"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-header mb-3">
                Emergency Detail *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="Describe the emergency situation, symptoms, and any relevant medical information..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-header mb-3">
                Upload Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
              />
              {image && (
                <div className="mt-2 text-sm text-gray-600">Selected: {image.name}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-header mb-3">
                Record Audio (optional)
              </label>
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-all"
                  >
                    Start Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="bg-emergency text-white px-4 py-2 rounded-xl font-semibold hover:bg-emergency/90 transition-all"
                  >
                    Stop Recording
                  </button>
                )}
                {audioURL && (
                  <audio controls src={audioURL} className="ml-4">
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
              {audioBlob && !isRecording && (
                <div className="mt-2 text-sm text-gray-600">Audio recorded and ready to submit.</div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Important Notice</h4>
                  <p className="text-sm text-yellow-700">
                    This is for emergency medical transport coordination. For life-threatening emergencies, 
                    please call 112 immediately. Our service complements but does not replace emergency services.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-100 text-header py-3 px-6 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-emergency text-white py-3 px-6 rounded-xl font-semibold text-center hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Emergency Request'}
              </button>
            </div>
            {error && <div className="text-red-600 text-center mt-4">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};