import { useEffect, useState, useRef  } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Button, Row, Col, Form, InputGroup, Modal, Toast, ToastContainer, Spinner, Badge } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { FaChevronRight, FaPaperPlane, FaChartBar, FaTrashAlt, FaHeart, FaRegHeart, FaEye, FaEyeSlash, FaFlag, FaChevronLeft } from 'react-icons/fa';
import { Image as BootstrapImage } from "react-bootstrap";
import { canDeletePost,
         canDeleteComment } from "../utils/checkPermission.js";
import { checkTextForBannedWords } from "../utils/checkIntegrity.js";


const Feed = () => {
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [postImage, setPostImage] = useState(null);
  const [comments, setComments] = useState([]);
  const [regions, setRegions] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [boolCanDeletePost, setBoolCanDeletePost] = useState(false);
  const [isPostFetched, setIsPostFetched] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [reportedComments, setReportedComments] = useState(new Set());
  const [myComments, setMyComments] = useState(new Set());
  const [reportedPost, setReportedPost] = useState(false);
  const [isMyPost, setIsMyPost] = useState(false);
  const [isEndPost, setIsEndPost] = useState(false);
  const [noMorePosts, setNoMorePosts] = useState(false);


  const [loadedPosts, setLoadedPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [bubble, setBubble] = useState({
    show: false,
    x: 0,
    y: 0,
    text: ""
  });
  


  const API = process.env.REACT_APP_BACKEND_BASE_URL;



  useEffect(() => {
    (async () => {
      try {
        await axios.get(`${API}/api/post/feed/reset/`);
      } catch (err) {
        console.error("Failed to reset feed:", err);
      }
      loadNextPost();
    })();
  }, []);
  

  // which post/comment is in “report mode” right now
  const [reportingItem, setReportingItem] = useState(null);
  // “post” or commentID for comments
  const [reportingType, setReportingType] = useState(null);
  // whether reason‐picker is shown
  const [showReasonModal, setShowReasonModal] = useState(false);
  // selected reason
  const [selectedReason, setSelectedReason] = useState("");

  const [showToast, setShowToast] = useState(false);

  const REPORT_REASONS = [
    "Inappropriate Content",
    "Spam",
    "Harassment",
    "Other"
  ];

  const { user } = useAuth();

  const isAdmin = user?.role === "Admin";

  const [likesCount, setLikesCount] = useState(0);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(false);

  const [isImageReady, setIsImageReady] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const [hoveredRegionIndex, setHoveredRegionIndex] = useState(null);
  // pt butonul care ascunde regiunile
  const [showRegions, setShowRegions] = useState(true);


  const imgRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const [scaleX, setScaleX] = useState(null);
  const [scaleY, setScaleY] = useState(null);

  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);

  const [loadingPost, setLoadingPost] = useState(false);
  const [hashtags, setHashtags] = useState([]);




  // 2a) Initialize post report
  const initializePostReport = async (postId) => {


    const url = isAdmin
          ? `${API}/api/postReport/post/${postId}`
          : `${API}/api/postReport/currentUser/post/${postId}`;

    const { data: postReport } = await axios.get(url);

    if (isAdmin) {
      return Array.isArray(postReport) && postReport.length > 0;
    } else {
      if (postReport !== null) {
        if (postReport.owned) {
          setIsMyPost(true);
          return true;
        } else {
          setReportedPost(true);
          return true;
        }
      } else {
        setReportedPost(false);
        return false;
      }
    }
  };

  // 2b) Initialize comment reports, given an array of comments
  const initializeCommentReports = async (comments) => {
    const reported = new Set();
    const owned = new Set();
    await Promise.all(
      comments.map(async (c) => {
        try {
          const url = isAdmin
          ? `${API}/api/commentReport/comment/${c.id}`              // returns an array of all reports
          : `${API}/api/commentReport/currentUser/comment/${c.id}`;

          const { data: cr } = await axios.get(url);

          if (isAdmin) {
            if (Array.isArray(cr) && cr.length > 0)
              reported.add(c.id);
          } else {
            if (cr) {

              if (cr.owned) {
                owned.add(c.id);
              } else {
                reported.add(c.id);
              }
            }
          }
 
        } catch (err) {
          // ignore 404 (no report), log other errors
        }
      })
    );

    setReportedComments(reported);
    setMyComments(owned);

    return {reported, owned};
  };


  const restoreSnapshot = snap => {
    setPost(snap.post);
    setProfile(snap.profile);
    setProfilePicture(snap.profilePicture);
    setPostImage(snap.postImage);
    setRegions(snap.regions);
    setComments(snap.comments);
    setLikesCount(snap.likesCount);
    setLikedByCurrentUser(snap.likedByCurrentUser);
    setReportedPost(snap.reportedPost);
    setIsMyPost(snap.isMyPost);
    setReportedComments(snap.reportedComments);
    setMyComments(snap.myComments);
    setHashtags(snap.hashtags);
  };


  const handleRegionClick = async (e, idx, region) => {
    e.preventDefault();
  
    // report only if not owner/admin
    if (post.userID !== user.userID && profile.role !== 1) {
      await axios.post(`${API}/api/viewedRegion/`, {
        postID: post.id,
        type: region.link ? "link" : "description"
      });
    }
  
    if (region.link) {
      // normal link behavior
      window.open(region.link, "_blank");
      // hide any bubble
      setBubble(b => ({ ...b, show: false }));
    }
  };


  const loadPreviousPost = () => {
    // nothing to go back to?
    if (currentIndex <= 0) return;
  
    const prevIndex = currentIndex - 1;
    const snap = loadedPosts[prevIndex];
  
    restoreSnapshot(snap);
    setCurrentIndex(prevIndex);
    setIsEndPost(false);
  };

  const loadNextPost = async () => {
    const nextIndex = currentIndex + 1;

    setLoadingPost(true);
  
    // 1) If we already loaded that snapshot, just show it
    if (nextIndex < loadedPosts.length) {
      const snap = loadedPosts[nextIndex];
      restoreSnapshot(snap);
      setCurrentIndex(nextIndex);
      setIsEndPost(false);
      return;
    }
  
    // 2) Otherwise fetch one more post from the server
    try {
      setIsImageReady(false);
      setPostImage(null);
      setRegions([]);
      setComments([]);
  
      const { data: nextPost } = await axios.get(`${API}/api/post/feed/`);
      if (!nextPost || Object.keys(nextPost).length === 0) {
        setIsEndPost(true);
        setNoMorePosts(true);
        setCurrentIndex(nextIndex);

        // clear UI
        setPost(null);
        setProfile(null);
        setProfilePicture(null);
        setPostImage(null);
        setComments([]);
        setRegions([]);
        setLikesCount(0);
        setLikedByCurrentUser(false);
        setReportedPost(false);
        setIsMyPost(false);
        setHashtags([]);
        return;
      }
  
      // fetch all the details just like before...
      const [{ data: prof }, { data: imgData }] = await Promise.all([
        axios.get(`${API}/api/user/profile/preview/${nextPost.userID}`),
        axios.get(`${API}/api/image/${nextPost.photoID}`)
      ]);
      let pic = null;
      if (prof.profilePhotoID) {
        const { data } = await axios.get(`${API}/api/image/${prof.profilePhotoID}`);
        pic = data;
      }
      const regionsData = JSON.parse(imgData.metadata);
      const loadedComments = await getComments(nextPost.id);
      const likeRes = await axios.get(`${API}/api/like/${nextPost.id}`);
      const likesArr = likeRes.data;
      const hashtagRes = await axios.get(`${API}/api/hashtag/${nextPost.id}`);
      const hashtagsArr = hashtagRes.data;
      const reportedPostFlag = await initializePostReport(nextPost.id);
      const { reported, owned } = await initializeCommentReports(loadedComments);
      const snap = {
        post:             nextPost,
        profile:          prof,
        profilePicture:   pic,
        postImage:        imgData,
        regions:          regionsData,
        comments:         loadedComments,
        likesCount:       likesArr.length,
        likedByCurrentUser: likesArr.some(l => l.userID === user.userID),
        reportedPost:     reportedPostFlag,
        isMyPost:         nextPost.userID === user.userID,
        reportedComments: reported,
        myComments:       owned,
        hashtags: hashtagsArr
      };
  
      // add it to our array & show it
      setLoadedPosts(arr => [...arr, snap]);
      setCurrentIndex(nextIndex);
      restoreSnapshot(snap);
      setIsPostFetched(true);
      setShowRegions(true);
      setIsEndPost(false);
  
    } catch (err) {
      if (err.response?.status === 404) {
        setIsEndPost(true);
        setNoMorePosts(true);
        setPost(null);
        setProfile(null);
        setProfilePicture(null);
        setPostImage(null);
        setComments([]);
        setRegions([]);
        setLikesCount(0);
        setLikedByCurrentUser(false);
        setReportedPost(false);
        setIsMyPost(false);
        setHashtags([]);
      } else {
        console.error("Error loading next post:", err);
      }
    } finally {
      setLoadingPost(false)
    }
  };

  const updateScale = () => {
      if (imgRef.current && imgRef.current.naturalWidth > 0) {

        const clientW = imgRef.current.clientWidth;
        const clientH = imgRef.current.clientHeight;
        const naturalW = imgRef.current.naturalWidth;
        const naturalH = imgRef.current.naturalHeight;

        setScaleX(clientW / naturalW);
        setScaleY(clientH / naturalH);
        setImgDimensions({ width: clientW, height: clientH });
        
        setIsImageReady(true);
      }
    };


  const handleImageLoad = () => {
    updateScale();
  };

  useEffect(() => {

    if (!isImageReady) return;
    const imgEl = imgRef.current;

    if(!imgEl) return; 
    //updateScale();
////////
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    const observer = new ResizeObserver(() => {
      // De fiecare dată când `<img>` își schimbă dimensiunea,
      // recalculează scaleX/scaleY + imgDimensions
      updateScale();
    });
    
    observer.observe(imgEl);
    resizeObserverRef.current = observer;
  /////////
    //window.addEventListener("resize", updateScale);
  
    //updateScale();
  
    return () => {
      //window.removeEventListener("resize", updateScale);
      observer.disconnect();
      resizeObserverRef.current = null;
    };
  }, [isImageReady]);

  const getComments = async (postID) => {
      try {
        const commentsResponse = await axios.get(
          `${API}/api/comment/${postID}`
        );
  
        const formattedComments = await Promise.all(
          commentsResponse.data.map(async (comment) => {
            let profilePhoto = null;
            if (comment.author.profilePhotoID) {
              const profilePicResponse = await axios.get(
                `${API}/api/image/${comment.author.profilePhotoID}`
              );
              profilePhoto = profilePicResponse.data;
            }

            const result = await canDeleteComment(postID, comment.id);
  
            return {
              id: comment.id,
              username: comment.author.username,
              text: comment.text,
              canDelete: result,
              postedAt: new Date(comment.postedAt).toISOString(),
              profilePhoto: profilePhoto, // Adăugăm poza de profil
            };
          })
        );
  
        setComments(formattedComments);
        return formattedComments;
      } catch(err) {
        console.log(`Error while receiving comments: ${err}`);
      }
  };

  const handleLike = async () => {
    try {
      if (!likedByCurrentUser) {
        await axios.post(`${API}/api/like/create/`, {
          postID: post.id,
        });
        setLikedByCurrentUser(true);
        setLikesCount((prev) => prev + 1);

        setLoadedPosts(arr => {
          const copy = [...arr];
          const snap = { ...copy[currentIndex] };
          snap.likesCount = snap.likesCount + 1;
          snap.likedByCurrentUser = true;
          copy[currentIndex] = snap;
          return copy;
        });

         const likeBtn = document.querySelector('.feed-btn-like');
          if (likeBtn) {
            likeBtn.style.transform = 'scale(1.3)';
            setTimeout(() => {
              likeBtn.style.transform = 'scale(1)';
            }, 200);
          }
      } else {
        await axios.delete(`${API}/api/like/${post.id}/`);
        setLikedByCurrentUser(false);
        setLikesCount((prev) => Math.max(prev - 1, 0));
        setLoadedPosts(arr => {
          const copy = [...arr];
          const snap = { ...copy[currentIndex] };
          snap.likesCount = Math.max(snap.likesCount - 1, 0);
          snap.likedByCurrentUser = false;
          copy[currentIndex] = snap;
          return copy;
        });
        console.log("Post disliked!");
      }
    } catch (error) {
      console.error("Error liking/disliking post:", error);
    }
  };

  const handleDeleteComment = async (commentID) => {
    try {
      await axios.delete(
        `${API}/api/comment/${post.id}/${commentID}/`,
        {
        }
      );

      setLoadedPosts(arr => {
        const copy = [...arr];
        const snap = { ...copy[currentIndex] };
        snap.comments = snap.comments.filter(c => c.id !== commentID);
        snap.reportedComments = new Set(
          [...snap.reportedComments].filter(id => id !== commentID)
        );
        snap.myComments = new Set(
          [...snap.myComments].filter(id => id !== commentID)
        );
        copy[currentIndex] = snap;
        return copy;
      });

      setMyComments(prev => {
        const next = new Set(prev);
        next.delete(commentID);
        return next;
      });

      setComments(prev => prev.filter(c => c.id !== commentID));

      console.log("Comment deleted!");
      //getComments(post.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;


    // Validate against banned words
    try {
      const badComment = await checkTextForBannedWords(newComment);

      if (badComment) {
        setShowToast(true);
        // window.alert(
        //   "Your comment contains forbidden words. Please remove them before posting."
        // );
        return;
      }
    } catch (err) {
      console.error('Validation error:', err);
      window.alert("Validation failed. Please try again.");
      return;
    }

    try {
      const comment = await axios.post(
        `${API}/api/comment/create/`,
        {
          postID: post.id,
          text: newComment,
        },
        {
        }
      );

      const { data: completeComment} = await axios.get(`${API}/api/comment/id/${comment.data.id}`);

      let profilePhoto = null;
      if (completeComment.author.profilePhotoID) {
        const pic = await axios.get(
          `${API}/api/image/${completeComment.author.profilePhotoID}`
        );
        profilePhoto = pic.data;
      }

      const newC = {
        id: completeComment.id,
        username: completeComment.author.username,
        text: completeComment.text,
        canDelete: completeComment.userID === user.userID,   // only you can delete
        postedAt: new Date(completeComment.postedAt).toISOString(),
        profilePhoto
      };
  
      setComments(prev => [...prev, newC]);
      setMyComments(prev => new Set(prev).add(newC.id));
  

      setLoadedPosts(arr => {
        const copy = [...arr];
        const snap = { ...copy[currentIndex] };
        snap.comments   = [...snap.comments, newC];
        snap.myComments = new Set(snap.myComments).add(newC.id);
        copy[currentIndex] = snap;
        return copy;
      });

      // Reincarca postarea si comentariile
      //getComments(post.id);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  if (!isPostFetched && !isEndPost) {
    return (
      <Container className="my-4 d-flex justify-content-center">
        <Spinner animation="border" />
      </Container>
    );
  }
  

  return (

    <div className="feed-animated-bg"> 
    <Container className="my-4 d-flex justify-content-center">
      <Card className="glass-card shadow-lg" style={{
        width: "90%",
        minHeight: "87vh",
        maxHeight: "95vh",
        overflowY: "auto",
        borderRadius: "80px",
        padding: "2rem",
        position: "relative",
        border: reportedPost && isAdmin ? "2px solid #dc3545" : undefined
      }}>

      {/* {loadingPost && (
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(255,255,255,0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              borderRadius: 'inherit'
            }}
          >
            <Spinner animation="border" />
          </div>
        )}
     */}
  
    {isEndPost ? (
        // Show end-of-feed message *inside* the same layout
        <div className="w-100 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
          <FaEyeSlash size={48} className="mb-3 text-muted" />
          <Card.Title className="mb-2">No more posts available</Card.Title>
          <Card.Text className="text-secondary mb-4">
            You've reached the end of your feed.
          </Card.Text>
        </div>
      ) : (
        <>
          {/* Profilul utilizatorului care a postat */}
          {profile && (
            <Row className="align-items-center justify-content-start mb-3 ms-3">
              <Col xs="auto" className="d-flex align-items-center gap-2">
                <BootstrapImage
                  src={
                    profilePicture && profilePicture.data
                      ? `data:image/jpeg;base64,${profilePicture.data}`
                      : "/userPhoto.png"
                  }
                  roundedCircle
                  width={50}
                  height={50}
                  alt="Profile"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/profile/${profile.username}`)}
                />
              <span
                  style={{
                    fontSize: "1.1rem",    // mai mic
                    fontWeight: "500",
                    cursor: "pointer",
                    color: "#333"
                  }}
                  onClick={() => navigate(`/profile/${profile.username}`)}
                >
                  {profile.username}
                </span>
              </Col>
            </Row>
          )}

          <Row>
            {/* Coloana pentru imaginea postării */}
          
            <Col md={8} className="d-flex flex-column align-items-center"
              //style={{backgroundColor: "black"}}
            >
            
              <div style={{
                position: "relative",
                display: "inline-block",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#FFF"
              }}>
                {postImage && (
                  <img
                    ref={imgRef}
                    src={`data:image/jpeg;base64,${postImage.data}`}
                    alt="Post"
                    className="img-fluid" // mb-3
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "auto",
                      maxHeight: "70vh",
                      display: "block"
                    }}
                    onLoad={handleImageLoad}
                  />
                  
                )}

                <svg
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${imgDimensions.width}px`,     // aceeași lățime ca img
                    height: `${imgDimensions.height}px`, 
                  }}
                  fill="red"
                  viewBox={`0 0 ${width} ${height}`}
                >
                  {showRegions && isImageReady && regions.length > 0 && scaleX && scaleY &&
                    regions.map((region, index) => {
                      const normalOpacity = 0.01;
                      const hoverOpacity = 0.1;
                      const fillOpacity = index === hoveredRegionIndex ? hoverOpacity : normalOpacity;

                      return (
                        <a
                          // 2) Wrapping cu <a> (SVG) pentru link-ul regiunii:
                          //    folosește xlinkHref (sau href) ca să fie clickabil
                          key={index}
                          xlinkHref={region.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={async e => {
                            e.preventDefault();

                            await handleRegionClick(e, index, region);

                            // only show description bubbles on click
                            if (!region.link) {
                              const pts = region.points;
                              const cx = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
                              const cy = pts.reduce((sum, p) => sum + p.y, 0) / pts.length;
                              setBubble({
                                show: true,
                                x: cx * scaleX,
                                y: cy * scaleY,
                                text: region.description
                              });
                            } else {
                              // link behavior
                              window.open(region.link, "_blank");
                              setBubble(b => ({ ...b, show: false }));
                            }
                          }}
                          onMouseLeave={() => {
                            // hide bubble as soon as cursor leaves
                            setBubble(b => ({ ...b, show: false }));
                          }}
                        >
                      <polygon
                        key={index}
                        points={region.points.map((p) => `${p.x * scaleX},${p.y * scaleY}`).join(" ")}
                        fill={`rgba(200, 200, 200, ${fillOpacity})`}
                        //stroke="none"
                        stroke={`rgba(255,255,255,0.2)`}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHoveredRegionIndex(index)}
                        onMouseLeave={() => setHoveredRegionIndex(null)}
                      >
                        <title>{region.link}</title>
                      </polygon>
                      </a>
                      );
                        //strokeWidth="0"
                    
                    })
                  }
                </svg>
                {bubble.show && (
                  <div
                    style={{
                      position: "absolute",
                      top: bubble.y,
                      left: bubble.x,
                      transform: "translate(-50%, -110%)",
                      background: "rgba(0,0,0,0.75)",
                      color: "#fff",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.5rem",
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                      zIndex: 1000
                    }}
                  >
                    {bubble.text}
                  </div>
                )}
                {!reportedPost && !isMyPost && !isAdmin && (
                <button
                  className="report-button"
                  onClick={ () => {
                    setReportingType("post");
                    setReportingItem(post.id);
                    setShowReasonModal(true);}
                  }
                  style={{
                    position: "absolute",
                    bottom: "12px",   // în loc de top
                    right: "12px"     // colțul dreapta
                  }}
                >
                  <FaFlag style={{ marginBottom: "2px" }} />
                </button>
                )}
              </div>
              <div style={{ marginTop: "8px" }}>
                <Form.Check
                  type="switch"
                  id="toggleRegions"
                  label={showRegions ? "Hide regions" : "Show regions"}
                  checked={showRegions}
                  onChange={() => setShowRegions(!showRegions)}
                  style={{
                    fontSize: "0.9rem",
                    color: "#555"
                  }}
                />
                


              </div>
              
            </Col>

            {/* Coloana pentru comentarii */}
            <Col md={4} className="d-flex flex-column justify-content-center align-items-center">
              <div style={{
                  fontWeight: "500",   // puțin mai bold
                  fontSize: "1.1rem",  // un pic mai mare
                  textAlign: "center", // centrat pe coloană
                  marginBottom: "1rem", // spațiu sub descriere
                  color: "#444"  // o nuanță mai soft decât negru pur
                }}>
                  {post.description}
                </div>

                {hashtags?.length > 0 && (
                  <div className="mb-4">
                    {hashtags.map(tag => (
                      <Badge bg="secondary" 
                      className="me-1" 
                      key={tag.name}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/posts/hashtag/${tag.name}`)}>
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                )}


              <div className="feed-action-bar d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 mb-3">

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    // border: "1px solid #ddd",
                    // borderRadius: "20px",
                    // backgroundColor: "#fafafa",
                    fontSize: "1rem",
                    fontWeight: "500",
                    color: "#333"
                  }}
                >
                  {!isAdmin && (
                  <Button
                    className="feed-btn-like"
                    variant="outline-light"
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "1.8rem",
                      color: likedByCurrentUser ? "#ff4d4d" : "#aaa",
                      padding: 0
                    }}
                    onClick={handleLike}
                  >
                    {likedByCurrentUser ? <FaHeart /> : <FaRegHeart />}
                  </Button>
                  )}
                  {likesCount}
                </div>

                {post?.userID === user?.userID && (
                  <Button
                    className="feed-btn-like"
                    variant="outline-light"
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.8rem',
                      color: '#aaa',
                      padding: 0
                    }}
                    onClick={() => navigate(`/post/${post.id}/stats`)}
                    title="View statistics"
                  >
                    <FaChartBar />
                  </Button>
                )}

              </div>

              {/* Secțiunea de comentarii */}
              <Card className="card-comentarii shadow-sm mt-4">
        <Card.Body className="p-3">
          <h5 className="mb-3">Comments</h5>
      {/* Container scrollabil pentru comentarii */}
      <div className="comment-list">
        {(!comments || comments.length === 0) ? (
          <p className="text-muted">No comments yet</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} 
            className="comment-item"
            style={{
                backgroundColor: reportedComments.has(comment.id) && isAdmin
                              ? "rgba(220,53,69,0.1)"
                              : undefined
                                }}
            >
              {/* Avatar */}
              <BootstrapImage
                src={
                  comment.profilePhoto && comment.profilePhoto.data
                    ? `data:image/jpeg;base64,${comment.profilePhoto.data}`
                    : "/userPhoto.png"
                }
                roundedCircle
                width={40}
                height={40}
                alt="User"
                onClick={() => navigate(`/profile/${comment.username}`)}
                className="me-2 click-avatar"
              />

              {/* Continut comentariu */}
              <div className="comment-content">
                {/* Nume utilizator + dată, pe două rânduri */}
                <div className="comment-header">
                  <strong
                    className="click-username"
                    onClick={() => navigate(`/profile/${comment.username}`)}
                  >
                    {comment.username}
                  </strong>
                  <small className="comment-date text-muted">
                    {new Date(comment.postedAt).toLocaleString()}
                  </small>
                </div>

                {/* Textul comentariului */}
                <p className="comment-text mb-1 text-break">
                  {comment.text}
                </p>
              </div>

              {/* Buton delete */}
              {comment.canDelete && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="btn-delete-comment"
                  title="Delete comment"
                >
                  <FaTrashAlt />
                </Button>
              )}
              {/* Buton raportare */}
              {!reportedComments.has(comment.id) && !myComments.has(comment.id) && !isAdmin && (
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="report-button"
                  onClick={() => {
                    setReportingType("comment");
                    setReportingItem(comment.id);
                    setShowReasonModal(true);
                  }}
                >
                  <FaFlag />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

        {/* input + icon send */}
        {!isAdmin && (
          <InputGroup className="mt-3 comment-input-group">
          <Form.Control
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCommentSubmit(e); }}
            className="comment-input"
          />
          <InputGroup.Text
            as={Button}
            variant="link"
            onClick={handleCommentSubmit}
            className="comment-send-btn"
          >
            <FaPaperPlane />
          </InputGroup.Text>
        </InputGroup>
        )}

        </Card.Body>

        <Modal
        show={showReasonModal}
        onHide={() => setShowReasonModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Report {reportingType === "post" ? "Post" : "Comment"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            {REPORT_REASONS.map(reason => (
              <Form.Check
                key={reason}
                type="radio"
                label={reason}
                name="reportReason"
                id={`reason-${reason}`}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
              />
            ))}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReasonModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!selectedReason}
        onClick={async () => {
          // se trimite catre backend
          if (reportingType === "post") {
            
            await axios.post(`${API}/api/postReport/create`, {
              postID: reportingItem,
              reason: selectedReason
            });

            setReportedPost(true);

            setLoadedPosts(posts => {
              const copy = [...posts];
              const snap = {...copy[currentIndex], reportedPost: true };
              copy[currentIndex] = snap;
              return copy;
            });

          } else {
            const { data } = await axios.post(
              `${API}/api/commentReport/create`,
              { postID: post.id, commentID: reportingItem, reason: selectedReason }
            );
            setReportedComments(prev => new Set(prev).add(reportingItem));
          }
          // cleanup
          setShowReasonModal(false);
          setSelectedReason("");
          setReportingItem(null);
          setReportingType(null);
        }}
          >
            Submit Report
          </Button>
        </Modal.Footer>
      </Modal>

        
      </Card>

            </Col>
          </Row>

        </>
      )}
    
    
  </Card>
    <button
      className="feed-back-arrow"
      onClick={loadPreviousPost}
      disabled={currentIndex <= 0}
      aria-label="Previous post"
      style={{
        position: "absolute",
        top: "50%",
        left: "1rem",
        transform: "translateY(-50%)",
        zIndex: 999
      }}
        > 
        <FaChevronLeft size={24} />
      </button>
    <button
          className="feed-next-arrow"
          onClick={loadNextPost}
          disabled={currentIndex >= loadedPosts.length - 1 && isEndPost}
          aria-label="Next post"
          style={{
            position: "absolute",     // scoate-l din flow
            top: "50%",               // vertical centrat
            right: "1rem",            // margine dreapta
            transform: "translateY(-50%)", // fix centru
            zIndex: 999               // deasupra oricărui conținut
          }}
        >
          <FaChevronRight size={24} />
      </button>

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
          Your comment contains forbidden words. Please remove them before posting.
        </Toast.Body>
      </Toast>
    </ToastContainer>
    

  </div>

  );

};

export default Feed;
