import { Container, Card, Row, Col, Button,Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { FaCrown } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { useParams } from "react-router-dom";

const PostStats = () => {

  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const API = process.env.REACT_APP_BACKEND_BASE_URL;
  const { postID } = useParams();

  const [post, setPost] = useState(null);

  // Stats state
  const [totalViews, setTotalViews] = useState(0);
  const [totalLikes, setTotalLike] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [totalRegions, setTotalRegions] = useState(0);
  const [uniqueViews, setUniqueViews] = useState(0);

  const [views, setViews] = useState([]);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [regions,setRegions]= useState([]);

  // flattened & filled daily series
  const [viewsByTime, setViewsByTime] = useState([]);
  const [likesByTime, setLikesByTime] = useState([]);
  const [commentsByTime, setCommentsByTime] = useState([]);
  const [regionsByTime, setRegionsByTime] = useState([]);

  // demographics per section
  const [viewsDemo, setViewsDemo] = useState({ ageGroups:[], genderData:[] });
  const [likesDemo, setLikesDemo] = useState({ ageGroups:[], genderData:[] });
  const [commentsDemo, setCommentsDemo] = useState({ ageGroups:[], genderData:[] });
  const [regionsDemo, setRegionsDemo] = useState({ ageGroups:[], genderData:[] });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const resp = await axios.get(`${API}/api/user/profile/${user.userID}`);
        setProfile(resp.data);

        const post = await axios.get(`${API}/api/post/${postID}`);
        setPost(post.data);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchProfile();
  }, [user, postID]);


  const determineTimeUnit = (startDate, endDate) => {
    const diff = endDate.getTime() - startDate.getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    if (diff < oneDay) return 'hour';
    if (diff < 7 * oneDay) return 'halfDay';
    if (diff < 30 * oneDay) return 'day';
    return 'month';
  };
  
  const formatBucket = (date, unit) => {
    const d = new Date(date);
    switch (unit) {
      case 'hour':
        return d.getHours().toString().padStart(2, '0') + ':00';
      case 'halfDay': {
        const h = d.getHours();
        return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${h < 12 ? '00:00' : '12:00'}`;
      }
      case 'day':
        return d.toISOString().slice(0, 10);
      case 'month':
        return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
      default:
        return d.toISOString();
    }
  };
  


  const groupByTimeUnit = (arr, dateKey) => {
  if (!post) return [];                     // still guard if post isn’t loaded
  const start = new Date(post.postedAt);
  const end   = new Date();
  const unit  = determineTimeUnit(start, end);

  // 1) First, tally up all your real events into a lookup:
  const rawCounts = arr.reduce((acc, ev) => {
    const key = formatBucket(ev[dateKey], unit);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // 2) Now walk from start → end, stepping by unit, and emit zeros where needed:
  const result = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const time  = formatBucket(cursor, unit);
    const count = rawCounts[time] || 0;
    result.push({ time, count });

    // advance `cursor` one “unit”
    switch (unit) {
      case 'hour':
        cursor.setHours(cursor.getHours() + 1);
        break;
      case 'halfDay':
        cursor.setHours(cursor.getHours() + 12);
        break;
      case 'day':
        cursor.setDate(cursor.getDate() + 1);
        break;
      case 'month':
        cursor.setMonth(cursor.getMonth() + 1);
        break;
    }
  }

  return result;
};



  const computeDemographics = (events, viewerField = 'author') => {
    // initialize buckets
    const ageCounts = { '13-17': 0, '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0 };
    const genderCounts = {};
  
    events.forEach(ev => {
      // make sure ev.viewer exists and has DOB, gender
      const viewer = ev[viewerField];
      if (!viewer?.DOB) return;
  
      const dob = new Date(viewer.DOB);
      const seen = new Date(ev[viewerField === 'viewer' ? 'viewedAt' : ev.createdAt ? 'createdAt' : 'postedAt']);
      let age = seen.getFullYear() - dob.getFullYear();
      const m = seen.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && seen.getDate() < dob.getDate())) age--;
  
      // bucket age
      let group;

      if (age >= 13 && age <= 17) group = '13-17';
      else if (age <= 24) group = '18-24';
      else if (age <= 34) group = '25-34';
      else if (age <= 44) group = '35-44';
      else group = '45+';
      ageCounts[group]++;
  
      // bucket gender
      const g = viewer.gender;
      if (g) genderCounts[g] = (genderCounts[g] || 0) + 1;
    });
  
    return {
      ageGroups: Object.entries(ageCounts).map(([group, viewers]) => ({ group, viewers })),
      genderData: Object.entries(genderCounts).map(([name, value]) => ({ name, value }))
    };
  };



  // at top of your component, alongside downloadCSV:
  const downloadSectionCSV = (events, dateKey, viewerField, filename) => {
    if (!events.length) return;
    const headers = ['time','ageGroup','gender'];
    const rows = events.map(ev => {
      const d = new Date(ev[dateKey]);
      const time = d.toISOString();
      // compute age
      const dob = new Date(ev[viewerField].DOB);
      let age = d.getFullYear() - dob.getFullYear();
      const m = d.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && d.getDate() < dob.getDate())) age--;
      // bucket into group
      let group = '45+';
      if (age <= 17) group = '13-17';
      else if (age <= 24) group = '18-24';
      else if (age <= 34) group = '25-34';
      else if (age <= 44) group = '35-44';
      const gender = ev[viewerField].gender || '';
      return [time, group, gender].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isPremium = profile?.role === 4;
  const pieColors = ["#3bc9c9", "#007bff", "#8884d8"];

  useEffect(() => {
    if (!postID) return;
    if (!post) return;  
    const fetchStats = async () => {
      try {
        // Fetch view events
        const viewsRes = await axios.get(`${API}/api/viewedPost/post/${postID}/`);
        const views = viewsRes.data;
        setViews(views);

        // Fetch like events
        const likesRes = await axios.get(`${API}/api/like/${postID}/`);
        const likes = likesRes.data; // array of { createdAt } // assume array of {createdAt}
        setLikes(likes);

        // Fetch comment events
        const commentsRes = await axios.get(`${API}/api/comment/${postID}/`);
        const comments = commentsRes.data; // array of { postedAt } // assume array of {createdAt}
        setComments(comments);

        // Fetch region events
        const regionsRes = await axios.get(`${API}/api/viewedRegion/post/${postID}`);
        const regions = regionsRes.data;
        setRegions(regions);

        const uniqueUserIDs = new Set( views.map(v => v.userID) );
        setUniqueViews(uniqueUserIDs.size);

        // Total views
        setTotalViews(views.length);
        setTotalLike(likes.length);
        setTotalComments(comments.length);
        setTotalRegions(regions.length);

        // by time
        setViewsByTime(groupByTimeUnit(views, 'viewedAt'));
        setLikesByTime(groupByTimeUnit(likes, 'createdAt').map(({ time, count }) => ({ time, likes: count })));
        setCommentsByTime(groupByTimeUnit(comments, 'postedAt').map(({ time, count }) => ({ time, comments: count })));
        setRegionsByTime(groupByTimeUnit(regions, 'viewedAt').map(({ time, count }) => ({ time, regions: count })));


        // Age groups & gender from views
        const { ageGroups: vA, genderData: vG } = computeDemographics(views, 'viewer');
        setViewsDemo({ageGroups: vA, genderData: vG});

        const { ageGroups: lA, genderData: lG } = computeDemographics(likes, 'author');
        setLikesDemo({ageGroups: lA, genderData: lG});

        const { ageGroups: cA, genderData: cG } = computeDemographics(comments, 'author');
        setCommentsDemo({ageGroups: cA, genderData: cG});

        const { ageGroups: rA, genderData: rG } = computeDemographics(regions, 'viewer');
        setRegionsDemo({ageGroups: rA, genderData: rG});
      } catch (err) {
        console.error("Error loading post stats:", err);
      }
    };
    fetchStats();
  }, [postID, post]);


  useEffect(() => {
    if (!isPremium) {
      // disable all page scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // re-enable when premium
      document.body.style.overflow = '';
    }
    return () => {
      // clean up on unmount
      document.body.style.overflow = '';
    };
  }, [isPremium]);


  if (!post) {
  return (
    <Container className="my-4 d-flex justify-content-center">
      <Spinner animation="border" />
    </Container>
  );
}

  return (
    <Container className="mt-4" style={{ paddingBottom: '80px' }}>
      <Card
        className="shadow-lg p-4 mb-4 pb-5"
        style={{
          borderRadius: "2rem",
          background: "linear-gradient(to right, #e0f7fa, #ffffff)",
          border: "none",
        }}
      >
        <h3 className="text-center mb-4">Post Statistics</h3>

        <div className="text-center mb-4 d-flex justify-content-center gap-5">
        <div className="text-center mb-4">
          <h4>Views</h4>
          <div className="fs-2 fw-bold text-primary">
            {totalViews.toLocaleString()}
          </div>
        </div>
        
        <div>
          <h4>Likes</h4>
          <div className="fs-2 fw-bold text-danger">
            {totalLikes.toLocaleString()}
          </div>
        </div>
        <div>
          <h4>Comments</h4>
          <div className="fs-2 fw-bold text-info">
            {totalComments.toLocaleString()}
          </div>
        </div>
        <div>
          <h4>Region Views</h4>
          <div className="fs-2 fw-bold text-warning">
            {totalRegions.toLocaleString()}
          </div>
        </div>
        <div>
          <h4>Unique Post Views</h4>
          <div className="fs-2 fw-bold text-success">
            {uniqueViews.toLocaleString()}
          </div>
        </div>
        </div>
      <div
        style={{
          filter: isPremium ? 'none' : 'blur(15px)',
          pointerEvents: isPremium ? 'auto' : 'none'
        }}
      >

        {/* four metric sections */}
        {[
          {
            title: "Views Over Time",
            series: viewsByTime,
            dataKey: "count",
            stroke: "#0d6efd",
            demo: viewsDemo,
          },
          {
            title: "Likes Over Time",
            series: likesByTime,
            dataKey: "likes",
            stroke: "#dc3545",
            demo: likesDemo,
          },
          {
            title: "Comments Over Time",
            series: commentsByTime,
            dataKey: "comments",
            stroke: "#198754",
            demo: commentsDemo,
          },
          {
            title: "Region Views Over Time",
            series: regionsByTime,
            dataKey: "regions",
            stroke: "#ffc107",
            demo: regionsDemo,
          },
        ].map(({ title, series, dataKey, stroke, demo }, idx) => {

          const rawEvents = title.startsWith('Views')   ? views
                            : title.startsWith('Likes')   ? likes
                            : title.startsWith('Comments')? comments
                            : /* Regions */                regions;
          const dateKey    = title.startsWith('Views')   ? 'viewedAt'
                            : title.startsWith('Likes')   ? 'createdAt'
                            : title.startsWith('Comments')? 'postedAt'
                            : 'viewedAt';
          const viewerField= title.startsWith('Views')||title.startsWith('Regions')
                            ? 'viewer'
                            : 'author';
        
         return (
          <Row className="mb-5" key={idx}>
            <Col md={6}>
              <h5>{title}</h5>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    filter: series.length ? 'none' : 'blur(4px)',
                    pointerEvents: series.length ? 'auto' : 'none'
                  }}
                >
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey={dataKey} stroke={stroke} />
                    </LineChart>
                  </ResponsiveContainer>
                  </div>

                    {/* No-data message */}
                    {!series.length && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0, left: 0, right: 0, bottom: 0,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: '#666',
                          fontStyle: 'italic'
                        }}
                      >
                        No data available
                      </div>
                    )}

                </div>
                
            </Col>

            <Col md={6}>
              <Row>
                <Col md={6}>
                  <h5>{title.replace("Over Time","")} by Age Group</h5>
                  <div style={{ position: 'relative' }}>
                <div
                  style={{
                    filter: series.length ? 'none' : 'blur(4px)',
                    pointerEvents: series.length ? 'auto' : 'none'
                  }}
                >
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={demo.ageGroups}
                      layout="vertical"
                      margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false}/>
                      <YAxis dataKey="group" type="category" />
                      <Tooltip />
                      <Bar dataKey="viewers" fill={stroke} />
                    </BarChart>
                  </ResponsiveContainer>
                  </div>

                {/* No-data message */}
                {!series.length && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#666',
                      fontStyle: 'italic'
                    }}
                  >
                    No data available
                  </div>
                )}

                </div>
                </Col>
                <Col md={6}>
                  <h5>{title.replace("Over Time","")} Gender</h5>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        filter: series.length ? 'none' : 'blur(4px)',
                        pointerEvents: series.length ? 'auto' : 'none'
                      }}
                    >
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={demo.genderData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={60}
                          stroke="none"
                          label
                        >
                          {demo.genderData.map((_, i) => (
                            <Cell key={i} fill={pieColors[i % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="horizontal" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                    </div>

                {/* No-data message */}
                {!series.length && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#666',
                      fontStyle: 'italic'
                    }}
                  >
                    No data available
                  </div>
                )}

                </div>
                </Col>
              </Row>
              <Row className="mb-4">
                <Col className="text-center">
                  {rawEvents.length > 0 && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() =>
                        downloadSectionCSV(
                          rawEvents,
                          dateKey,
                          viewerField,
                          title.replace(/\s+/g,'_').toLowerCase() + '.csv'
                        )
                      }
                    >
                      Download CSV
                    </Button>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        )})}

        </div>


        {!isPremium && (
          <div
            className="position-absolute start-50 translate-middle-x text-center bg-white p-3 rounded shadow"
            style={{ opacity: 0.95, zIndex: 10, top: '35%' }}
          >
            <FaCrown className="text-warning mb-2" size={20} />
            <div className="fw-bold">Unlock full account insights</div>
            <small>
              <span
                role="button"
                onClick={() => navigate(`/payment/${user.userID}`)}
                className="text-primary text-decoration-underline"
                style={{ cursor: 'pointer' }}
              >
                Go Premium
              </span>{' '}
              to unlock full insights
            </small>
          </div>
)}



      </Card>
    </Container>
  );
};

export default PostStats;
