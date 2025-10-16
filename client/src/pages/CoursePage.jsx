import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function CoursePage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    api.get(`/courses/${id}`, token).then(setCourse).catch(console.error);
    api.get(`/courses/${id}/assignments`, token).then(setAssignments).catch(console.error);
  }, [id, token]);

  return (
    <div>
      <h2>Course</h2>
      {course && (
        <div>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <p>Duration: {course.duration}</p>
        </div>
      )}
      <h3>Assignments</h3>
      <ul>
        {assignments.map((a) => (
          <li key={a._id}>
            <Link to={`/assignments/${a._id}`}>{a.title}</Link>
          </li>
        ))}
      </ul>
      {user?.role === 'teacher' && <p>Create assignments via API (file upload UI omitted for brevity).</p>}
    </div>
  );
}
