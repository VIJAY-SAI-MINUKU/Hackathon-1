import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AssignmentPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('text', text);
    const res = await fetch(`${(typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5000'}/api/assignments/${id}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      setMessage('Failed to submit');
    } else {
      setMessage('Submitted!');
    }
  };

  useEffect(() => { setMessage(''); }, [id]);

  return (
    <div>
      <h2>Assignment</h2>
      {user?.role === 'student' && (
        <form onSubmit={submit}>
          <div>
            <label>Text</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div>
            <label>Files (optional)</label>
            <input type="file" name="files" multiple />
          </div>
          <button type="submit">Submit</button>
        </form>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
