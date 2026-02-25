import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { FaHeart, FaComment, FaFlag, FaRegCommentDots, FaUserPlus, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { connect_socket } from '../utils/socket';
import axios from 'axios';

const Notifications = () => {
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  useEffect(() => {
    let sock;
    try {
      sock = connect_socket();
    } catch (err) {
      console.error('Socket connection failed', err);
      return;
    }

    const handleNotification = (data) => {

      console.log(data);
      setToasts((all) => [
        ...all,
        { id: uuidv4(), ...data }
      ]);
    };

    sock.on('notification', handleNotification);

    return () => {
      sock.off('notification', handleNotification);
      sock.disconnect && sock.disconnect();
    };
  }, []);

  const removeToast = (id) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  };

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
      {toasts.map((t) => {
        // build icon + message
        let icon, message;
        if (t.type === 'like') {
          icon    = <FaHeart className="me-2 text-danger" />;
          message = `${t.username || 'Someone'} liked your post.`;
        } else if (t.type === 'comment') {
          icon    = <FaComment className="me-2 text-primary" />;
          message = `${t.username || 'Someone'} commented: "${t.text || ''}"`;
        }
        else if (t.type === 'post') {
          icon    = <FaRegCommentDots className="me-2 text-primary" />;
          message = `${t.username || 'Someone'} has posted a new photo.`;
        }
        else if (t.type === 'follow') {
          icon    = <FaUserPlus className="me-2 text-primary" />;
          message = `${t.username || 'Someone'} started following you.`;
        }
        else if (t.type === 'postReport') {
          icon    = <FaFlag className="me-2 text-primary" />;
          message = `A post of ${t.username}'s has been reported.`;
        }
        else if (t.type === 'commentReport') {
          icon    = <FaFlag className="me-2 text-primary" />;
          message = `A comment of ${t.username}'s has been reported.`;
        }
        else if (t.type === 'generic') {
          icon    = <FaBell className="me-2 text-secondary" />;
          console.log('intra');
          message = t.text;
        }
        else {
          message = t.message || 'You have a new notification';
        }

        return (
          <Toast
            key={t.id}
            bg="light"
            autohide
            delay={10000}
            onClose={async () => {
              // X button pressed
              try {
                console.log('Notification deleted!');
              } catch (err) {
                console.error('Error marking notification as deleted', err);
              }
              removeToast(t.id);
            }}
            style={{ cursor: 'pointer' }}    // show that it's clickable
            onClick={(e) => {
              if (e.target.closest('.btn-close')) return;
          
              // entire toast clicked (not the X button)
              const handleClick = async () => {
                try {
                  await axios.post(`${API}/api/notification/view/${t.type}/${t.notificationID}`);
                  console.log('Notification marked as viewed');
                } catch (err) {
                  console.error('Error marking notification as viewed', err);
                }
          
                removeToast(t.id);
          
                if (t.type === 'like' || t.type === 'post' || t.type === 'comment' || t.type === "postReport" || t.type === "commentReport") {
                  navigate(`/post/${t.postID}`);
                } else if (t.type === 'follow') {
                  navigate(`/profile/${t.username}`);
                } 
              };
          
              handleClick();  // run async
            }}
          >
            <Toast.Header closeButton>
              {icon}
              <strong className="me-auto">
                {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
              </strong>
              <small className="text-muted">
                {new Date(t.createdAt).toLocaleTimeString()}
              </small>
            </Toast.Header>
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        );
      })}
    </ToastContainer>
  );
};

export default Notifications;
