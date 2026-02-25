import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Row, Col, Spinner, Alert, Button, Image, Form, Offcanvas, Dropdown, DropdownButton } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FaTrashAlt } from "react-icons/fa";

const AllUsersView = () => {
  const { user } = useAuth();
  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortKey, setSortKey] = useState('username');
  const [filterGender, setFilterGender] = useState('all');
  const [filterAgeGroup, setFilterAgeGroup] = useState('all');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showReportedContent, setShowReportedContent] = useState(false);
  const [showTheirContentReported, setShowTheirContentReported] = useState(false);


  const [showFilter, setShowFilter] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role !== "Admin") {
      setLoading(false);
      navigate("/not/found/");
      return;
    }

    (async () => {
      setLoading(true);
      try {
        // Fetch all users
        const res = await axios.get(`${API}/api/user/nonAdmin/`);
        const rawUsers = res.data;
        // Enrich with profile image data
        const enriched = await Promise.all(
          rawUsers.map(async u => {
            // compute age
            const dob = new Date(u.DOB);
            const age = Math.floor((Date.now() - dob.getTime()) /
              (1000 * 60 * 60 * 24 * 365.25));
        
            // try to load profile photo if any
            let profilePhotoData = null;
            if (u.profilePhotoID) {
              try {
                const imgRes = await axios.get(`${API}/api/image/${u.profilePhotoID}`);
                profilePhotoData = imgRes.data.data;
              } catch {
                profilePhotoData = null;
              }
            }
        
            // fetch this user's followers count
            let followersCount = 0;
            try {
              const follRes = await axios.get(`${API}/api/follow/followers/${u.id}`);
              followersCount = Array.isArray(follRes.data) ? follRes.data.length : 0;
            } catch {
              followersCount = 0;
            }

            let followingCount = 0;
            try {
              const follRes = await axios.get(`${API}/api/follow/following/${u.id}`);
              followingCount = Array.isArray(follRes.data) ? follRes.data.length : 0;
            } catch {
              followingCount = 0;
            }

            let hasReported = false;
            try {
              const resultPost = await axios.get(`${API}/api/postReport/user/${u.id}/has/reported/`);
              const resultComment = await axios.get(`${API}/api/commentReport/user/${u.id}/has/reported/`);

              if (resultPost.data != null || resultComment.data != null) {
                hasReported = true;
              }
            } catch {
              hasReported = false;
            }

            let theirContentReported = false;
            try {
              const resultPost = await axios.get(`${API}/api/postReport/user/${u.id}/has/been/reported/`);
              const resultComment = await axios.get(`${API}/api/commentReport/user/${u.id}/has/been/reported/`);

              if (resultPost.data != null || resultComment.data != null) {
                theirContentReported = true;
              }
            } catch {
              theirContentReported = false;
            }

            let numberOfPosts = 0;
            try {
              const resp = await axios.get(`${API}/api/post/count/user/${u.id}/`);

              numberOfPosts = resp.data.count;
            } catch {
              theirContentReported = false;
            }
        
            return {...u, profilePhotoData, followersCount, followingCount, age, hasReported, theirContentReported, numberOfPosts};
          })
        );

        setUsers(enriched);

        

        console.log(enriched);
      } catch (e) {
        console.error(e);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, API, navigate]);

  if (!user) return <Alert variant="danger">Access denied.</Alert>;
  if (loading) return <Spinner animation="border" className="mt-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const processedUsers = users
  // apply filters
  .filter(u => filterGender === 'all' || u.gender === filterGender)
  .filter(u => filterAgeGroup === 'all' || (() => {
    const age = u.age;
    if (filterAgeGroup === 'under18') return age >= 13 && age < 18;
    if (filterAgeGroup === '18-24') return age >= 18 && age <= 24;
    if (filterAgeGroup === '25-34') return age >= 25 && age <= 34;
    if (filterAgeGroup === '35-44') return age >= 35 && age <=44;
    if (filterAgeGroup === '45+') return age >= 45;
    return true;
  })())
  .filter(u => !showOnlineOnly || u.token != null)
  .filter(u => !showReportedContent || u.hasReported)
  .filter(u => !showTheirContentReported || u.theirContentReported)
  // apply sort
  .sort((a, b) => {
    switch (sortKey) {
      case 'username':
        return a.username.localeCompare(b.username);
      case 'username_desc':
        return b.username.localeCompare(a.username);
      case 'name':
        return (`${a.firstName} ${a.lastName}`).localeCompare(`${b.firstName} ${b.lastName}`);
      case 'name_desc':
        return (`${b.firstName} ${b.lastName}`).localeCompare(`${a.firstName} ${a.lastName}`);
      case 'followers':
        return a.followersCount - b.followersCount;
      case 'followers_desc':
        return b.followersCount - a.followersCount;
      case 'age':
        return a.age - b.age;
      case 'age_desc':
        return b.age - a.age;
      default:
        return 0;
    }
  });

  return (
    <Container className="d-flex justify-content-center mt-4">
      <Card
        className="shadow-lg"
        style={{
          width: "75vw",
          minHeight: "85vh",
          border: "none",
          borderRadius: "2rem",
          background: "linear-gradient(to right, #e0f7fa, #ffffff)",
          overflow: "hidden",
        }}
      >
        <Card.Header as="h4" className="text-center bg-transparent border-0">
          All Users
        </Card.Header>
        <Card.Body style={{ height: "75vh", padding: "1rem" }}>
          <div className = "d-flex mb-3 gap-2">
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="dropdown-sort" className="btn-turquoise">
                Sort
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSortKey('username')}>Username ↑</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey('username_desc')}>Username ↓</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey('name')}>Name ↑</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey('name_desc')}>Name ↓</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey('followers')}>Followers ↑</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey('followers_desc')}>Followers ↓</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey('age')}>Age ↑</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey('age_desc')}>Age ↓</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Button variant="secondary" onClick={() => setShowFilter(true)} className="btn-turquoise">
            Filter
            </Button>
          </div>


          <Offcanvas show={showFilter} onHide={() => setShowFilter(false)} placement="end" className="bg-white">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Filters</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="d-flex flex-column">
            <div className="flex-grow-1 overflow-auto">
              <div className="filters-group">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  value={filterGender}
                  onChange={e => setFilterGender(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </Form.Select>
              </div>

              <div className="filters-group">
                <Form.Label>Age Group</Form.Label>
                <Form.Select
                  value={filterAgeGroup}
                  onChange={e => setFilterAgeGroup(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="under18">Under 18</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45+">45+</option>
                </Form.Select>
              </div>

              <div className="filters-group">
                <Form.Check
                  type="checkbox"
                  label="Online only"
                  checked={showOnlineOnly}
                  onChange={() => setShowOnlineOnly(v => !v)}
                />
                <Form.Check
                  type="checkbox"
                  label="Reported content"
                  checked={showReportedContent}
                  onChange={() => setShowReportedContent(v => !v)}
                />
                <Form.Check
                  type="checkbox"
                  label="Their content reported"
                  checked={showTheirContentReported}
                  onChange={() => setShowTheirContentReported(v => !v)}
                />
              </div>
            </div>
            <div className = "d-flex justify-content-center mb-3">
            <Button
              variant="outline-secondary"
              className="mb-3 btn-red"
              onClick={() => {
                setFilterGender('all');
                setFilterAgeGroup('all');
                setShowOnlineOnly(false);
                setShowReportedContent(false);
                setShowTheirContentReported(false);
              }}
            >
              Clear Filters
            </Button>
            </div>
            <Button
              variant="primary"
              className=" mt-auto btn-turquoise"
              onClick={() => {
                setShowFilter(false);
                // optionally re-fetch or re-filter here
              }}
            >
              Apply Now
            </Button>
          </Offcanvas.Body>
          </Offcanvas>

         {/* <div className="filters-row mb-3">
        <Row className="mb-3 gx-2">
          
          <Col md={2}>
            <Form.Select value={filterGender} onChange={e => setFilterGender(e.target.value)}>
              <option value="all">Gender: All</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Select value={filterAgeGroup} onChange={e => setFilterAgeGroup(e.target.value)}>
              <option value="all">Age: All</option>
              <option value="under18">Under 18</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45+">45+</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Check
              type="checkbox"
              label="Online only"
              checked={showOnlineOnly}
              onChange={() => setShowOnlineOnly(v => !v)}
            />
          </Col>
          <Col md={2}>
            <Form.Check
              type="checkbox"
              label="Reported content"
              checked={showReportedContent}
              onChange={() => setShowReportedContent(v => !v)}
            />
          </Col>
          <Col md={2}>
            <Form.Check
              type="checkbox"
              label="Their content reported"
              checked={showTheirContentReported}
              onChange={() => setShowTheirContentReported(v => !v)}
            />
          </Col>
        </Row>
        </div> */}
          <div
          style={{
              maxHeight: '65vh',   // adaptează în funcție de cât loc vrei
              overflowY: 'auto',
              overflowX: 'hidden',
            }}>
            {processedUsers.map(u => (
              <Row
                key={u.id}
                className="align-items-center py-2 border-bottom"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/profile/${u.username}`)}
              >
                {/* avatar */}
                <Col xs={1} className="d-flex justify-content-center">
                  <Image
                    src={
                      u.profilePhotoData
                        ? `data:image/jpeg;base64,${u.profilePhotoData}`
                        : "/userPhoto.png"
                    }
                    roundedCircle
                    style={{ width: "48px", height: "48px", objectFit: "cover" }}
                  />
                </Col>

                {/* username + snippet */}
                <Col xs={4}>
                  <div><strong>{u.username}</strong></div>
                  {u.description && (
                    <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                      {u.description.length > 60
                        ? u.description.slice(0, 57) + "..."
                        : u.description}
                    </div>
                  )}
                </Col>

                {/* followers count */}
                <Col xs={2}>
                  <div style={{ fontSize: "0.9rem" }}>
                    <strong>{u.followersCount}</strong> followers
                  </div>
                </Col>

                {/* following count (if you have it) */}
                <Col xs={2}>
                  <div style={{ fontSize: "0.9rem" }}>
                    <strong>{u.followingCount ?? 0}</strong> following
                  </div>
                </Col>

                {/* number of posts */}
                <Col xs={2}>
                  <div style={{ fontSize: "0.9rem" }}>
                    <strong>{u.numberOfPosts ?? 0}</strong> posts added
                  </div>
                </Col>

                {/* delete button */}
                <Col xs='auto' className="d-flex align-items-center justify-content-end ms-auto">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      axios
                        .post(`${API}/api/user/profile/delete/${u.id}`)
                        .then(() =>
                          setUsers(prev => prev.filter(x => x.id !== u.id))
                        )
                        .catch(console.error);
                    }}
                  >
                    <FaTrashAlt />
                  </Button>
                </Col>
              </Row>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AllUsersView;
