import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function Profile() {
  const { user, token } = useAuth();
  const [grades, setGrades] = useState(null);
  useEffect(() => {
    if (user) api.get(`/users/${user.id}/grades`, token).then(setGrades).catch(console.error);
  }, [user, token]);

  return (
    <div>
      <h2>Profile</h2>
      <p>{user?.name} ({user?.email})</p>
      <h3>Grades</h3>
      {grades && (
        <div>
          <p>Overall: {grades.overall ?? 'N/A'}%</p>
          <ul>
            {grades.courses.map((c) => (
              <li key={c.courseId}>{c.courseTitle}: {c.percentage ?? 'N/A'}%</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
