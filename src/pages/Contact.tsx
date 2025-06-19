import React, { useState } from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitted(true);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-header text-center mb-12">
          Contact Support
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-header mb-4">
              Need help, have questions, or want to report an issue?
            </h2>
            <p className="text-gray-600 mb-8">
              We're here for you 24/7.
            </p>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-header mb-4 flex items-center">
                <Phone className="w-6 h-6 mr-2 text-primary" />
                Phone Support
              </h3>
              <p className="text-gray-600 mb-4">
                Reach out to our emergency response or support team:
              </p>
              <div className="space-y-2 pl-2">
                <p className="text-gray-800">+91 73938 00862</p>
                <p className="text-gray-800">+91 83683 12681</p>
                <p className="text-gray-800">+91 96502 75609</p>
                <p className="text-gray-800">+91 79824 04800</p>
              </div>
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Available 24/7 for urgent and support-related queries
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-header mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-primary" />
                Email Support
              </h3>
              <p className="text-gray-600 mb-4">
                For feedback, queries, or technical help:
              </p>
              <div className="space-y-2 pl-2">
                <p className="text-gray-800">lifelanesupport@gmail.com</p>
                <p className="text-gray-800">unfazed.services@gmail.com</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                We usually respond within a few hours.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-header mb-6">
              Send us a Message
            </h2>
            {submitted ? (
              <div className="text-success text-lg font-semibold text-center py-12">Thank you for contacting us! We'll get back to you soon.</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-header font-semibold mb-2">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-lg bg-bg-light border border-header text-header placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-header font-semibold mb-2">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-lg bg-bg-light border border-header text-header placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-header font-semibold mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-bg-light border border-header text-header placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
                    placeholder="Enter your message"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-fit px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-primary to-emergency hover:from-primary hover:to-emergency transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 