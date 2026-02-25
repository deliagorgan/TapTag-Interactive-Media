import React, { useState } from 'react';
import axios from 'axios';
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Alert
} from 'react-bootstrap';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type, text }
  const { token } = useParams();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  const handleReset = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    if (password !== confirmPassword) {
      setStatusMsg({ type: 'danger', text: 'The passwords dont\'t match.' });
      return;
    }

    try {
      await axios.post(`${API}/api/change/password/${encodeURIComponent(token)}`,
        { password },
        {  }
      );

      setStatusMsg({ type: 'success', text: 'The password has been reset successfully!' });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'danger', text: 'An error has occured!' });
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center animated-bg"
      style={{ minHeight: '100vh' }}
    >
      {/* Branding */}
      <h1
        style={{
          position: 'absolute',
          top: '20px',
          left: '40px',
          fontFamily: "'Dancing Script', cursive",
          fontSize: '4rem',
          fontWeight: 'bold',
          color: '#FFFFFF',
          userSelect: 'none'
        }}
      >
        TapTag
      </h1>

      <Row className="w-100 justify-content-center">
        {/* Illustration */}
        <Col
          lg={5}
          className="d-none d-lg-flex justify-content-center align-items-center"
          style={{ padding: '2rem' }}
        >
          <img
            src="/icon.png"
            alt="TapTag"
            style={{ maxWidth: '100%', maxHeight: '80vh' }}
          />
        </Col>

        {/* Reset Password Card */}
        <Col
          xs={12}
          lg={5}
          className="d-flex justify-content-center align-items-center"
          style={{ padding: '3rem' }}
        >
          <Card
            className="shadow-lg floating-card"
            style={{ width: '100%', maxWidth: '360px', borderRadius: '36px' }}
          >
            <Card.Body className="p-4">
              <h3
                className="text-center mb-4"
                style={{ color: '#57BE9F', fontWeight: 'bold' }}
              >
                Resetează parola
              </h3>

              {statusMsg && (
                <Alert
                  variant={statusMsg.type}
                  onClose={() => setStatusMsg(null)}
                  dismissible
                >
                  {statusMsg.text}
                </Alert>
              )}

              <Form onSubmit={handleReset}>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label className="d-flex align-items-center">
                    <FaLock className="me-2" /> Parolă nouă
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Introdu parola nouă"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ borderRadius: '8px' }}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '12px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#607D8B',
                        fontSize: '1.1rem'
                      }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <Form.Label className="d-flex align-items-center">
                    <FaLock className="me-2" /> Reintrodu parola
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Reintrodu parola"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ borderRadius: '8px' }}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '12px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#607D8B',
                        fontSize: '1.1rem'
                      }}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </Form.Group>

                <Button
                  className="w-100 mb-3 btn-login"
                  style={{
                    border: 'none',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }}
                  variant="dark"
                  type="submit"
                >
                  Resetează parola
                </Button>

                <Row>
                  <Col className="d-flex justify-content-center">
                    <Button
                      variant="link"
                      onClick={() => navigate('/')}
                      style={{ color: '#2E3B4E', textDecoration: 'underline' }}
                    >
                      Inapoi la pagina de login
                    </Button>
                  </Col>
                </Row>
              </Form>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
