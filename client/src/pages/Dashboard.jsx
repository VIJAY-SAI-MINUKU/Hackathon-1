import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses', token).then(setCourses).catch(console.error);
  }, [token]);

  const enroll = async (courseId) => {
    await api.post(`/courses/${courseId}/enroll`, undefined, token);
    alert('Enrolled!');
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Logged in as {user?.name} ({user?.role})</p>
      {user?.role === 'teacher' && <Link to="/courses/new">Create Course via API</Link>}
      <ul>
        {courses.map((c) => (
          <li key={c._id}>
            <Link to={`/courses/${c._id}`}>{c.title}</Link>
            {user?.role === 'student' && (
              <button style={{ marginLeft: 8 }} onClick={() => enroll(c._id)}>Enroll</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
