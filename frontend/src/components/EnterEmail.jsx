import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const EnterEmail = () => {
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  const handleSendLink = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    try {
      await axios.post(
        `${API}/api/change/password/send/email`,
        { email },
        {}
      );

      setStatusMsg({ type: 'success', text: 'Reset password link has been sent! Check your email.' });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'danger', text: 'An error has occured. Try again later!' });
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
        {/* Illustration (hidden on small) */}
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

        {/* Email Card */}
        <Col xs={12} lg={5} className="d-flex justify-content-center align-items-center" style={{ padding: '3rem' }}>
          <Card className="shadow-lg floating-card" style={{ width: '100%', maxWidth: '360px', borderRadius: '36px' }}>
            <Card.Body className="p-4">
              <h3 className="text-center mb-4" style={{ color: '#57BE9F', fontWeight: 'bold' }}>
                Send link to reset
              </h3>

              {statusMsg && (
                <Alert variant={statusMsg.type} onClose={() => setStatusMsg(null)} dismissible>
                  {statusMsg.text}
                </Alert>
              )}

              <Form onSubmit={handleSendLink}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label className="d-flex align-items-center">
                    <FaEnvelope className="me-2" />
                    Email address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Introdu email-ul tău"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>

                <Button
                  className="w-100 mb-3 btn-login"
                  style={{ border: 'none', padding: '0.6rem', borderRadius: '8px', color: '#FFFFFF' }}
                  variant="dark"
                  type="submit"
                >
                  Send link
                </Button>

                <Row>
                  <Col className="d-flex justify-content-center">
                    <Button variant="link" onClick={() => navigate('/')} style={{ color: '#2E3B4E', textDecoration: 'underline' }}>
                      Back to the login page.
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

export default EnterEmail;
