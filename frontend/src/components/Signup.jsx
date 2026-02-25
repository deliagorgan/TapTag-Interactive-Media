import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Card, Form, Button,
  Row, Col, Toast, ToastContainer, Modal
} from 'react-bootstrap';
import { FaUser, FaLock, FaCalendarAlt, FaEye, FaEyeSlash, FaIdCard, FaUserTag, FaEnvelope, FaVenusMars } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import axios from 'axios';

import RegisterSuccess from './RegisterSuccess';
import { checkTextForBannedWords } from "../utils/checkIntegrity";

const Register = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Normal');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('MALE');

  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [userID, setUserID] = useState(0);

  const API = process.env.REACT_APP_BACKEND_BASE_URL;
  const navigate = useNavigate();

  // disallow under-10
  const { today, tenYearsAgo } = useMemo(() => {
    const t = new Date();
    const todayObj = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const ten = new Date(t); ten.setFullYear(ten.getFullYear() - 10);
    const tenObj = new Date(ten.getFullYear(), ten.getMonth(), ten.getDate());
    return { today: todayObj, tenYearsAgo: tenObj };
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage('');

    // 1) banned-word check
    try {
      const [badF, badL, badU] = await Promise.all([
        checkTextForBannedWords(firstName),
        checkTextForBannedWords(lastName),
        checkTextForBannedWords(username)
      ]);

      if (badF || badL || badU) {
        setShowToast(true);

        console.log('nu merge');
        return;
      }

    } catch {
      return window.alert("Validation failed. Please try again.");
    }



    // 2) call register
    try {
      const formattedDob = dob ? new Date(dob).toISOString() : null;
      // se trimite cu acelasi rol indiferent de ce a ales deoarece doar dupa ce plateste se schimba rolul
      const { status, data } = await axios.post(
        `${API}/api/auth/register/`,
        { username, firstName, lastName, email, password, role: 'Normal', DOB: formattedDob, gender }
      );



      if (status === 200) {
          setUserID(data.userID);
          setShowPopup(true);
      } else {
        setErrorMessage(data.message || 'Registration failed.');
      }
    } catch (err) {
      let msg = 'An error occurred.';
      if (err.response) msg = err.response.data.message || msg;
      setErrorMessage(msg);
    }
  };

  const handleNextStep = async e => {
    try {
      if (role === 'Premium') {
        // skip success banner go to payment
        return navigate(`/payment/${userID}`, { state: { amount: 5000 /* your premium fee */ } });
      }
      setShowPopup(false);
      // normal flow
      setShowSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch(err) {

    }
  };

  // button label switches based on role
  const buttonLabel = role === 'Premium' ? 'Proceed to Payment' : 'Register';

  return (
    <>
      {showSuccess && <RegisterSuccess />}

      <Container
        fluid
        className="d-flex justify-content-center align-items-center register-animated-bg"
        style={{ minHeight: '100vh' }}
      >
        <h1 className="register-animated-logo">TapTag</h1>

        <Row className="w-100 justify-content-center">
          <Col xs={12} lg={5} style={{ padding: '2rem' }}>
            <Card className="register-floating-card"
              style={{borderRadius: "2.5rem"}}>
              <Card.Body className="p-4">
                <h3
                  className="text-center mb-4 fw-bold"
                  style={{ color: '#3fc1c9', textTransform: 'uppercase', fontSize: '1.8rem' }}
                >
                  Register
                </h3>

                <Form onSubmit={handleSubmit}>
                  {/* Username */}
                  <Form.Group className="mb-3">
                    <Form.Label><FaUser className="me-2" />Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* First & Last */}
                  <Form.Group className="mb-3">
                    <Form.Label><FaIdCard className="me-2" />First Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><FaIdCard className="me-2" />Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Email */}
                  <Form.Group className="mb-3">
                    <Form.Label><FaEnvelope className="me-2" />Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-3">
                    
                    <Form.Label><FaLock className="me-2" />Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      
                      <span
                        onClick={() => setShowPassword(v => !v)}
                        style={{
                          position: 'absolute', top: '50%', right: '12px',
                          transform: 'translateY(-50%)', cursor: 'pointer', color: '#3fc1c9'
                        }}
                      >
                        {showPassword ? <FaEyeSlash/> : <FaEye/>}
                      </span>
                    </div>
                    <small className="text-muted mt-1 d-block" style={{ fontSize: "0.85rem" }}>
                      Your password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
                    </small>
                  </Form.Group>

                  {/* DOB */}
                  <Form.Group className="mb-3">
                    <Form.Label><FaCalendarAlt className="me-2" />Date of Birth</Form.Label>
                    <br></br>
                    <DatePicker
                      selected={dob}
                      onChange={setDob}
                      dateFormat="yyyy-MM-dd"
                      maxDate={tenYearsAgo}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      placeholderText="Select your birth date"
                      className="form-control"
                    />
                  </Form.Group>

                  {/* Gender */}
                  <Form.Group className="mb-3">
                    <Form.Label><FaVenusMars className="me-2" />Gender</Form.Label>
                    <Form.Select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      required
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Role */}
                  <Form.Group className="mb-3">
                    <Form.Label><FaUserTag className="me-2" />Role</Form.Label>
                    <Form.Select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Premium">Premium</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Error message */}
                  {errorMessage && (
                    <div className="text-danger mb-3">{errorMessage}</div>
                  )}

                  {/* Submit / Proceed to Payment */}
                  <Button className="w-100 mb-3 btn-turquoise" type="submit">
                    {buttonLabel}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>

      <ToastContainer position="top-center" className="p-3">
          <Toast 
            onClose={() => setShowToast(false)} 
            show={showToast} 
            delay={7000} 
            autohide
            bg="danger"
          >
            <Toast.Body className="text-white">
              "Your first name, last name or username contains forbidden words."
            </Toast.Body>
          </Toast>
        </ToastContainer>


        <Modal
          show={showPopup}
          centered
          backdrop="static"
          keyboard={false}
        >
          <Modal.Body className="text-center">
            <p>An email has been sent to {email} in order to verify your email address.</p>
            <Button variant="primary" onClick={handleNextStep}>
              {role === 'Premium' ? 'Go to checkout' : 'Go to login'}
            </Button>
          </Modal.Body>
        </Modal>

    </>
  );
};

export default Register;
