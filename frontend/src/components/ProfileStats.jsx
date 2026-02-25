import {
    Container, Card, Row, Col, Button } from "react-bootstrap";
import { FaCrown } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
  
import {
LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
  

const ProfileStats = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { userID } = useParams();
    const API = process.env.REACT_APP_BACKEND_BASE_URL;
  
    // Premium check
    const [profile, setProfile] = useState(null);
    const isPremium = profile?.role === 4;
  
    // Totals
    const [totalViews, setTotalViews] = useState(0);
    const [totalFollowers, setTotalFollowers] = useState(0);

    const [uniqueViews, setUniqueViews] = useState(0);
  
    // Raw events
    const [views, setViews] = useState([]);
    const [follows, setFollows] = useState([]);
  
    // Aggregated
    const [viewsByMonth, setViewsByMonth] = useState([]);
    const [followsByMonth, setFollowsByMonth] = useState([]);
  
    // Demographics
    const [viewsDemo, setViewsDemo] = useState({ ageGroups:[], genderData:[] });
    const [followsDemo, setFollowsDemo] = useState({ ageGroups:[], genderData:[] });
  
    // simple date‐bucket to month
    const groupToMonth = (events, dateKey) => {
      if (!events.length) return [];
      const counts = {};
      events.forEach(ev => {
        const d = new Date(ev[dateKey]);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        counts[key] = (counts[key]||0)+1;
      });
      return Object.entries(counts)
        .map(([month,count]) => ({ month, count }))
        .sort((a,b) => a.month.localeCompare(b.month));
    };
  
    // same demographic logic as PostStats
    const computeDemo = (events, viewerField, dateKey) => {
      const ageCounts = { '13-17':0,'18-24':0,'25-34':0,'35-44':0,'45+':0 };
      const genderCounts = {};
      events.forEach(ev => {
        const viewer = ev[viewerField];
        if (!viewer?.DOB) return;
        const dob = new Date(viewer.DOB);
        const seen = new Date(ev[dateKey]);
        let age = seen.getFullYear()-dob.getFullYear();
        const m = seen.getMonth()-dob.getMonth();
        if (m<0||(m===0&&seen.getDate()<dob.getDate())) age--;
        let grp = age<=17?'13-17':
                  age<=24?'18-24':
                  age<=34?'25-34':
                  age<=44?'35-44':'45+';
        ageCounts[grp]++;
        const g = viewer.gender;
        if (g) genderCounts[g] = (genderCounts[g]||0)+1;
      });
      return {
        ageGroups: Object.entries(ageCounts).map(([group,viewers])=>({group,viewers})),
        genderData: Object.entries(genderCounts).map(([name,value])=>({name,value}))
      };
    };
  
    // CSV download helper
    const downloadCSV = (events, dateKey, viewerField, filename) => {
      if (!events.length) return;
      const lines = ['time,ageGroup,gender'];
      events.forEach(ev=>{
        const d = new Date(ev[dateKey]).toISOString();
        const dob = new Date(ev[viewerField].DOB);
        let age = new Date(ev[dateKey]).getFullYear() - dob.getFullYear();
        // (month/day check omitted for brevity)
        let grp = age<=17?'13-17':age<=24?'18-24':age<=34?'25-34':age<=44?'35-44':'45+';
        const g = ev[viewerField].gender||'';
        lines.push([d,grp,g].join(','));
      });
      const blob= new Blob([lines.join('\n')],{type:'text/csv'});
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href    = url;
      a.download= filename;
      a.click();
      URL.revokeObjectURL(url);
    };
  
    const pieColors = ['#3bc9c9','#007bff','#8884d8'];
  
    useEffect(() => {
      // load profile for premium
      axios.get(`${API}/api/user/profile/${user.userID}`)
        .then(r=>setProfile(r.data))
        .catch(console.error);
    },[user]);
  
    useEffect(() => {
      // fetch all view events and all follow events
      Promise.all([
        axios.get(`${API}/api/viewedProfile/user/${userID}`),
        axios.get(`${API}/api/follow/followers/${userID}`)
      ]).then(([vR,fR])=>{
        setViews(vR.data);
        setFollows(fR.data);
        setTotalViews(vR.data.length);
        setTotalFollowers(fR.data.length);


        const uniqueUserIDs = new Set( vR.data.map(v => v.userID) );
        setUniqueViews(uniqueUserIDs.size);

        // group by month
        setViewsByMonth(groupToMonth(vR.data,'viewedAt'));
        setFollowsByMonth(groupToMonth(fR.data,'followedAt'));
        // demographics
        setViewsDemo( computeDemo(vR.data, 'viewer', 'viewedAt') );
        setFollowsDemo( computeDemo(fR.data, 'followerUser', 'followedAt') );
      }).catch(console.error);
    },[userID]);
  
    return (
      <Container className="mt-4" style={{ paddingBottom:'80px' }}>
        <Card className="shadow-lg p-4 mb-4 pb-5" style={{
          borderRadius:'2rem',
          background:'linear-gradient(to right, #e0f7fa, #ffffff)',
          border:'none'
        }}>
          <h3 className="text-center mb-4">Account Statistics</h3>
  
          <div className="d-flex justify-content-center gap-5 mb-4">
            <div><h4>Total Views</h4><div className="fs-2 fw-bold text-primary">{totalViews.toLocaleString()}</div></div>
            <div><h4>Total Followers</h4><div className="fs-2 fw-bold text-success">{totalFollowers.toLocaleString()}</div></div>
            <div>
              <h4>Unique Account Views</h4>
              <div className="fs-2 fw-bold text-info">
                {uniqueViews.toLocaleString()}
              </div>
            </div>
          </div>
  
          <div style={{ filter: isPremium?'none':'blur(15px)',
                        pointerEvents: isPremium?'auto':'none' }}>
  
            {[
              {
                title:'Views Over Time',
                series: viewsByMonth,
                dataKey:'count',
                stroke:'#0d6efd',
                demo:viewsDemo,
                dateKey:'viewedAt',
                viewerField:'viewer'
              },
              {
                title:'Followers Over Time',
                series: followsByMonth,
                dataKey:'count',
                stroke:'#198754',
                demo:followsDemo,
                dateKey:'createdAt',
                viewerField:'followerUser'
              }
            ].map((cfg,i)=>(
              <Row className="mb-5" key={i}>
                <Col md={6}>
                  <h5>{cfg.title}</h5>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        filter: cfg.series.length ? 'none' : 'blur(4px)',
                        pointerEvents: cfg.series.length ? 'auto' : 'none'
                      }}
                    >
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={cfg.series}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="month"/>
                        <YAxis allowDecimals={false}/>
                        <Tooltip/>
                        <Line dataKey={cfg.dataKey} stroke={cfg.stroke}/>
                      </LineChart>
                    </ResponsiveContainer>
                    </div>
                    {/* No-data message */}
                    {!cfg.series.length && (
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
                      <h5>{cfg.title.split(' Over')[0]} by Age Group</h5>
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            filter: cfg.series.length ? 'none' : 'blur(4px)',
                            pointerEvents: cfg.series.length ? 'auto' : 'none'
                          }}
                        >
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={cfg.demo.ageGroups}
                          layout="vertical"
                          margin={{top:10,right:10,left:10,bottom:5}}
                        >
                          <CartesianGrid strokeDasharray="3 3"/>
                          <XAxis type="number" allowDecimals={false}/>
                          <YAxis dataKey="group" type="category"/>
                          <Tooltip/>
                          <Bar dataKey="viewers" fill={cfg.stroke}/>
                        </BarChart>
                      </ResponsiveContainer>
                      </div>
                        {/* No-data message */}
                        {!cfg.series.length && (
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
                      <h5>{cfg.title.split(' Over')[0]} Gender</h5>
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            filter: cfg.series.length ? 'none' : 'blur(4px)',
                            pointerEvents: cfg.series.length ? 'auto' : 'none'
                          }}
                        >
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={cfg.demo.genderData}
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                            outerRadius={60}
                            label
                          >
                            {cfg.demo.genderData.map((_, idx)=>(
                              <Cell key={idx} fill={pieColors[idx%pieColors.length]}/>
                            ))}
                          </Pie>
                          <Tooltip/>
                          <Legend layout="horizontal" align="center"/>
                        </PieChart>
                      </ResponsiveContainer>
                      </div>
                        {/* No-data message */}
                        {!cfg.series.length && (
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
                    {(
                        cfg.title.startsWith('Views')
                        ? views.length
                        : follows.length
                        ) > 0 && (
                      <Button
                        variant="outline-secondary" size="sm"
                        onClick={()=>downloadCSV(
                          cfg.title.startsWith('Views') ? views : follows,
                          cfg.dateKey, cfg.viewerField,
                          cfg.title.replace(/\s+/g,'_').toLowerCase()+'.csv'
                        )}
                      >
                        Download CSV
                      </Button>
                    )}
                    </Col>
                  </Row>
                </Col>
              </Row>
            ))}
  
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
  }


export default ProfileStats;
  