import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Row, Col } from "react-bootstrap";
import { Image as BootstrapImage } from "react-bootstrap";
import axios from "axios";

const HashtagPage = () => {
  const { hashtag } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  useEffect(() => {
    const fetchHashtagPosts = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch posts by hashtag
        const resp = await axios.get(
          `${API}/api/post/hashtag/${encodeURIComponent(hashtag)}/`
        );
        const postsData = await Promise.all(
          resp.data.map(async (post) => {
            const imgResp = await axios.get(
              `${API}/api/image/${post.photoID}`
            );
            return { ...post, imageData: imgResp.data.data };
          })
        );
        setPosts(postsData);
      } catch (err) {
        console.error(err);
        setError("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchHashtagPosts();
  }, [hashtag]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <div className="feed-animated-bg">
      <Container
        className="mt-4"
        style={{ paddingRight: "10%", paddingLeft: "10%", marginBottom: "20%" }}
      >
        <Card className="glass-card shadow-lg text-center p-4">
          <h3 className="mb-4">#{hashtag}</h3>
          <Row className="justify-content-start">
            {posts.length === 0 ? (
              <p className="text-center w-100">No posts for this hashtag.</p>
            ) : (
              posts.map((post) => (
                <Col key={post.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <Card className="h-100">
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        overflow: "hidden",
                        borderRadius: "1rem"
                      }}
                    >
                      <BootstrapImage
                        src={`data:image/jpeg;base64,${post.imageData}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          cursor: "pointer"
                        }}
                        onClick={() => navigate(`/post/${post.id}`)}
                      />
                    </div>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default HashtagPage;
