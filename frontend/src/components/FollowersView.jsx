
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Button, Row, Col, Image } from "react-bootstrap";
import { Image as BootstrapImage } from "react-bootstrap";
import { FaTrashAlt, FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";


const FollowersView = () => {
    const navigate = useNavigate();
    const [followers, setFollowers] = useState(null);
    const {user} = useAuth();
    const { username } = useParams();
    const [userID, setUserID] = useState(null);
    const [canDeleteAll, setCanDeleteAll] = useState(false);
    const API = process.env.REACT_APP_BACKEND_BASE_URL;

    useEffect(() => {
        const fetchFollowers = async () => {
            if (user && user.userID && user.username) {
                try {
                    console.log(username);
                    /*
                        se afla ID-ul userului cu username ul din cale
                    */
                    const wantedUserIDData = await axios.get(`${API}/api/user/id/username/${username}`, {});
                    setUserID(wantedUserIDData.data.userID);

                    /*
                        se cer toti userii care ma urmaresc
                    */
                    const followers = await axios.get(`${API}/api/follow/followers/${wantedUserIDData.data.userID}`, {});
        
                    const followersData = followers.data;
        
                    for (let user of followersData) {
                        /*
                            se cere imaginea de profil pentru fiecare user
                        */
                        if (user.followerUser.profilePhotoID) {
                            const img = await axios.get(`${API}/api/image/${user.followerUser.profilePhotoID}`, {});
        
                            user.followerUser.data = img.data.data;
                        }
                    }
        
                    /*
                        daca este contul meu pot sterge orice follower
                    */
                    if (user.username == username)
                        setCanDeleteAll(true);

                    setFollowers(followersData);
                } catch(err) {
                    console.log(`Eroare la incarcarea userilor: ${err}.`);
                }
            }
        }

        fetchFollowers();
    }, [username, user]);


    const handleDeleteFollower = async (follower) => {
        try {
            await axios.delete(`${API}/api/follow/following/${follower.userID}`, {});

            setFollowers((prevFollowers) => prevFollowers.filter(f => f.followerUser.id !== follower.followerUser.id));

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
              onClick={() => navigate(`/profile/${user.username}`)}
              style={{ top: '0.75rem', left: '0.75rem', padding: '0.25rem' }}
            >
              <FaChevronLeft size={24} />
            </Button>
            <h4 className="text-center m-0">Followers</h4>
          </Card.Header>

          <Card.Body style={{ height: "75vh", padding: "1rem" }}>
            <div
              style={{
                maxHeight: "65vh",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {!followers || followers.length === 0 ? (
                <p className="text-center w-100">You have no followers!</p>
              ) : (
                followers.map((follower) => (
                  <Row
                    key={follower.id}
                    className="align-items-center py-2 border-bottom"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(
                        `/profile/${follower.followerUser.username}`
                      )
                    }
                  >
                    <Col xs={1} className="d-flex justify-content-center">
                      <BootstrapImage
                        src={
                          follower.followerUser.profilePhotoID &&
                          follower.followerUser.data
                            ? `data:image/jpeg;base64,${follower.followerUser.data}`
                            : "/userPhoto.png"
                        }
                        roundedCircle
                        width={40}
                        height={40}
                        alt={follower.followerUser.username}
                        style={{ cursor: "pointer" }}
                      />
                    </Col>
                    <Col xs={8}>
                      <strong
                        style={{ cursor: "pointer", color: "black" }}
                      >
                        {follower.followerUser.username}
                      </strong>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-center ms-auto">
                      {(canDeleteAll ||
                        follower.followerUser.username === user.username) && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFollower(follower);
                          }}
                        >
                          <FaTrashAlt />
                        </Button>
                      )}
                    </Col>
                  </Row>
                ))
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
    

};


export default FollowersView;