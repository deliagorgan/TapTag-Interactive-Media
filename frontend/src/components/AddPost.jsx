import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Row, Col, ToastContainer, Toast } from "react-bootstrap";
import Cropper from "react-easy-crop";
import { FaTrashAlt } from 'react-icons/fa';
import axios from "axios";
import getCroppedImg from "../utils/cropImage";
import { checkTextForBannedWords, checkURLIfMalicious } from "../utils/checkIntegrity";

 async function resizeFile(file, maxWidth = 800, maxHeight = 800) {
  const bitmap = await createImageBitmap(file);

  // 1) calculează raportul ideal fără a îl limita la 1
  const ratio = Math.min(maxWidth / bitmap.width, maxHeight / bitmap.height);
  const width = Math.round(bitmap.width * ratio);
  const height = Math.round(bitmap.height * ratio);

  // 2) folosește întotdeauna OffscreenCanvas sau canvas normal cu toBlob
  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(width, height)
    : document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);

  // 3) pentru HTMLCanvasElement, toBlob e asincron cu callback
  if (canvas instanceof HTMLCanvasElement) {
    return await new Promise(resolve => 
      canvas.toBlob(blob => resolve(new File([blob], file.name, { type: blob.type })), 'image/jpeg', 0.9)
    );
  }

  // 4) pentru OffscreenCanvas
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
  return new File([blob], file.name, { type: blob.type });
}


function resizeDataUrl(dataUrl, maxWidth = 900, maxHeight = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const origW = img.naturalWidth;
      const origH = img.naturalHeight;
      // scale to fit within maxWidth/maxHeight, keep aspect
      const scale = Math.min(maxWidth / origW, maxHeight / origH);
      const newW = Math.round(origW * scale);
      const newH = Math.round(origH * scale);

      const canvas = document.createElement('canvas');
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext('2d');
      // draw scaled image at 0,0
      ctx.drawImage(img, 0, 0, newW, newH);

      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = err => reject(err);
    img.src = dataUrl;
  });
}




