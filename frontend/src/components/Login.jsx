import React, { useState } from 'react';
import axios from "axios";
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  const { login } = useAuth();

  const navigate = useNavigate();
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try{

      if (emailOrUsername !== '' && password !== '') {
        // Verificăm dacă input-ul este un email valid sau un username
        const isEmail = emailOrUsername.includes('@'); // Simplu check pentru email


        const response = await axios.post(`${API}/api/auth/login`, {
          email: isEmail ? emailOrUsername : null,
          username: !isEmail ? emailOrUsername : null,
          password: password
        }, {
          validateStatus: status => status < 500  // Nu aruncă excepție pentru 400 sau 401
        });

        // TODO change the location where the token is stored based on the remember me button
        if (response.status === 200) {
          const { username, ID, token, role } = response.data;
          console.log("Login successful");

          sessionStorage.setItem('token', token);
          await login({ username, ID, role });

          if (role === 1) {
            navigate('/admin/users')
          } else {
            navigate('/home');
          }

          // redirect to home
          
        } else if (response.status === 401) {
          setErrorMessage(response.data.message);
        } else {
          console.log("Login failed");
          setErrorMessage('Utilizator sau parolă incorectă.'); 
        }
      }
      
        
    } catch(err){
      console.log(err);
    }
  };

  const handleSignUpRedirect = e =>   {
    e.preventDefault();
    navigate('/register');
  };

  const handleForgotPassowrd = e => {
    e.preventDefault();
    navigate('/enter/email');
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center animated-bg"
      style={{
        minHeight: '100vh',
        //backgroundColor: '#607D8B'  /* Fundal uniform */
      }}
    >
      {/* Titlul „TapTag” în stânga sus */}
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
        {/* ======================================= */}
        {/*   Coloana pentru ilustrație (stânga)   */}
        {/* ======================================= */}
        <Col
          xs={0}
          lg={5}
          className="d-none d-lg-flex justify-content-center align-items-center"
          style={{
            padding: '2rem'
          }}
        >
          {/* Înlocuiește „/illustration.png” cu calea ta reală */}
          <img
            src="icon.png"
            alt="Ilustrație TapTag"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              //borderRadius: '12px',
              //boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          />
        </Col>

        {/* ======================================= */}
        {/*      Coloana pentru CARD-ul LOGIN      */}
        {/* ======================================= */}
        <Col
          xs={12}
          lg={5}
          className="d-flex justify-content-center align-items-center"
          style={{ padding: '3rem' }}
        >
          <Card
            className="shadow-lg floating-card"
            style={{
              width: '100%',
              maxWidth: '360px',
              borderRadius: '36px'  /* colțuri foarte rotunjite */
            }}
          >
            <Card.Body className="p-4">
              {/* Titlu LOGIN */}
              <h3
                className="text-center mb-4"
                style={{ color: '#57BE9F', fontWeight: 'bold' }}
              >
                LOGIN
              </h3>

              {/* Formular */}
              <Form onSubmit={handleSubmit}>
                {/* Email/Username */}
                <Form.Group className="mb-3" controlId="formEmailOrUsername">
                  <Form.Label className="d-flex align-items-center">
                    <FaUser className="me-2" />
                    Enter username or email
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Username or email"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                    style={{
                      borderRadius: '8px'
                    }}
                  />
                </Form.Group>

                {/* Parolă */}
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label className="d-flex align-items-center">
                    <FaLock className="me-2" />
                    Enter password
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        borderRadius: '8px'
                      }}
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

                {errorMessage && (
                  <Form.Text className="text-danger mb-3">
                    {errorMessage}
                  </Form.Text>
                )}

                <Row className="mb-3 align-items-center">
                  <Col xs="6">
                    <Form.Text className="text-muted" style={{ fontSize: '0.9rem' }}>
                      <a
                        href="#"
                        onClick={handleForgotPassowrd}
                        style={{
                          textDecoration: 'none',
                          color: '#2E3B4E',
                          opacity: 0.8
                        }}
                      >
                        Forgot password?
                      </a>
                    </Form.Text>
                  </Col>
                  <Col xs="6" className="d-flex justify-content-end">
                    <Form.Check
                      type="checkbox"
                      label="Remember me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{
                        color: '#2E3B4E',
                        userSelect: 'none'
                      }}
                    />
                  </Col>
                </Row>

                <Button
                
                className="w-100 mb-3 btn-login"
                style={{
                  border: 'none',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  color: '#FFFFFF'  /* text alb pe turcoaz */
                }}
                type="submit"
              >
                Login
              </Button>

                <Row>
                  <Col className="d-flex justify-content-center">
                    <Button
                      variant="link"
                      onClick={handleSignUpRedirect}
                      style={{
                        color: '#2E3B4E',
                        textDecoration: 'underline'
                      }}
                    >
                      Don't have an account? Sign up
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


export default Login;
