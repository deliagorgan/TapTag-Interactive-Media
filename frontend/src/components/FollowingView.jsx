
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Button, Row, Col, Image } from "react-bootstrap";
import { Image as BootstrapImage } from "react-bootstrap";
import { FaTrashAlt, FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";


const FollowingView = () => {
    const navigate = useNavigate();
    const [following, setFollowing] = useState(null);
    const {user} = useAuth();
    const { username } = useParams();
    const [userID, setUserID] = useState(null);
    const [canDeleteAll, setCanDeleteAll] = useState(false);
    const API = process.env.REACT_APP_BACKEND_BASE_URL;

    useEffect(() => {
        const fetchFollowing = async () => {
            if (user && user.userID && user.username) {
                try {
                    /*
                        se afla ID-ul userului cu username ul din cale
                    */
                    const wantedUserIDData = await axios.get(`${API}/api/user/id/username/${username}`, {});
                    setUserID(wantedUserIDData.data.userID);

                    /*
                        se cer toti userii care il urmaresc pe
                    */
                    const following = await axios.get(`${API}/api/follow/following/${wantedUserIDData.data.userID}`, {});
        
                    const followingData = following.data;
        
                    for (let user of followingData) {
                        /*
                            se cere imaginea de profil pentru fiecare user
                        */
                        if (user.followedUser.profilePhotoID) {
                            const image = await axios.get(`${API}/api/image/${user.followedUser.profilePhotoID}`, {});
        
                            user.followedUser.data = image.data.data;
                        }
                    }
        
                    /*
                        daca este contul meu pot sterge orice follower
                    */
                    if (user.username == username)
                        setCanDeleteAll(true);

                    setFollowing(followingData);
                } catch(err) {
                    console.log(`Eroare la incarcarea userilor: ${err}.`);
                }
            }
        }

        fetchFollowing();
    }, [username, user]);


    const handleDelete = async (following) => {
        try {
            await axios.delete(`${API}/api/follow/${following.followedUserID}`, {});

            setFollowing((prevFollowing) => prevFollowing.filter(f => f.followedUser.id !== following.followedUser.id));

        } catch(err) {
            console.log(`Eroare la stergerea follower-ului: ${err}.`);
        }
    }


    return (
      <Container className="d-flex justify-content-center mt-4">
        <Card
          className="shadow-lg"
          style={{
            width: "50vw",
            minHeight: "75vh",
            border: "none",
            borderRadius: "2rem",
            background: "linear-gradient(to right, #e0f7fa, #ffffff)",
            overflow: "hidden",
          }}
        >
          <Card.Header className="bg-transparent border-0 position-relative">
            <Button
              variant="link"
              className="position-absolute"
              onClick={() => navigate(`/profile/${username}`)}
              style={{ top: '0.75rem', left: '0.75rem', padding: '0.25rem' }}
            >
              <FaChevronLeft size={24} />
            </Button>
            <h4 className="text-center m-0">Following</h4>
          </Card.Header>
  
          <Card.Body style={{ height: "75vh", padding: "1rem" }}>
            <div style={{ maxHeight: "65vh", overflowY: "auto", overflowX: "hidden" }}>
              {!following || following?.length === 0 ? (
                <p className="text-center w-100">You are not following any users!</p>
              ) : following.map(f => (
                <Row
                  key={f.id}
                  className="align-items-center py-2 border-bottom"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/profile/${f.followedUser.username}`)}
                >
                  <Col xs={1} className="d-flex justify-content-center">
                    <BootstrapImage
                      src={
                        f.followedUser.profilePhotoID && f.followedUser.data
                          ? `data:image/jpeg;base64,${f.followedUser.data}`
                          : "/userPhoto.png"
                      }
                      roundedCircle
                      width={40}
                      height={40}
                      alt={f.followedUser.username}
                      style={{ cursor: "pointer" }}
                    />
                  </Col>
                  <Col xs={8}>
                    <strong style={{ cursor: "pointer", color: "black" }}>
                      {f.followedUser.username}
                    </strong>
                  </Col>
                  <Col xs="auto" className="d-flex align-items-center ms-auto">
                    {canDeleteAll && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(f);
                        }}
                      >
                        <FaTrashAlt />
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  };


export default FollowingView;