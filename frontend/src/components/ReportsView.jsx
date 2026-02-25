import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FaTrashAlt, FaCheck } from 'react-icons/fa';

const ReportsView = () => {
  const { user } = useAuth();
  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  const [postReports, setPostReports] = useState([]);
  const [commentReports, setCommentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {

    if (!user)
        return;

    if (user.role !== 'Admin') {
        setLoading(false);
        navigate('/not/found/');
        return;
    }

    (async () => {
      setLoading(true);
      try {
        const [prRes, crRes] = await Promise.all([
          axios.get(`${API}/api/postReport/all/`),
          axios.get(`${API}/api/commentReport/all/`)
        ]);

        const enrichedPostReports = await Promise.all(
          prRes.data.map(async (report) => {
            const imgRes = await axios.get(
              `${API}/api/image/${report.post.photoID}`
            );
            return {
              ...report,
              post: { ...report.post, data: imgRes.data.data }
            };
          })
        );

        setPostReports(enrichedPostReports);
        setCommentReports(crRes.data);
      } catch (e) {
        console.error(e);
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, API]);

  if (!user)
    return <Alert variant="danger">Access denied.</Alert>;

  if (loading) 
    return <Spinner animation="border" className="mt-5" />;

  if (error) 
    return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-4">
      {/* ——————————— Reported Posts ——————————— */}
      <Card
        className="shadow-lg mb-5"
        style={{
          height: "60vh",
          border:       "none",
          borderRadius: "2rem",
          background:  "linear-gradient(to right, #e0f7fa, #ffffff)",
          overflow: "hidden",
        }}
      >
        <Card.Header
          as="h4"
          className="text-center bg-transparent border-0"
        >
          Reported Posts
        </Card.Header>
        <Card.Body
        style={{
            display: "flex",
            gap: "1rem",
            padding: "1rem",
            flexWrap: "wrap", 
            overflowY: "auto",
            whiteSpace: "nowrap",
            height: "60vh",
        }}
        >
        {postReports.map(r => (
            <div
            key={r.post.id}
            style={{
                flex: "0 0 240px",
                height: "240px",
            }}
            >
            <Card
                className="shadow-sm"
                style={{
                width:  "100%",
                height: "100%",
                borderRadius: "1rem",
                overflow:     "hidden",
                }}
            >
                <div
                style={{
                    width:       "100%",
                    height:      "60%",        // give 60% of card to the image
                    overflow:    "hidden",
                }}
                >
                <img
                    src={`data:image/jpeg;base64,${r.post.data}`}
                    style={{
                    width:       "100%",
                    height:      "100%",
                    objectFit:   "cover",
                    cursor:      "pointer",
                    }}
                    onClick={() =>
                        navigate(`/post/${r.post.id}`)
                    }
                />
                </div>
                <Card.Body style={{ height: "40%", overflow: "hidden", position: "relative" }}>
                  <small className="text-muted">Reported by {r.reporter.username}</small>
                  <p className="mt-2 text-truncate">{r.reason}</p>
                  <div 
                    style={{
                      position: "absolute",
                      bottom: "0.5rem",
                      right: "0.5rem",
                      display: "flex",
                      gap: "0.5rem"
                    }}
                  >
                    
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await axios.delete(`${API}/api/postReport/${r.id}`);
                        setPostReports(pr => pr.filter(x => x.id !== r.id));
                      }}
                    >
                      <FaTrashAlt />
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await axios.delete(`${API}/api/post/admin/${r.post.id}/reportedBy/${r.reporterID}`);
                        setPostReports(pr => pr.filter(x => x.id !== r.id));
                      }}
                    >
                      <FaCheck />
                    </Button>
                  </div>
                </Card.Body>
            </Card>
            </div>
        ))}
        </Card.Body>

      </Card>

      {/* ————————— Reported Comments ———————— */}
      <Card
        className="shadow-lg mb-5"
        style={{
          border:       "none",
          borderRadius: "2rem",
          background:  "linear-gradient(to right, #e0f7fa, #ffffff)",
          overflow: "hidden",
        }}
      >
        <Card.Header
          as="h4"
          className="text-center bg-transparent border-0"
        >
          Reported Comments
        </Card.Header>
        <Card.Body
          style={{
            height: "60vh",
            overflowY: "auto",
            padding: "1rem"
          }}
        >
          <Row className="g-3">
            {commentReports.map(r => (
              <Col key={r.comment.id} xs={12} sm={6} md={4}>
                <Card
                  className="h-100 shadow-sm d-flex flex-column"
                  style={{
                    border: "none",
                    borderRadius: "1rem",
                    cursor: "pointer"
                  }}
                  onClick={() =>
                    navigate(`/post/${r.comment.postID}`)
                    }
                >
                  <Card.Body style={{ flex: 1 }}>
                    <small className="text-muted">Comment of {r.comment.author.username} was reported</small>
                    <p className="mt-2">{r.comment.text}</p>
                  </Card.Body>
                  <Card.Footer style={{ background: "transparent", borderTop: "none", position: "relative" }}>
                    <small className="text-muted">
                      Reported by {r.reporter.username}
                    </small>
                    <p className="mb-0"><em>{r.reason}</em></p>
                    <div 
                      style={{
                        position: "absolute",
                        bottom: "0.5rem",
                        right: "0.5rem",
                        display: "flex",
                        gap: "0.5rem"
                      }}
                    >
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await axios.delete(`${API}/api/commentReport/${r.id}`);
                          setCommentReports(cr => cr.filter(x => x.id !== r.id));
                        }}
                      >
                        <FaTrashAlt />
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await axios.delete(`${API}/api/comment/admin/${r.comment.id}/reportedBy/${r.reporterID}`);
                          setCommentReports(cr => cr.filter(x => x.id !== r.id));
                        }}
                      >
                        <FaCheck />
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ReportsView;
