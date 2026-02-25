// src/components/Explore.jsx
import React, { useState, useEffect } from 'react'
import { FaLaptop, FaTshirt, FaHeartbeat, FaLeaf, FaDog, FaTasks, FaFutbol, FaPlane, FaEllipsisH } from 'react-icons/fa'

import {
  Container, Card, Row, Col,
  Button, ButtonGroup, Spinner, Form
} from 'react-bootstrap'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API = process.env.REACT_APP_BACKEND_BASE_URL

// peste CATEGORIES, înainte de componentă
const CATEGORY_ICONS = {
  Tech:        FaLaptop,
  Lifestyle:   FaLeaf,
  Fashion:     FaTshirt,
  Beauty:      FaHeartbeat,
  Pets:        FaDog,
  Organising:  FaTasks,
  Sport:       FaFutbol,
  Travel:      FaPlane,
  Other:       FaEllipsisH
}


// Hard-coded categories
const CATEGORIES = [
  'Tech',
  'Lifestyle',
  'Fashion',
  'Beauty',
  'Pets',
  'Organising',
  'Sport',
  'Travel',
  'Other'
]

export default function Explore() {
  const navigate = useNavigate()
  const [query, setQuery]           = useState('')
  const [posts, setPosts]           = useState([])
  const [selectedFilter, setSelectedFilter] = useState(null)
  const [loading, setLoading]       = useState(true)

  // Utility to fetch posts and then their images
  async function fetchAndAttachImages(rawPosts) {
    const posts = Array.isArray(rawPosts) ? rawPosts : []
    await Promise.all(
      posts.map(async post => {
        try {
          const imgResp = await axios.get(`${API}/api/image/${post.photoID}`)
          post.data = imgResp.data.data  // base64 payload
        } catch (e) {
          console.error('Error fetching image for post', post.id, e)
          post.data = null
        }
      })
    )
    return posts
  }

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        await handleFilter('Fashion')
        //setPosts([])
      } catch (e) {
        console.error('Error loading posts:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Search by text
  const handleSearch = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const resp = await axios.post(`${API}/api/post/text/`, { text: query })
      const withImages = await fetchAndAttachImages(resp.data)
      setPosts(withImages)
      setSelectedFilter(null)
    } catch (e) {
      console.error('Error searching posts:', e)
    } finally {
      setLoading(false)
    }
  }

  // Filter by category
  const handleFilter = async cat => {
    // toggle off if already selected
    if (cat === selectedFilter) return
    setSelectedFilter(cat)
    setLoading(true)
    try {
      let resp
        // Replace this endpoint with your real category API:
        resp = await axios.post(`${API}/api/post/text/`, {text: `${cat} ${cat} ${cat}`})
      const withImages = await fetchAndAttachImages(resp.data)
      setPosts(withImages)
    } catch (e) {
      console.error('Error filtering posts:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="feed-animated-bg" style={{ minHeight: '50vh', textAlign: 'center', paddingTop: '5rem' }}>
        <Spinner animation="border" />
      </div>
    )
  }

  return (
    <div className="feed-animated-bg">
      <Container
        fluid
        className="mt-4 px-0"
        style={{
          margin: "0 auto 20% auto",
          maxWidth: "1200px"
        }}
      >
        <Card className="glass-card shadow-lg text-center p-4"
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '85vh',
          overflowY: 'auto',
          overflowX: "hidden",
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Search bar */}
          <Form onSubmit={handleSearch} className="d-flex mb-4">
            <Form.Control
              type="text"
              placeholder="Search by description..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <Button variant="primary" className="ms-2 btn-turquoise" onClick={handleSearch}>
              Search
            </Button>
          </Form>

          {/* Category buttons */}
          <ButtonGroup className="mb-4">
            
            {CATEGORIES.map(cat => {
                const Icon = CATEGORY_ICONS[cat] 
                return (
            
              <Button
                className="btn-turquoise mx-2"
                key={cat}
                variant={cat === selectedFilter ? 'primary' : 'outline-primary'}
                onClick={() => handleFilter(cat)}
              >
                {Icon && <Icon style={{ marginRight: '0.5rem' }} />}
                {cat}
              </Button>
            )})}
          </ButtonGroup>

          <div style={{ overflowY: 'auto', overflowX: 'hidden', maxHeight: '60vh' }}>
          <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
              {posts.length === 0 ? (
                <p className="text-center w-100">No posts to display.</p>
              ) : (
                posts.map(post => (
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
                        <Card.Img
                          src={post.imageUrl || `data:image/jpeg;base64,${post.data}`}
                          alt={post.description || ''}
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
          </div>
        </Card>
      </Container>
    </div>
  )
}
