import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Row, Col, Image, Dropdown, Modal, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { FaCog } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { disconnect_socket } from '../utils/socket';

const ProfileView = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [userID, setUserID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followsAccount, setFollowsAccount] = useState(false);
  const API = process.env.REACT_APP_BACKEND_BASE_URL;


  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState(null)
  const [deleting, setDeleting] = useState(false)


  const confirmDelete = () => {
    setDeleteError(null)
    setDeletePassword('')
    setShowDeleteModal(true)
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await axios.post(`${API}/api/user/profile/delete/${user.userID}`, {
        password: deletePassword
      })

      // On success: log out & redirect
      await axios.get(`${API}/api/auth/logout`)
      sessionStorage.removeItem('token')
      disconnect_socket()
      navigate('/')
    } catch (err) {
      // Show backend error message (e.g. incorrect password)
      const msg = err.response?.data?.message || 'Error deleting account'
      setDeleteError(msg)
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setProfile(null);
    setProfilePicture(null);
    setFollowers([]);
    setFollowing([]);
    setPosts([]);
    setIsCurrentUser(false);
    setFollowsAccount(false);

    (async () => {
      try {
        let localUserID;
        if (username === user.username) {
          localUserID = user.userID;
          setIsCurrentUser(true);
        } else {
          const { data } = await axios.get(
            `${API}/api/user/id/username/${username}`
          );
          localUserID = data.userID;
        }
        setUserID(localUserID);

        const profileResp = await axios.get(
          `${API}/api/user/profile/preview/${localUserID}`
        );
        setProfile(profileResp.data);

        if (profileResp.data.profilePhotoID) {
          const pic = await axios.get(
            `${API}/api/image/${profileResp.data.profilePhotoID}`
          );
          setProfilePicture(pic.data);
        }

        const postsResp = await axios.get(
          `${API}/api/post/user/${localUserID}`
        );
        // fetch each image
        await Promise.all(postsResp.data.map(async p => {
          const img = await axios.get(`${API}/api/image/${p.photoID}`);
          p.data = img.data.data;
        }));
        setPosts(postsResp.data);

        // followers / following
        const foll = await axios.get(
          `${API}/api/follow/followers/${localUserID}`
        );
        setFollowers(foll.data);
        setFollowsAccount(
          foll.data.some(f => f.followerUser.id === user.userID)
        );

        const folg = await axios.get(
          `${API}/api/follow/following/${localUserID}`
        );
        setFollowing(folg.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [username, user]);

  const handleFollow = async () => {
    await axios.post(`${API}/api/follow/`, { userID });
    // refresh
    const foll = await axios.get(
      `${API}/api/follow/followers/${userID}`
    );
    setFollowers(foll.data);
    setFollowsAccount(true);
  };
  const handleUnfollow = async () => {
    await axios.delete(`${API}/api/follow/following/${userID}`);
    setFollowers(fs => fs.filter(f => f.followerUser.id !== user.userID));
    setFollowsAccount(false);
  };
  const handleLogout = async () => {
    await axios.get(`${API}/api/auth/logout`);
    sessionStorage.removeItem("token");
    disconnect_socket();
    navigate("/");
  };

  if (loading)
    return (
      <div className="mt-5" style={{ minHeight: '50vh', textAlign: 'center', paddingTop: '5rem' }}>
        <Spinner animation="border" />
      </div>
    )

  if (!profile) return <div className="text-center mt-5">No profile data.</div>;

  return (
    <Container className="mt-4">
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
                profilePicture?.data
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
          </Col>
          <Col md={6}>
            <h3>{profile.username}</h3>
            <p className="text-muted">
              {profile.description} 
            </p>
            <p>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/profile/followers/${username}`)}
              >
                <strong>{followers.length}</strong> followers
              </span>{" "}
              •{" "}
              <span
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/profile/following/${username}`)}
              >
                <strong>{following.length}</strong> following
              </span>
            </p>
          </Col>
          <Col md={3} className="text-end">
            <div className="d-flex flex-column align-items-end">
              {isCurrentUser && (
              <Dropdown align="end">
                <Dropdown.Toggle variant="dark" id="dropdown-settings" className="d-flex align-items-center gap-2">
                  <FaCog />
                  Settings
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => navigate(`/profile/${username}/edit`)}>
                    Edit Profile
                  </Dropdown.Item>
                  {/* only show "Change Password" for non-admin owners */}
                  {user.role !== 'Admin' && (
                    <Dropdown.Item onClick={() => navigate(`/change/password`)}>
                      Change Password
                    </Dropdown.Item>
                  )}
                  {profile.role === 3 && (
                    <Dropdown.Item 
                    className="btn-premium d-flex align-items-center gap-2"
                    onClick={() => navigate(`/payment/${user.userID}`)}
                    >
                      Become Premium
                    </Dropdown.Item>
                  )}
                  
                    <Dropdown.Item
                      onClick={() => navigate(`/profile/${user.userID}/stats`)}
                      style={{
                        backgroundColor: '#8fce98',
                        color: '#fff',
                        fontWeight: '500'
                      }}
                    >
                      View Statistics
                    </Dropdown.Item>
                  
                  <Dropdown.Item onClick={handleLogout}>
                    Logout
                  </Dropdown.Item>

                  <Dropdown.Item
                    onClick={confirmDelete}
                    className="text-danger"
                  >
                    Delete Account
                  </Dropdown.Item>

                </Dropdown.Menu>
              </Dropdown>
            )}
              {!isCurrentUser && user.role !== 'Admin' && (
                <Button
                  variant={followsAccount ? "outline-danger" : "dark"}
                  onClick={
                    followsAccount ? handleUnfollow : handleFollow
                  }
                >
                  {followsAccount ? "Unfollow" : "Follow"}
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      <hr />

      <Row className="mt-4">
        {posts.length === 0 ? (
          <p className="text-center">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <Col key={post.id} xs={4} sm={4} md={3} lg={3} className="mb-3">
              <Card>
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    overflow: "hidden"
                  }}
                >
                  <img
                    src={`data:image/jpeg;base64,${post.data}`}
                    className="img-fluid"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                    }}
                    onClick={() => window.location.href = `/post/${post.id}`}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  />
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>
      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Account Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && (
            <Alert variant="danger">{deleteError}</Alert>
          )}
          <p>Please enter your password to confirm deletion:</p>
          <Form.Control
            type="password"
            placeholder="Password"
            value={deletePassword}
            onChange={e => setDeletePassword(e.target.value)}
            disabled={deleting}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={deleting || !deletePassword}
          >
            {deleting
              ? <><Spinner animation="border" size="sm"/> Deleting...</>
              : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProfileView;
