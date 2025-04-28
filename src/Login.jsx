import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("HANDLE LOGIN WORKS ✅");
    setError('');
    setSuccess('');

    try {
      // TODO: replace with your actual API call
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/login`,
        credentials,
        { withCredentials: true }
      );


      if (response.data.success) {
        console.log(response.data.branch_id)
        setSuccess('התחברת בהצלחה!');
        navigate(`/appointments?branch_id=${response.data.branch_id}`);
      } else {
        setError('שם משתמש או סיסמה לא נכונים');
      }
    } catch (err) {
      setError('שם המשתמש או הסיסמה שגויים. אנא נסה שוב.');
    }
  };

  return (
    <div className="login-container" dir="rtl">
      <h2>התחברות</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          name="username"
          placeholder="שם משתמש"
          value={credentials.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="סיסמה"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        <button type="submit">התחבר</button>

        <div className="message-box">
          {success && <p className="success-msg">{success}</p>}
          {error && <p className="error-msg">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default Login;
