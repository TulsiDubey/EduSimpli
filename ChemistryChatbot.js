import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { Science as ScienceIcon, Biotech as BiotechIcon } from '@mui/icons-material';

const ChemistryChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('chemistry');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubjectChange = (event, newSubject) => {
    if (newSubject !== null) {
      setSubject(newSubject);
      setMessages([]); // Clear messages when switching subjects
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          subject: subject
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { 
          text: data.response, 
          sender: 'bot',
          confidence: data.confidence,
          subject: data.subject
        }]);
      } else {
        setError(data.error || 'Failed to get response from the model');
        setMessages(prev => [...prev, { 
          text: 'Sorry, I encountered an error. Please try again.', 
          sender: 'bot',
          error: true 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to connect to the server. Please try again.');
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'bot',
        error: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      maxWidth: 800,
      margin: '0 auto',
      p: 2
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          mb: 2, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">
            {subject === 'chemistry' ? 'Chemistry' : 'Biology'} Assistant
          </Typography>
          <ToggleButtonGroup
            value={subject}
            exclusive
            onChange={handleSubjectChange}
            size="small"
            sx={{ bgcolor: 'white' }}
          >
            <ToggleButton value="chemistry">
              <ScienceIcon sx={{ mr: 1 }} />
              Chemistry
            </ToggleButton>
            <ToggleButton value="biology">
              <BiotechIcon sx={{ mr: 1 }} />
              Biology
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <List sx={{ 
          flex: 1, 
          overflow: 'auto',
          p: 2
        }}>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              <ListItem 
                sx={{ 
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2
                  }}
                >
                  <ListItemText 
                    primary={message.text}
                    secondary={message.confidence && `Confidence: ${(message.confidence * 100).toFixed(1)}%`}
                  />
                </Paper>
              </ListItem>
              {index < messages.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>

        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={`Ask a ${subject} question...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              multiline
              maxRows={4}
            />
            <IconButton 
              color="primary" 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              sx={{ alignSelf: 'flex-end' }}
            >
              {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChemistryChatbot; 