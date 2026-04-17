'use client';

import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'gmail'>('whatsapp');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2 px-4 text-center rounded-l-md ${
              activeTab === 'whatsapp'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('gmail')}
            className={`flex-1 py-2 px-4 text-center rounded-r-md ${
              activeTab === 'gmail'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Gmail
          </button>
        </div>

        {activeTab === 'whatsapp' && <WhatsAppForm />}
        {activeTab === 'gmail' && <GmailForm />}
      </div>
    </div>
  );
}

function WhatsAppForm() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: phone, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('Message sent successfully!');
        setPhone('');
        setMessage('');
      } else {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error;
        setStatus(`Error: ${errorMsg}`);
      }
    } catch {
      setStatus('Network error: Unable to connect to server');
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-center">Send WhatsApp Message</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number (with country code, e.g., 1234567890)
          </label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Send Message
        </button>
      </form>
      {status && (
        <p className="mt-4 text-center text-sm text-gray-600">{status}</p>
      )}
    </>
  );
}

function GmailForm() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const response = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, text: message }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('Email sent successfully!');
        setTo('');
        setSubject('');
        setMessage('');
      } else {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error;
        setStatus(`Error: ${errorMsg}`);
      }
    } catch {
      setStatus('Network error: Unable to connect to server');
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-center">Send Gmail</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-gray-700">
            To Email
          </label>
          <input
            type="email"
            id="to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="gmail-message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="gmail-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Send Email
        </button>
      </form>
      {status && (
        <p className="mt-4 text-center text-sm text-gray-600">{status}</p>
      )}
    </>
  );
}
