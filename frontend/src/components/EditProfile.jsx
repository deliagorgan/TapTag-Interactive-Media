import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Row, Col, Form, Image, Toast, ToastContainer } from "react-bootstrap";
import axios from "axios";
import { FaCrown } from "react-icons/fa"
import { useAuth } from "../context/AuthContext";
import { checkTextForBannedWords } from "../utils/checkIntegrity";

const EditProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

// pentru alerta 
  const [showToast, setShowToast] = useState(false);
  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchProfile = async () => {
      try {
        const resp = await axios.get(`${API}/api/user/profile/${user.userID}`);
        const data = resp.data;
        setProfile(data);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setDescription(data.description || "");
        if (data.profilePhotoID) {
          const picRes = await axios.get(`${API}/api/image/${data.profilePhotoID}`);
          setProfilePicture(picRes.data);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result.split(',')[1];
        const imgRes = await axios.post(
          `${API}/api/image/create`,
          { data: base64 }
        );
        const photoID = imgRes.data.photoID;
        await axios.put(
          `${API}/api/user/profile/${user.userID}`,
          { profilePhotoID: photoID }
        );
        const newPic = await axios.get(`${API}/api/image/${photoID}`);
        setProfilePicture(newPic.data);
      } catch (err) {
        console.error('Error updating profile picture:', err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate against banned words
    try {
      const badFirst = await checkTextForBannedWords(firstName);
      const badLast = await checkTextForBannedWords(lastName);
      const badDesc = await checkTextForBannedWords(description);

      if (badFirst || badLast || badDesc) {
        setShowToast(true);
        //window.alert("Your profile contains forbidden words. Please remove them before saving.");
        return;
      }
    } catch (err) {
      console.error('Validation error:', err);
      window.alert("Validation failed. Please try again.");
      return;
    }

    try {
      await axios.put(
        `${API}/api/user/profile/${user.userID}`,
        { firstName, lastName, description }
      );
      navigate(`/profile/${username}`);
    } catch (err) {
      console.error('Error updating profile:', err);
      window.alert("Unable to save changes. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }

  return (

    <>
    <Container className="mt-4" style={{ paddingBottom: "80px" }}>
      <Card 
          className="shadow-lg p-4 mb-4"
          style={{
            borderRadius: "2rem",
            background: "linear-gradient(to right, #e0f7fa, #ffffff)",  // același vibe ca feed-ul tău
            border: "none"
          }}
        >
        <Row className="align-items-center">
          <Col md={3} className="text-center">
            <Image
              src={
                profilePicture && profilePicture.data
                  ? `data:image/jpeg;base64,${profilePicture.data}`
                  : "/userPhoto.png"
              }
              roundedCircle
              style={{
              width: 120,
              height: 120,
              objectFit: 'cover',
              borderRadius: '50%',
            }}
            />
            <div className="mt-3 position-relative">
              <input
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                disabled={uploading}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', opacity: 0, cursor: 'pointer'
                }}
              />
      
              <Button variant="outline-primary" size="sm" className="btn-turquoise px-3" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Change Picture'}
              </Button>
            </div>
          </Col>
          <Col md={6}>
            <h3>{profile.username}</h3>
          </Col>
        </Row>
      </Card>

      <Card className="shadow-lg p-4 mt-4 rounded-4">
        <h4>Edit Profile</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="lastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3 position-relative" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Write a description"
              value={description}
              onChange={e => {
                const v = e.target.value;
                if (v.length <= 255) setDescription(v);
              }}
            />
            <small
                  className="text-muted"
                  style={{
                    position: 'absolute',
                    right: '1.0rem',
                    bottom: '0.5rem' }}
                >
                  {description.length}/255
                </small>
          </Form.Group>

          <div className="d-flex flex-column align-items-center gap-3 mt-3">
            <Button className="btn-turquoise" type="submit">
              Save Changes
            </Button>
            <Button className="btn-red" type="submit">
              Delete account
            </Button>
            {profile.role === 3 && (
              <Button
                className="btn-premium d-flex align-items-center gap-2"
                onClick={() => navigate(`/payment/${user.userID}`)}
              >
                <FaCrown />
                Become Premium
              </Button>
            )}
          </div>
        </Form>
      </Card>
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
          Your profile contains forbidden words. Please remove them before saving.
        </Toast.Body>
      </Toast>
    </ToastContainer>
    </>
  );
};

export default EditProfile;
