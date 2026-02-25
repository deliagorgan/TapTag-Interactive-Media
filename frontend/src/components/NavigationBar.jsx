import { NavLink, useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Offcanvas,
  ListGroup,
  Spinner,
  Alert,
  Button,
  ButtonGroup,
  Image as BootstrapImage
} from "react-bootstrap";
import {
  FaHome,
  FaUser,
  FaPlusSquare,
  FaUserPlus,
  FaFlag,
  FaBell,
  FaChartBar,
  FaUsers,
  FaCompass,
  FaSearch
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const NavigationBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Notifications states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState("");

  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchCategory, setSearchCategory] = useState("user"); // 'user' or 'hashtag'
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  const userTabRef = useRef(null);
  const hashtagTabRef = useRef(null);
  const [underlineLeft, setUnderlineLeft] = useState("0px");
  const [underlineWidth, setUnderlineWidth] = useState("0px");

  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const activeRef = searchCategory === "user" ? userTabRef : hashtagTabRef;
    if (activeRef.current) {
      setUnderlineLeft(`${activeRef.current.offsetLeft}px`);
      setUnderlineWidth(`${activeRef.current.offsetWidth}px`);
    }
  }, [searchCategory]);

  // Helpers to open/close search panel
  const handleOpenSearch = () => {
    setShowSearch(true);
    setShowNotifications(false);

    setShowSearch(true);
    setSearchCategory("user");
    setShowNotifications(false);
  };
  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(v => !v);
    if (!showNotifications) {
      setShowSearch(false);
    }
  };

  // Fetch notifications when opened
  useEffect(() => {
    if (!showNotifications) return;

    const fetchNotifications = async () => {
      setNotifLoading(true);
      setNotifError("");
      try {
        const { data } = await axios.get(
          `${API}/api/notification/`
        );
        const likeNotifs = data.like || [];
        const commentNotifs = data.comment || [];
        const postNotifs = data.post || [];
        const followNotifs = data.follow || [];
        const postReportNotifs = data.postReport || [];
        const commentReportNotifs = data.commentReport || [];
        const genericNotifs = data.generic || [];

        console.log(genericNotifs);

        const all = [...likeNotifs, ...commentNotifs, ...postNotifs, ...followNotifs, ...postReportNotifs, ...commentReportNotifs, ...genericNotifs].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const enriched = await Promise.all(
          all.map(async notif => {
            let userID = null, text = null;

            if (notif.comment) {
              userID = notif.comment.userID;
              notif.type = "comment";
              const res = await axios.get(
                `${API}/api/comment/id/${notif.commentID}`
              );
              text = res.data.text;
            } else if (notif.like) {
              userID = notif.like.userID;
              notif.type = "like";
            } else if (notif.post) {
              userID = notif.post.userID;
              notif.type = "post";
            } else if (notif.follow) {
              userID = notif.follow.userID;
              notif.type = "follow";
            } else if (notif.postReport) {
              userID = notif.postReport.post.userID;
              notif.type = "postReport";
            } else if (notif.commentReport) {
              userID = notif.commentReport.comment.userID;
              notif.type = "commentReport";
            } else {
              text = notif.text;
              notif.type = "generic";
            }

            try {
              if (userID) {
                const resp = await axios.get(
                  `${API}/api/user/profile/preview/${userID}`
                );
                return { ...notif, username: resp.data.username, text };
              } else {
                return { ...notif, username: 'Admin', text };
              }

              
            } catch {
              return notif;
            }
          })
        );

        console.log(enriched);

        setNotifications(enriched);
      } catch (err) {
        setNotifError("Unable to load notifications.");
        console.log(err);
      } finally {
        setNotifLoading(false);
      }
    };

    fetchNotifications();
  }, [showNotifications]);

  // Mark viewed
  const handleView = async n => {
    try {
      await axios.post(
        `${API}/api/notification/view/${n.type}/${n.id}/`
      );
    } catch {}
  };

  // Delete
  const handleDelete = async n => {
    try {
      await axios.delete(
        `${API}/api/notification/${n.type}/${n.id}/`
      );
      setNotifications(prev => prev.filter(item => item !== n));
    } catch {}
  };

  // Search effect
  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length < 1) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      setSearchError("");
      try {
        let url;
        if (searchCategory === "user") {
          url = `${API}/api/user/profile/preview/partial_username/${encodeURIComponent(searchQuery)}`;
        } else {
          url = `${API}/api/hashtag/partial_name/${encodeURIComponent(searchQuery)}`;
        }
        const { data } = await axios.get(url);
        const raw = data || [];
  
        // 2) if we're in "user" mode, fetch each user's profilePhoto
        const enriched = await Promise.all(
          raw.map(async (r) => {
            if (searchCategory === "user") {
              // preview gave you profilePhotoID
              if (r.profilePhotoID) {
                const imgRes = await axios.get(
                  `${API}/api/image/${r.profilePhotoID}`
                );
                return { ...r, profilePhoto: imgRes.data };
              }
            }
            return r;
          })
        );


        console.log(enriched);
  
        setSearchResults(enriched);
      } catch {
        setSearchError("Search failed.");
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };
    fetchResults();
  }, [searchQuery, searchCategory]);  

  return (
    <>
      <Navbar bg="light" fixed="bottom" className="app-navbar glass-nav">
        <Container className="d-flex justify-content-around">
          <Nav>
          {user?.role === "Admin" ? (
            <Nav.Link
              as="button"
              onClick={() => navigate("/admin/stats")}
              className="nav-link"
              style={{ background: "none", border: "none" }}
              title="View statistics"
            >
              <FaChartBar size={24} />
            </Nav.Link>
          ) : (
            <NavLink to="/home" className="nav-link">
              <FaHome size={24} />
            </NavLink>
          )}

            {user && user.role !== "Admin" && (
              <>
                <Nav.Link
                  as="button"
                  onClick={() => navigate("/explore")}
                  className="nav-link"
                  style={{ background: "none", border: "none" }}
                  title="Explore"
                >
                  <FaCompass size={24} />
                </Nav.Link>
              </>
            )}


            {user && user.role === "Admin" ? (
              <Nav.Link
                as="button"
                onClick={() => navigate("/admin/reports")}
                className="nav-link"
                style={{ background: "none", border: "none" }}
                title="Resolve reports"
              >
                <FaFlag size={24} />
              </Nav.Link>
            ) : (
              <NavLink to="/post" className="nav-link">
                <FaPlusSquare size={24} />
              </NavLink>
            )}


            <Nav.Link
              as="button"
              onClick={handleOpenSearch}
              className="nav-link"
              style={{ background: "none", border: "none" }}
            >
              <FaSearch size={24} />
            </Nav.Link>
            <Nav.Link
              as="button"
              onClick={toggleNotifications}
              className="nav-link"
              style={{ background: "none", border: "none" }}
            >
              <FaBell size={24} />
            </Nav.Link>
            {user && user.role !== "Admin" &&  (
              <NavLink to={`/profile/${user.username}`} className="nav-link">
                <FaUser size={24} />
              </NavLink>
            )}

              {user?.role === "Admin" && (
                <>
                <Nav.Link
                  as="button"
                  onClick={() => navigate("/admin/users")}
                  className="nav-link"
                  style={{ background: "none", border: "none" }}
                  title="View all users"
                >
                  <FaUsers size={24} />
                </Nav.Link>
                <Nav.Link
                  as="button"
                  onClick={() => navigate("/admin/add/user")}
                  className="nav-link"
                  style={{ background: "none", border: "none" }}
                  title="Create user"
                >
                  <FaUserPlus size={24} />
                </Nav.Link>

              </>
              )}
          </Nav>
        </Container>

      </Navbar>

      

      {/* Search Offcanvas */}
      <Offcanvas
        show={showSearch}
        onHide={handleCloseSearch}
        placement="top"
        style={{
          width: "50%",
          height: "50%",
          margin: "0 auto",
          top: 0,
          borderRadius: "2.5rem",
          overflow: "hidden",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          padding: "20px 24px"
        }}
      >
        <Offcanvas.Header closeButton className="justify-content-center">
          <Offcanvas.Title className="w-100 text-center">
            Search
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="search-tab-container mb-3">
            <Button
              ref={userTabRef}
              className={`search-tab-btn ${searchCategory === "user" ? "active" : ""}`}
              onClick={() => setSearchCategory("user")}
            >
              User
            </Button>
            <Button
              ref={hashtagTabRef}
              className={`search-tab-btn ${searchCategory === "hashtag" ? "active" : ""}`}
              onClick={() => setSearchCategory("hashtag")}
            >
              Hashtag
            </Button>

            <div
              className="search-tab-underline"
              style={{
                left: underlineLeft,
                width: underlineWidth
              }}
            />
          </div>



          <div className="mb-3">
            <div style={{ position: "relative", width: "100%", maxWidth: "400px", margin: "0 auto" }}>
              <FaSearch style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#999",
                fontSize: "1rem"
              }} />
              <input
          type="text"
          className="form-control search-input"
          placeholder={
            searchCategory === "user"
              ? "Search usernames..."
              : "Search hashtags..."
          }
          style={{
            paddingLeft: "2rem",  // asta ca să nu intre textul sub lupa!
            borderRadius: "50px",  // mai rotunjit, gen pill
            border: "1px solid #ddd",
            boxShadow: "none"
          }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

            </div>
          </div>

          {searchLoading && <Spinner animation="border" />}
          {searchError && <Alert variant="danger">{searchError}</Alert>}

          {!searchLoading &&
            !searchError &&
            searchResults.length > 0 && (
            <ListGroup variant="flush">
              {searchResults.map((res, idx) => (
                <ListGroup.Item
                  key={idx}
                  action
                  onClick={() => {
                    handleCloseSearch();
                    if (searchCategory === "user") {
                      navigate(`/profile/${res.username}`);
                    } else {
                      navigate(`/posts/hashtag/${encodeURIComponent(res.name)}`);
                    }
                  }}
                >
                  {searchCategory === "user" ? (
                    // ---- USER ROW ----
                    <div className="d-flex align-items-center">
                      <BootstrapImage
                        src={
                          res.profilePhoto && res.profilePhoto.data
                            ? `data:image/jpeg;base64,${res.profilePhoto.data}`
                            : "/userPhoto.png"
                        }
                        roundedCircle
                        width={40}
                        height={40}
                        className="me-3"
                        alt={res.username}
                      />
                      <div>
                        <strong>{res.username}</strong>
                        <br />
                        <small className="text-muted">User</small>
                      </div>
                    </div>
                  ) : (
                    // ---- HASHTAG ROW ----
                    <div className="d-flex align-items-center">
                      <span className="fs-5 me-3">#{res.name}</span>
                      <div>
                        <strong>#{res.name}</strong>
                        <br />
                        <small className="text-muted">Hashtag</small>
                      </div>
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>

            )}

          {!searchLoading &&
            !searchError &&
            searchQuery.length >= 1 &&
            searchResults.length === 0 && (
              <div className="text-center text-muted">No results</div>
            )}
        </Offcanvas.Body>
      </Offcanvas>

      

      {/* Notifications Offcanvas */}
      <Offcanvas
        show={showNotifications}
        onHide={() => setShowNotifications(false)}
        placement="bottom"
        style={{
          width: "30%",
          height: "30%",
          margin: "0 auto",
          bottom: 0,
          borderRadius: "2.5rem",
          overflow: "hidden",
        }}
      >
        <Offcanvas.Header closeButton className="justify-content-center">
          <Offcanvas.Title className="w-100 text-center">
            Notifications
          </Offcanvas.Title>
        </Offcanvas.Header>


        <Offcanvas.Body>
          {notifLoading && <Spinner animation="border" />}
          {notifError && <Alert variant="danger">{notifError}</Alert>}
          {!notifLoading && !notifError && (
            <>
              {notifications.length > 0 ? (
                <ListGroup variant="flush">
                  {notifications.map((n, idx) => {
                    const time = new Date(n.createdAt).toLocaleString();
                    let text;
                    if (n.type === "comment")
                      text = `${n.username} commented: "${n.text}"`;
                    else if (n.type === "like")
                      text = `${n.username} liked your post.`;
                    else if (n.type === "post")
                      text = `${n.username} posted a new photo.`;
                    else if (n.type === "follow")
                      text = `${n.username} started following you.`;
                    else if (n.type === "postReport")
                      text = `A post of ${n.username}'s has been reported.`;
                    else if (n.type === "commentReport")
                      text = `A comment of ${n.username}'s has been reported.`;
                    else if (n.type === "generic")
                      text = n.text;
                    return (
                      <ListGroup.Item
                        key={idx}
                        action
                        style={{
                          backgroundColor: n.isRead
                          ? 'rgba(0, 0, 0, 0.05)'   // read = slightly darker
                          : 'transparent'
                        }}
                        onClick={async () => {
                          await handleView(n);
                          setShowNotifications(false);
                          if (n.type === "follow") {
                            navigate(`/profile/${n.username}`);
                          } else if (n.type === "like" || n.type === "comment" || n.type === "postReport") {
                            navigate(`/post/${n[n.type].postID}`);
                          } else if (n.type === "post") {
                            navigate(`/post/${n.postID}`);
                          } else if (n.type === "commentReport") {
                            navigate(`/post/${n.commentReport.comment.postID}`);
                          }
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            {text}
                            <br />
                            <small className="text-muted">{time}</small>
                          </div>
                          <Button
                            as="span"
                            variant="outline-danger"
                            size="sm"
                            onClick={async e => {
                              e.stopPropagation();
                              await handleDelete(n);
                            }}
                          >
                            ❌
                          </Button>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              ) : (
                <div className="text-center text-muted">
                  No new notifications
                </div>
              )}
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default NavigationBar;
