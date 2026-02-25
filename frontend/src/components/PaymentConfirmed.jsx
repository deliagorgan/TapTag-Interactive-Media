import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const PaymentConfirmed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogin = () => navigate('/');
  const handleHome  = () => navigate('/home');

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center register-animated-bg"
      style={{ minHeight: '100vh' }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} lg={5} className="d-flex justify-content-center align-items-center p-4">
          <Card className="register-floating-card w-100"
                style={{ borderRadius: '2.5rem' }} >
            <Card.Body className="p-4 text-center">
              {/* Big green checkmark */}
              <h1 className="display-1 text-success mb-3">✓</h1>

              <h3 className="fw-bold mb-3" style={{ color: '#3fc1c9' }}>
                Thank You!
              </h3>

              <p className="lead mb-4">
                Your payment was successful.<br/>
                We appreciate your support.
              </p>

              <Row className="justify-content-center">
                {!user && (
                  <Col xs="auto" className="mb-2">
                    <Button
                      variant="primary"
                      onClick={handleLogin}
                      className="register-btn-register"
                    >
                      Login
                    </Button>
                  </Col>
                )}
                {user && (
                  <Col xs="auto">
                    <Button
                      variant="primary"
                      onClick={handleHome}
                      className="register-btn-register"
                    >
                      Go to Home
                    </Button>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentConfirmed;
