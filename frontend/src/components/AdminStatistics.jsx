import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { FaCrown } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

const AdminStatistics = () => {
  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  // summary stats
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [onlineAdmins, setOnlineAdmins] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  // history charts
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [newUsersHistory, setNewUsersHistory] = useState([]);
  const [postsHistory, setPostsHistory] = useState([]);


/**
 * If your data[i].date is "YYYY-MM-DD" → step by days
 * If your data[i].date is "YYYY-MM"    → step by months
 */
function fillMissingDates(data, key) {
  if (!data.length) return data;
  const first = data[0].date;
  const last  = data[data.length - 1].date;
  const out   = [];
  if (/^\d{4}-\d{2}-\d{2}$/.test(first)) {
    // daily
    let cur = new Date(first);
    const end = new Date(last);
    while (cur <= end) {
      const d = cur.toISOString().slice(0, 10);
      const found = data.find(item => item.date === d);
      out.push({ date: d, [key]: found ? found[key] : 0 });
      cur.setDate(cur.getDate() + 1);
    }
  } else if (/^\d{4}-\d{2}$/.test(first)) {
    // monthly
    // parse year/month
    const [y0, m0] = first.split('-').map(Number);
    const [y1, m1] = last.split('-').map(Number);
    let year = y0, month = m0 - 1; // JS Date months are 0-11
    while (year < y1 || (year === y1 && month <= m1 - 1)) {
      const keyDate = `${year.toString().padStart(4,'0')}-${(month+1).toString().padStart(2,'0')}`;
      const found = data.find(item => item.date === keyDate);
      out.push({ date: keyDate, [key]: found ? found[key] : 0 });
      // advance one month
      month++;
      if (month === 12) {
        month = 0;
        year++;
      }
    }
  } else {
    // unknown format: just return sorted
    return data.slice().sort((a,b) => a.date.localeCompare(b.date));
  }
  return out;
}


  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 1) fetch all users
        const { data: users } = await axios.get(`${API}/api/user/`);

        // 2) online users = those with a non-null token
        const onlineCount = users.filter(u => u.token != null && u.role !== 1).length;
        setOnlineUsers(onlineCount);

        const onlineAdminsCount = users.filter(u => u.token != null && u.role === 1).length;
        setOnlineAdmins(onlineAdminsCount);

        // (optional) total accounts
        setTotalUsers(users.length);

        // 3) group new non-admin users by creation date
        const nonAdmins = users.filter(u => u.role !== 1);
        const signupsByDay = {};
        nonAdmins.forEach(u => {
          const month = new Date(u.createdAt).toISOString().slice(0, 7);
          signupsByDay[month] = (signupsByDay[month] || 0) + 1;
        });

        let newUsersHistoryData = Object.entries(signupsByDay)
          .map(([date, newUsers]) => ({ date, newUsers }))
          .sort((a, b) => a.date.localeCompare(b.date));

        newUsersHistoryData = fillMissingDates(newUsersHistoryData, 'newUsers');

        setNewUsersHistory(newUsersHistoryData);


        // 4) fetch entire revenue history
        const { data: payments } = await axios.get(`${API}/api/paymentHistory/`);

        // 5) total revenue
        const totalRev = payments.reduce((sum, p) => sum + p.amount, 0);
        setTotalRevenue(totalRev);

        // 6) group revenue by day
        const revenueByDay = {};
        payments.forEach(p => {
          const day = new Date(p.paidAt).toISOString().slice(0, 7);
          revenueByDay[day] = (revenueByDay[day] || 0) + p.amount;
        });

        let revenueHistoryData = Object.entries(revenueByDay)
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date));
        revenueHistoryData = fillMissingDates(revenueHistoryData, 'revenue');
        setRevenueHistory(revenueHistoryData);

        // 7) fetch posts and group by day
        const { data: posts } = await axios.get(`${API}/api/post/`);

        const postsByDay = {};
        posts.forEach(p => {
          const day = new Date(p.postedAt).toISOString().slice(0, 10);
          postsByDay[day] = (postsByDay[day] || 0) + 1;
        });
    
        let postsHistoryData = Object.entries(postsByDay)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
        postsHistoryData = fillMissingDates(postsHistoryData, 'count');
        setPostsHistory(postsHistoryData);

      } catch (err) {
        console.error("Error loading admin stats:", err);
      }
    };

    fetchAll();
  }, [API]);

  const downloadCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(h => row[h]).join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <h3 className="text-center mb-4">Admin Dashboard</h3>

        {/* top summary */}
        <Row className="text-center mb-5">
          <Col>
            <h5>Online Users</h5>
            <div className="fs-2 fw-bold text-primary">
              {onlineUsers.toLocaleString()}
            </div>
          </Col>
          <Col>
            <h5>Online Admin Users</h5>
            <div className="fs-2 fw-bold text-secondary">
              {onlineAdmins.toLocaleString()}
            </div>
          </Col>
          <Col>
            <h5>Total Revenue</h5>
            <div className="fs-2 fw-bold text-success">
              ${totalRevenue.toLocaleString()}
            </div>
          </Col>
          <Col>
            <h5>Accounts Created</h5>
            <div className="fs-2 fw-bold text-warning">
              {totalUsers.toLocaleString()}
            </div>
          </Col>
        </Row>

        {/* three history charts */}
        <Row className="mb-5">
          {/* Revenue */}
          <Col md={6}>
          <div className="d-flex justify-content-center w-100 mt-2"
              style={{ transform: 'translateX(5%)' }}>
              <h5>Revenue History</h5>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip cursor={false} formatter={val => `$${val}`} />
                <Line type="monotone" dataKey="revenue" stroke="#007bff" />
              </LineChart>
            </ResponsiveContainer>
            <div className="d-flex justify-content-center w-100 mt-2"
            style={{ transform: 'translateX(5%)' }}>
              {revenueHistory.length > 0 && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => downloadCSV(revenueHistory, 'revenue_history.csv')}
                >
                  CSV
                </Button>
              )}
            </div>
          </Col>

          {/* New Users */}
            <Col md={6}>
                <div className="d-flex justify-content-center w-100 mt-2" 
                    style={{ transform: 'translateX(5%)' }}>
                  <h5>New Users History</h5>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                <LineChart data={newUsersHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={false} />
                    <Line type="monotone" dataKey="newUsers" stroke="#28a745" />
                </LineChart>
                </ResponsiveContainer>
                <div className="d-flex justify-content-center w-100 mt-2"
                style={{ transform: 'translateX(5%)' }}>
                  {newUsersHistory.length > 0 && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => downloadCSV(newUsersHistory, 'new_users_history.csv')}
                    >
                      CSV
                    </Button>
                  )}
                </div>
            </Col>
          </Row>

          {/* Posts */}
          <Row className="mb-5">
            <Col md={6}>
                <div className="d-flex justify-content-center w-100 mt-2"
                  style={{ transform: 'translateX(5%)' }}>
                  <h5>Posts History</h5>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                <LineChart data={postsHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={false} />
                    <Line type="monotone" dataKey="count" stroke="#ffc107" />
                </LineChart>
                </ResponsiveContainer>
                <div className="d-flex justify-content-center w-100 mt-2"
                style={{ transform: 'translateX(5%)' }}>
                  {postsHistory.length > 0 && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => downloadCSV(postsHistory, 'posts_history.csv')}
                    >
                      CSV
                    </Button>
                  )}
                </div>
            </Col>
          </Row>

      </Card>
    </Container>
  );
};

export default AdminStatistics;
