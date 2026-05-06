const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Store data in JSON files
const submissionsFile = path.join(__dirname, 'submissions.json');
const hotelsFile = path.join(__dirname, 'hotels.json');
const feedbackFile = path.join(__dirname, 'feedback.json');

function readSubmissions() {
  try {
    if (fs.existsSync(submissionsFile)) {
      const data = fs.readFileSync(submissionsFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading submissions:', error);
    return [];
  }
}

function writeSubmissions(submissions) {
  try {
    fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing submissions:', error);
    return false;
  }
}

// Hotel management functions
function readHotels() {
  try {
    if (fs.existsSync(hotelsFile)) {
      const data = fs.readFileSync(hotelsFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading hotels:', error);
    return [];
  }
}

function writeHotels(hotels) {
  try {
    fs.writeFileSync(hotelsFile, JSON.stringify(hotels, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing hotels:', error);
    return false;
  }
}

// Feedback management functions
function readFeedback() {
  try {
    if (fs.existsSync(feedbackFile)) {
      const data = fs.readFileSync(feedbackFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading feedback:', error);
    return [];
  }
}

function writeFeedback(feedback) {
  try {
    fs.writeFileSync(feedbackFile, JSON.stringify(feedback, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing feedback:', error);
    return false;
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index-simple', (req, res) => {
  res.sendFile(path.join(__dirname, 'index-simple.html'));
});

// Handle form submission
app.post('/', (req, res) => {
  try {
    const formData = req.body;
    
    // Add timestamp
    formData.timestamp = new Date().toISOString();
    
    // Read existing submissions
    const submissions = readSubmissions();
    
    // Add new submission
    submissions.push(formData);
    
    // Save submissions
    const saved = writeSubmissions(submissions);
    
    if (saved) {
      console.log('Form submission saved:', formData);
      res.status(200).send('Form submitted successfully');
    } else {
      console.error('Failed to save form submission');
      res.status(500).send('Failed to save form submission');
    }
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).send('Error processing form submission');
  }
});

// View submissions (admin endpoint)
app.get('/submissions', (req, res) => {
  const submissions = readSubmissions();
  res.json(submissions);
});

// Hotel management endpoints
app.get('/api/hotels', (req, res) => {
  const hotels = readHotels();
  res.json(hotels);
});

app.post('/api/hotels', (req, res) => {
  try {
    const hotelData = req.body;
    hotelData.id = Date.now().toString();
    hotelData.createdAt = new Date().toISOString();
    
    const hotels = readHotels();
    hotels.push(hotelData);
    
    const saved = writeHotels(hotels);
    if (saved) {
      console.log('Hotel created:', hotelData);
      res.status(201).json(hotelData);
    } else {
      res.status(500).json({ error: 'Failed to save hotel' });
    }
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ error: 'Error creating hotel' });
  }
});

app.put('/api/hotels/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    
    const hotels = readHotels();
    const index = hotels.findIndex(h => h.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    hotels[index] = { ...hotels[index], ...updatedData, updatedAt: new Date().toISOString() };
    
    const saved = writeHotels(hotels);
    if (saved) {
      res.json(hotels[index]);
    } else {
      res.status(500).json({ error: 'Failed to update hotel' });
    }
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ error: 'Error updating hotel' });
  }
});

app.delete('/api/hotels/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const hotels = readHotels();
    const filteredHotels = hotels.filter(h => h.id !== id);
    
    const saved = writeHotels(filteredHotels);
    if (saved) {
      res.json({ message: 'Hotel deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete hotel' });
    }
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ error: 'Error deleting hotel' });
  }
});

// Feedback endpoints
app.post('/api/feedback', (req, res) => {
  try {
    const feedbackData = req.body;
    feedbackData.id = Date.now().toString();
    feedbackData.createdAt = new Date().toISOString();
    
    const feedback = readFeedback();
    feedback.push(feedbackData);
    
    const saved = writeFeedback(feedback);
    if (saved) {
      console.log('Feedback submitted:', feedbackData);
      res.status(201).json(feedbackData);
    } else {
      res.status(500).json({ error: 'Failed to save feedback' });
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Error submitting feedback' });
  }
});

app.get('/api/feedback', (req, res) => {
  const feedback = readFeedback();
  res.json(feedback);
});

// Admin panel route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Feedback page route
app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'feedback.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Form submissions will be saved to submissions.json');
  console.log('Hotel data will be saved to hotels.json');
  console.log('Feedback data will be saved to feedback.json');
});
