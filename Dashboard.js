import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Science as ScienceIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Quiz as QuizIcon,
  Visibility,
  ExpandMore,
  PlayCircle as PlayCircleIcon,
  Assessment as AssignmentIcon,
  Functions,
  Biotech as BiotechIcon,
  FlashOn,
  Close,
  CloseIcon,
  Logout,
  Refresh,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  LocalLibrary as LibraryIcon,
} from '@mui/icons-material';
import SubjectContent from './SubjectContent';

function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('physics');
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [visualizationOpen, setVisualizationOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [dialogData, setDialogData] = useState({});
  const navigate = useNavigate();
  const { currentUser, userProfile: authUserProfile, logout, isInitialized, error: authError } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!currentUser) {
          console.log('No user, redirecting to /login');
          navigate('/login', { replace: true });
          return;
        }
        if (!authUserProfile || !authUserProfile.profileCompleted) {
          console.log('No profile or incomplete:', authUserProfile);
          navigate('/profile-setup', { replace: true });
          return;
        }
        const profileData = authUserProfile;
        console.log('Dashboard profile:', profileData);
        if (!profileData.name || !profileData.standard || !profileData.subjects?.length) {
          setError('Incomplete profile. Please complete your profile setup.');
          navigate('/profile-setup', { replace: true });
          return;
        }
        setUserProfile(profileData);
        setSelectedSubject(profileData.subjects[0] || 'physics');
        setSubjects(profileData.subjects || []);
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        await loadModules();
        await loadTopics();
      } catch (error) {
        console.error('Profile load error:', error.code, error.message);
        setError(`Failed to load profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [currentUser, authUserProfile, navigate]);

  if (!isInitialized) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Initializing...
          </Typography>
        </Box>
      </Container>
    );
  }

  const loadModules = async () => {
    try {
      const modulesRef = collection(db, 'modules');
      const modulesSnap = await getDocs(modulesRef);
      const modulesData = modulesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setModules(modulesData);
    } catch (error) {
      console.error('Modules load error:', error.code, error.message);
      setError('Failed to load modules.');
    }
  };

  const loadTopics = async () => {
    try {
      const topicsRef = collection(db, 'topics');
      const topicsSnap = await getDocs(topicsRef);
      const topicsData = topicsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTopics(topicsData);
    } catch (error) {
      console.error('Topics load error:', error.code, error.message);
      setError('Failed to load topics.');
    }
  };

  const handleSubjectChange = (event, newValue) => {
    setSelectedSubject(newValue);
    setSelectedModule(null);
  };

  const handleTopicClick = async (topic) => {
    try {
      if (!currentUser) {
        navigate('/login', { replace: true });
        return;
      }

      setSelectedTopic(topic);
      setTopicDialogOpen(true);
    } catch (error) {
      console.error('Topic click error:', error.code, error.message);
      setError('Failed to load topic.');
    }
  };

  const handleModuleClick = async (module) => {
    try {
      if (!currentUser) {
        navigate('/login', { replace: true });
        return;
      }

      setSelectedModule(module);
      setModuleDialogOpen(true);
    } catch (error) {
      console.error('Module click error:', error.code, error.message);
      setError('Failed to load module.');
    }
  };

  const handleVisualization = (topic) => {
    setSelectedTopic(topic);
    setVisualizationOpen(true);
  };

  const handleQuiz = (topic) => {
    setSelectedTopic(topic);
    setQuizOpen(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      const profileRef = doc(db, 'users', currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        console.log('Refresh profile:', profileData); // Debug
        if (!profileData.name || !profileData.standard || !profileData.subjects?.length) {
          setError('Incomplete profile. Please complete your profile setup.');
          navigate('/profile-setup', { replace: true });
          return;
        }
        setUserProfile(profileData);
        localStorage.setItem('userProfile', JSON.stringify(profileData));
      } else {
        navigate('/profile-setup', { replace: true });
      }
    } catch (err) {
      console.error('Refresh error:', err.code, err.message);
      setError(`Failed to refresh data: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      setError('');
      await logout();
      localStorage.removeItem('userProfile');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err.code, err.message);
      setError(`Failed to log out: ${err.message}`);
    }
  };

  const handleAdd = (type) => {
    setDialogType(type);
    setDialogData({});
    setOpenDialog(true);
  };

  const handleEdit = (type, data) => {
    setDialogType(type);
    setDialogData(data);
    setOpenDialog(true);
  };

  const handleDelete = async (type, id) => {
    try {
      if (!currentUser) {
        navigate('/login', { replace: true });
        return;
      }

      switch (type) {
        case 'module':
          await deleteDoc(doc(db, 'modules', id));
          await loadModules();
          break;
        case 'topic':
          await deleteDoc(doc(db, 'topics', id));
          await loadTopics();
          break;
        default:
          throw new Error('Invalid type');
      }
    } catch (error) {
      console.error('Delete error:', error.code, error.message);
      setError(`Failed to delete: ${error.message}`);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setDialogType('');
    setDialogData({});
  };

  const handleDialogSave = async () => {
    try {
      if (!currentUser) {
        navigate('/login', { replace: true });
        return;
      }

      switch (dialogType) {
        case 'module':
          const moduleRef = doc(collection(db, 'modules'));
          await setDoc(moduleRef, {
            ...dialogData,
            subject: selectedSubject,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          await loadModules();
          break;
        case 'topic':
          const topicRef = doc(collection(db, 'topics'));
          await setDoc(topicRef, {
            ...dialogData,
            subject: selectedSubject,
            moduleId: selectedModule?.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          await loadTopics();
          break;
        default:
          throw new Error('Invalid dialog type');
      }

      handleDialogClose();
    } catch (error) {
      console.error('Dialog save error:', error.code, error.message);
      setError(`Failed to save: ${error.message}`);
    }
  };

  const getSubjectIcon = (subject) => {
    switch (subject.toLowerCase()) {
      case 'physics':
        return <ScienceIcon />;
      case 'chemistry':
        return <BiotechIcon />;
      case 'biology':
        return <BiotechIcon />;
      case 'mathematics':
        return <CalculateIcon />;
      default:
        return <ScienceIcon />;
    }
  };

  const getContent = () => {
    const content = {
      physics: {
        class9: {
          title: 'Class 9 Physics',
          topics: ['Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy', 'Sound'],
        },
        class10: {
          title: 'Class 10 Physics',
          topics: [
            'Light - Reflection and Refraction',
            'Human Eye and Colorful World',
            'Electricity',
            'Magnetic Effects of Electric Current',
            'Sources of Energy',
          ],
        },
        class11: {
          title: 'Class 11 Physics',
          topics: [
            'Physical World',
            'Units and Measurements',
            'Motion in a Straight Line',
            'Motion in a Plane',
            'Laws of Motion',
          ],
        },
        class12: {
          title: 'Class 12 Physics',
          topics: [
            'Electric Charges and Fields',
            'Electrostatic Potential and Capacitance',
            'Current Electricity',
            'Moving Charges and Magnetism',
            'Magnetism and Matter',
          ],
        },
      },
      chemistry: {
        class9: {
          title: 'Class 9 Chemistry',
          topics: ['Matter in Our Surroundings', 'Is Matter Around Us Pure', 'Atoms and Molecules', 'Structure of the Atom'],
        },
        class10: {
          title: 'Class 10 Chemistry',
          topics: ['Chemical Reactions and Equations', 'Acids, Bases and Salts', 'Metals and Non-metals', 'Carbon and its Compounds'],
        },
        class11: {
          title: 'Class 11 Chemistry',
          topics: ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements', 'Chemical Bonding'],
        },
        class12: {
          title: 'Class 12 Chemistry',
          topics: ['The Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry'],
        },
      },
      biology: {
        class9: {
          title: 'Class 9 Biology',
          topics: ['The Fundamental Unit of Life', 'Tissues', 'Diversity in Living Organisms', 'Why Do We Fall Ill'],
        },
        class10: {
          title: 'Class 10 Biology',
          topics: ['Life Processes', 'Control and Coordination', 'How do Organisms Reproduce', 'Heredity and Evolution'],
        },
        class11: {
          title: 'Class 11 Biology',
          topics: ['The Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom'],
        },
        class12: {
          title: 'Class 12 Biology',
          topics: ['Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants', 'Human Reproduction', 'Reproductive Health'],
        },
      },
      mathematics: {
        class9: {
          title: 'Class 9 Mathematics',
          topics: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations in Two Variables'],
        },
        class10: {
          title: 'Class 10 Mathematics',
          topics: ['Real Numbers', 'Polynomials', 'Pair of Linear Equations', 'Quadratic Equations'],
        },
        class11: {
          title: 'Class 11 Mathematics',
          topics: ['Sets', 'Relations and Functions', 'Trigonometric Functions', 'Complex Numbers'],
        },
        class12: {
          title: 'Class 12 Mathematics',
          topics: [
            'Relations and Functions',
            'Inverse Trigonometric Functions',
            'Matrices',
            'Determinants',
            'Continuity and Differentiability',
          ],
        },
      },
    };

    const standardStr = String(userProfile?.standard || '');
    const standardKey = `class${standardStr}`;
    const contentData = content[selectedSubject]?.[standardKey];
    if (!contentData) {
      console.warn(`No content for ${selectedSubject} ${standardKey}`); // Debug
    }
    return contentData || { title: 'No Content Available', topics: [] };
  };

  const TopicDialog = ({ topic, open, onClose }) => {
    if (!topic) return null;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{topic.name}</Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Explanation
            </Typography>
            <Typography variant="body1" paragraph>
              {topic.explanation || 'No explanation available.'}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              Real-World Example
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body1">{topic.realWorldExample || 'No example available.'}</Typography>
            </Paper>
          </Box>

          {topic.equation && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom color="success.main">
                Key Equations
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'success.50', fontFamily: 'monospace' }}>
                <Typography variant="body1" component="pre">
                  {topic.equation}
                </Typography>
              </Paper>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Key Points
            </Typography>
            <List>
              {(topic.keyPoints || []).map((point, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Chip size="small" label={index + 1} />
                  </ListItemIcon>
                  <ListItemText primary={point} />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Interactive Learning
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Visibility />}
                  onClick={() => {
                    onClose();
                    handleVisualization(topic);
                  }}
                  sx={{ mb: 1 }}
                >
                  Visualize Concept
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<QuizIcon />}
                  onClick={() => {
                    onClose();
                    handleQuiz(topic);
                  }}
                >
                  Take Quiz
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading your dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || authError) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Retry
              </Button>
            }
          >
            {error || authError}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!userProfile) {
    return null;
  }

  const standardStr = String(userProfile.standard);
  if (!['9', '10', '11', '12'].includes(standardStr)) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            Invalid class selected. Please update your profile.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {(error || authError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || authError}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Box>
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <CircularProgress size={24} /> : <Refresh />}
          </IconButton>
          <IconButton onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Tabs
          value={selectedSubject}
          onChange={handleSubjectChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {subjects.map((subject) => (
            <Tab
              key={subject}
              value={subject}
              icon={getSubjectIcon(subject)}
              label={subject.charAt(0).toUpperCase() + subject.slice(1)}
            />
          ))}
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <SubjectContent content={getContent()} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleAdd('module')}
                >
                  Add Module
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleAdd('topic')}
                >
                  Add Topic
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogType === 'module' ? 'Add Module' : 'Add Topic'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={dialogData.name || ''}
            onChange={(e) => setDialogData({ ...dialogData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={dialogData.description || ''}
            onChange={(e) => setDialogData({ ...dialogData, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={moduleDialogOpen} onClose={() => setModuleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedModule?.name || 'Module Details'}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{selectedModule?.description || 'No description available.'}</Typography>
          <List>
            {topics
              .filter((topic) => topic.moduleId === selectedModule?.id)
              .map((topic) => (
                <ListItem key={topic.id}>
                  <ListItemText primary={topic.name} secondary={topic.description || ''} />
                  <IconButton onClick={() => handleEdit('topic', topic)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete('topic', topic.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModuleDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setModuleDialogOpen(false);
              handleAdd('topic');
            }}
          >
            Add Topic
          </Button>
        </DialogActions>
      </Dialog>

      <TopicDialog topic={selectedTopic} open={topicDialogOpen} onClose={() => setTopicDialogOpen(false)} />
    </Container>
  );
}

export default Dashboard;