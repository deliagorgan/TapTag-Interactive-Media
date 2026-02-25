import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup
} from 'react-bootstrap';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
  const { user } = useAuth();
  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type, text }
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus(null);

    if (password !== confirmPassword) {
      setStatus({ type: 'danger', text: "Passwords don't match." });
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API}/api/change/password/${encodeURIComponent(sessionStorage.getItem('token'))}`,
        { password },
        {  }
      );

      setStatus({ type: 'success', text: 'Password changed successfully.' });
      setPassword('');
      setConfirmPassword('');

      navigate(`/profile/${user.username}`);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'danger', text: 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Alert variant="danger">You must be logged in to change your password.</Alert>
      </Container>
    );
  }

  return (
    <Container 
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <Card
        className="shadow-lg"
        style={{
          width: "30rem",
          border: "none",
          borderRadius: "2rem",
          background: "linear-gradient(to right, #e0f7fa, #ffffff)",
          padding: "2rem"
        }}
      >
        <Card.Header as="h4" className="text-center bg-transparent border-0">
          Change Password
        </Card.Header>
        <Card.Body>
          {status && (
            <Alert variant={status.type} onClose={() => setStatus(null)} dismissible>
              {status.text}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label><FaLock className="me-2" />New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ borderRadius: '0.5rem 0 0 0.5rem' }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label><FaLock className="me-2" />Confirm Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{ borderRadius: '0.5rem 0 0 0.5rem' }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirm(v => !v)}
                  style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <div className="d-grid mb-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Change Password'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ChangePassword;
