import { useState } from "react";
import axios from "axios";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";

const AddAdminUser = () => {
  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Dummy backend route
      await axios.post(`${API}/api/user/addAdmin`, formData);
      setSuccess("Admin user added successfully!");
      setFormData({ username: "", password: "", email: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to add admin user.");
    } finally {
      setLoading(false);
    }
  };

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
          Add Admin User
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </Form.Group>


            <div className="d-grid">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Add Admin"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddAdminUser;