const Post = () => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1); // Default 1:1
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const API = process.env.REACT_APP_BACKEND_BASE_URL;

  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [image, setImage] = useState(null);
  const [regions, setRegions] = useState([]);
  const navigate = useNavigate();

  const [postAdded, setPostAdded] = useState(false);

  const [currentRegion, setCurrentRegion] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null); // Regiunea selectată pentru editare
  const svgRef = useRef(null);
  const imgRef = useRef(null);

  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!image || !croppedAreaPixels) return;
    const cropped = await getCroppedImg(URL.createObjectURL(image), croppedAreaPixels);
    const upscaled = await resizeDataUrl(cropped, 800, 800);
  // 3) setează imaginea rezultată
  setCroppedImage(cropped);
  setShowCropper(false);
  };

  const handleImageChange = async (e) => {
     const original = e.target.files[0];
  if (!original) return;
  try {
    const resized = await resizeFile(original, 800, 800);
    setImage(resized);
    setCroppedImage(null);
    setRegions([]);
    setShowCropper(true);
  } catch(err) {
    console.error("Resize failed:", err);
    setToastText("Nu am putut procesa imaginea.");
    setShowToast(true);
  }
  };

  const draw = (e) => {
    if (!isDrawing || !image) return;
    const svg = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svg.left;
    const y = e.clientY - svg.top;
    setCurrentRegion((prev) => [...prev, { x, y }]);
  };

  function polygonArea(points) {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y - points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  }


  /*
  const endDrawing = () => {
    if (!isDrawing || !currentRegion) return;
    setRegions([...regions, { points: currentRegion, link: "" }]);
    setCurrentRegion(null);
    setIsDrawing(false);
  };*/


  const endDrawing = () => {
    const MIN_REGION_AREA = 10;

    if (!isDrawing || !currentRegion) return;
    const area = polygonArea(currentRegion);
    setIsDrawing(false);
    setCurrentRegion(null);
  
    if (area < MIN_REGION_AREA) {
      // too tiny, ignore it
      return;
    }
  
    setRegions(regions => [
      ...regions,
      { points: currentRegion, link: "", description: "" }
    ]);
  };

  const selectRegion = (index) => {
    setSelectedRegion(index);
  };

  function normalizeHttps(url) {
    let u = url.trim();

    u = u.replace(/^(?:https?:\/\/)+/i, 'https://');
  
    // 1) If it starts with "https:/" but NOT "https://", add the missing slash(s)
    if (/^https?:\/[^/]/.test(u)) {
      return u.replace(/^https?:\/+/, 'https://');
    }
  
    // 2) If it starts with "http://" (no 's'), just upgrade to https://
    if (u.startsWith('http://')) {
      return u.replace(/^http:\/+/, 'https://');
    }

    if (u.startsWith('https:/') && !u.startsWith('https://')) {
      return u.replace(/^https:\//, 'https://')
    }
  
    // 3) If it already is correct "https://", leave it
    if (u.startsWith('https://')) {
      return u;
    }
  
    // 4) If it's scheme‐relative "//foo", add "https:"
    if (u.startsWith('//')) {
      return 'https:' + u;
    }
  
    // 5) Otherwise truly no scheme at all, so prepend https://
    return 'https://' + u;
  }
  
  
  

  const updateRegionLink = (index, link) => {
    const normalizedLink = normalizeHttps(link);
  
    setRegions(
      regions.map((r, i) =>
        i === index
          ? { ...r, link: normalizedLink }
          : r
      )
    );
  };

  const updateRegionDescription = (index, descriptionText) => {
    setRegions(regions.map((r, i) =>
      i === index ? { ...r, description: descriptionText } : r
    ));
  };


  const deleteRegion = (index) => {
    setRegions(regions.filter((_, i) => i !== index));
    setSelectedRegion(null);
  };


  const startDrawing = (e) => {
    if (!image) return;
    setIsDrawing(true);
    const svg = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svg.left;
    const y = e.clientY - svg.top;
    setCurrentRegion([{ x, y }]);
  };

  async function parseHashtags(hashtagsString) {
    // Utilizăm o expresie regulată pentru a găsi toate hashtag-urile
    const regex = /#(\w+)/g;
    
    let hashtags = [];
    let match;

    // Căutăm toate hashtag-urile din string
    while ((match = regex.exec(hashtagsString)) !== null) {
        // match[1] va conține textul hashtag-ului (fără #)
        hashtags.push({ name: match[1] });
    }

    return hashtags;
  }

  const checkFieldsForBannedWords = async () => {
    try {
      const parsedHashtags = await parseHashtags(hashtags);
      const hashtagChecks = await Promise.all(
        parsedHashtags.map(tag => checkTextForBannedWords(tag.name))
      );
      const badDesc = await checkTextForBannedWords(description);
      const badHashtag = hashtagChecks.some(Boolean);
  
      const regionDescChecks = await Promise.all(
        regions.map(r => checkTextForBannedWords(r.description || ""))
      );
      const badRegionDesc = regionDescChecks.some(Boolean);
  
      if (badDesc || badHashtag || badRegionDesc) {
        setToastText("Your description, a hashtag, or a region's text contains forbidden words.");
        setShowToast(true);
        return false;
      }
  
      for (let { link } of regions) {
        if (link) {
          const safe = await checkURLIfMalicious(link);
          if (safe) {
            setToastText(`The link ${link} appears malicious and cannot be used.`);
            setShowToast(true);
            return false;
          }
        }
      }
  
      return true;
    } catch (err) {
      console.error('Validation error:', err);
      setToastText(`Validation failed. Please try again.`);
      setShowToast(true);
      return false;
    }
  };
  

  
  const checkForEmptyFields = () => {
    // 1) description & hashtags
    if (!description.trim()) {
      const el = document.getElementById('descriptionInput');
      el.setCustomValidity('Please fill in this field.');
      el.reportValidity();
      el.setCustomValidity('');
      return false;
    }
    if (!hashtags.trim()) {
      const el = document.getElementById('hashtagsInput');
      el.setCustomValidity('Please fill in this field.');
      el.reportValidity();
      el.setCustomValidity('');
      return false;
    }
  
    // 2) each region must have exactly one of link or text
    for (let i = 0; i < regions.length; i++) {
      const { link, description: regionDesc } = regions[i];
      const hasLink = Boolean(link?.trim());
      const hasText = Boolean(regionDesc?.trim());
      if ((hasLink ? 1 : 0) + (hasText ? 1 : 0) !== 1) {
        // make that region's inputs visible
        setSelectedRegion(i);
  
        // once React renders the inputs for selectedRegion, focus & report validity
        setTimeout(() => {
          // if link is non-empty then text is wrong, else link is wrong
          const badId = hasLink
            ? `region-desc-${i}`
            : `region-link-${i}`;
          const el = document.getElementById(badId);
          if (!el) return;  // just in case

          setToastText('Please fill exactly one field, either the link OR text.');
          setShowToast(true);
          
          el.setCustomValidity('Please fill exactly one field, either the link OR text.');
          el.reportValidity();
          el.setCustomValidity('');
        }, 0);
  
        return false;
      }
    }
  
    return true;
  };


  // Functie pentru a trimite postarea la backend
  const handlePost = async (e) => {
    e.preventDefault();

    if (postAdded) return;

    console.log(checkForEmptyFields());

    if (!checkForEmptyFields())
      return;


    // se verifica descrierea si hashtagurile sa nu contina cuvinte interzise
    const result = await checkFieldsForBannedWords();

    if (!result)
      return;


    setPostAdded(true);

    try {
      if (typeof croppedImage === "string" && croppedImage.startsWith("blob:") && !postAdded) {
        const blob = await fetch(croppedImage).then(res => res.blob());
        const reader = new FileReader();
    
        reader.onloadend = async () => {
          // extrage doar partea base64
          const base64Image = reader.result.split(",")[1]; 

          const imgEl = imgRef.current;
          const scaleX = imgEl.naturalWidth / imgEl.clientWidth;
          const scaleY = imgEl.naturalHeight / imgEl.clientHeight;

          const normalizedRegions = regions.map(region => ({
            points: region.points.map(pt => ({
              x: pt.x * scaleX,
              y: pt.y * scaleY
            })),
            link: region.link,
            description: region.description
          }));

          console.log(normalizedRegions);

          let response = await axios.post(
            `${API}/api/image/create/`,
            { data: base64Image,
                metadata: JSON.stringify(normalizedRegions) 
            }
          );
    
          if (!response.data.photoID) {
            console.error("Eroare: photoID nu a fost returnat de la server.");
            return;
          }

          // se creaza postarea
          response = await axios.post(`${API}/api/post/`,
            {
              description: description,
              hashtags: await parseHashtags(hashtags),
              photoID: response.data.photoID
            }
          );
    
          if (response.status === 200) {
            console.log("Postarea adăugată cu succes.");
            navigate("/home");
          } else {
            console.log(`Eroare la postare: ${response.data.message}.`);
          }
        };
        // citeste fisierul ca base64
        reader.readAsDataURL(blob); 
      }
    } catch (err) {
      console.error("Eroare în timpul postării", err.message);
    }
  };


  return (
     <div className="add-post-animated-bg">
    
     <Card className="add-post-card shadow-lg">
          <Card.Header className="add-post-card-header">
            <h3>ADD POST</h3>
          </Card.Header>
        <Card.Body style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          {/* Dacă NU e încă imagine — afișează zona cu + */}
  {!image && (
    <div
      onClick={() => document.getElementById('imageInput').click()}
      className="add-post-plus"
    >
      +
      
    </div>
  )}
  {/* Dacă există imagine → afișează layout cu Col stânga + Col dreapta */}
  {image && (
          <Row className="h-100 align-items-center">
            <Col
            md={4}
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: "100%" }}>
              <Form onSubmit={handlePost} >
                


              <Form.Group className="mb-3 position-relative"
              style={{ width: '150%' }}>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter a description"
                  id="descriptionInput"
                  value={description}
                  onChange={e => {
                    const v = e.target.value;
                    if (v.length <= 255) setDescription(v);
                  }}
                  className="w-100"
                  required
                />
                <small
                  className="text-muted"
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    bottom: '0.5rem' }}
                >
                  {description.length}/255
                </small>
              </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hashtags</Form.Label>
                  <Form.Control type="text"
                  placeholder="Enter hashtags"
                  id="hashtagsInput"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  required />
                </Form.Group>
                {selectedRegion !== null && (
                <div className="mt-4 p-3 rounded border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Selected Region {selectedRegion + 1}</strong>
                    <FaTrashAlt
                        onClick={() => deleteRegion(selectedRegion)}
                        className="add-post-trash-icon"
                      />

                      {/* dacă ai react-icons poți folosi de ex: <FaTrash /> */}
                    </div>

                    {/* Link for selected region */}
                    <Form.Group className="mb-3">
                      <Form.Label>Link for Selected Region</Form.Label>
                      <Form.Control
                        type="text"
                        id={`region-link-${selectedRegion}`}
                        required={!regions[selectedRegion]?.description}
                        placeholder="example.com"
                        value={regions[selectedRegion]?.link || ''}
                        onChange={e => updateRegionLink(selectedRegion, e.target.value)}
                      />
                    </Form.Group>

                    {/* Description for selected region */}
                    <Form.Group className="mb-3">
                      <Form.Label>Description for Selected Region</Form.Label>
                      <Form.Control
                        type="text"
                        id={`region-desc-${selectedRegion}`}
                        required={!regions[selectedRegion]?.link}
                        placeholder="Enter region text"
                        value={regions[selectedRegion]?.description || ''}
                        onChange={e => updateRegionDescription(selectedRegion, e.target.value)}
                      />
                    </Form.Group>
                  </div>
                )}
                <Button variant="dark" type="submit" className="w-100" disabled={regions.length === 0}>
                  Add Post
                </Button>
              </Form>
            </Col>

            <Col md={8} className="d-flex justify-content-center align-items-center">
              
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: "700px",
                  maxHeight: "75vh",
                  margin: "0 auto"
                }}>
                {/* Aspect Ratio Buttons */}
                {image && !croppedImage && (
                  <div className="mb-3">
                    <Button className="add-post-aspect-button" onClick={() => setAspect(1)}>1:1</Button>{' '}
                    <Button className="add-post-aspect-button" onClick={() => setAspect(4 / 5)}>4:5</Button>{' '}
                    <Button className="add-post-aspect-button" onClick={() => setAspect(5 / 4)}>5:4</Button>
                    <Button className="add-post-aspect-button" onClick={() => setAspect(3 / 4)}>3:4</Button>
                    <Button className="add-post-aspect-button" onClick={() => setAspect(4 / 3)}>4:3</Button>
                  </div>
                  
                 
                )}
                {/* Image Cropper */}
                {image && !croppedImage && (
                  <div 
                  style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: "500px",
                      maxHeight: "55vh",
                      aspectRatio: "1 / 1",  // sau ce vrei
                      margin: "0 auto"
                    }}>
                    <Cropper
                      image={URL.createObjectURL(image)}
                      crop={crop}
                      zoom={zoom}
                      aspect={aspect}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                )}

                {/* Crop Button */}
                {image && !croppedImage && (
                  <Button variant="secondary" onClick={handleCrop} className="w-100 mt-2 add-post-custom-button">
                    Crop Image
                  </Button>
                )}
                {/* Cropped Image */} 
                    {croppedImage && (
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "500px",    // ajustează cum vrei
                          aspectRatio: "1 / 1", // sau 4/5, 16/9 etc.
                          position: "relative",
                          margin: "0 auto",
                        }}
                      >
                      <img src={croppedImage} alt="Cropped" 
                      style={{ width: "auto", 
                              height: "auto", 
                              maxWidth: "100%", 
                              maxHeight: "100%", 
                              objectFit: "contain",
                              display: "block" }}
                      ref={imgRef}/>
                      <svg
                      ref={svgRef}
                      style={{ position: "absolute", 
                                top: 0, 
                                left: 0, 
                                width: imgRef.current ? `${imgRef.current.clientWidth}px` : "100%",
                                height: imgRef.current ? `${imgRef.current.clientHeight}px` : "100%" }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={endDrawing}
                    >
                      {regions.map((region, index) => (
                        <polygon
                          key={index}
                          points={region.points.map((p) => `${p.x},${p.y}`).join(" ")}
                          fill="rgba(255, 0, 0, 0.4)"
                          stroke="red"
                          strokeWidth="2"
                          onClick={() => selectRegion(index)}
                        />
                    ))}
                    {currentRegion && (
                        <polygon
                          points={currentRegion.map((p) => `${p.x},${p.y}`).join(" ")}
                          fill="rgba(0, 0, 255, 0.4)"
                          stroke="blue"
                          strokeWidth="2"
                        />
                      )}
                      {selectedRegion !== null && (
                        <polygon
                          points={regions[selectedRegion].points.map((p) => `${p.x},${p.y}`).join(" ")}
                          fill="rgba(0, 255, 0, 0.4)"
                          stroke="green"
                          strokeWidth="2"
                        />
                      )}
                    </svg>
                    </div>
                  
                    )}
              </div>
            </Col>
          </Row>
  )}
        </Card.Body>
      </Card>

      <ToastContainer position="top-center" className="p-3">
      <Toast 
        onClose={() => setShowToast(false)} 
        show={showToast} 
        delay={7000} 
        autohide
        bg="danger"
      >
        <Toast.Body className="text-white">
          {toastText}
        </Toast.Body>
      </Toast>
    </ToastContainer>
   
    </div>
  );
};

export default Post;
