// src/components/ValidateEmail.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ValidateEmail = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { user } = useAuth();

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  useEffect(() => {
    const validate = async () => {
      setStatus("loading");
      try {
        const res = await axios.get(
          `${API}/api/validate/email/${encodeURIComponent(token)}`
        );
        setMessage("Email verified successfully!");
        setStatus("success");
      } catch (err) {
        console.error("Email validation error:", err);
        setMessage(
          err.response?.data?.error ||
            err.message ||
            "An unexpected error occurred."
        );
        setStatus("error");
      }
    };
    validate();
  }, [token, API]);

  const handleGoHome = () => navigate(user ? "/home" : "/");

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center register-animated-bg"
      style={{ minHeight: "100vh" }}
    >
      <Row className="w-100 justify-content-center">
        <Col
          xs={12}
          lg={5}
          className="d-flex justify-content-center align-items-center p-4"
        >
          <Card className="register-floating-card w-100">
            <Card.Body className="p-4 text-center">
              {status === "loading" && (
                <>
                  <Spinner animation="border" role="status" className="mb-3">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <div>Verifying your email, please wait...</div>
                </>
              )}

              {status === "success" && (
                <Alert variant="success">{message}</Alert>
              )}

              {status === "error" && (
                <Alert variant="danger">
                  {message ||
                    "The email address couldn't be verified. Try logging in to receive another!"}
                </Alert>
              )}

              {(status === "success" || status === "error") && (
                <Button
                  variant="primary"
                  onClick={handleGoHome}
                  className="register-btn-register mt-3"
                >
                  {user ? "Go to Home" : "Go to Login"}
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ValidateEmail;
