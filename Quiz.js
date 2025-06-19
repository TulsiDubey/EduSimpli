import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  LinearProgress,
} from '@mui/material';

// Sample quiz questions - you can expand this with more questions
const quizQuestions = {
  chemistry: {
    'Solutions': [
      {
        question: 'What is a solution?',
        options: [
          'A homogeneous mixture of two or more substances',
          'A heterogeneous mixture of two or more substances',
          'A pure substance',
          'A compound',
        ],
        correctAnswer: 0,
      },
      {
        question: 'What is the unit of molarity?',
        options: [
          'mol/L',
          'g/L',
          'mol/kg',
          'g/mol',
        ],
        correctAnswer: 0,
      },
    ],
    'Electrochemistry': [
      {
        question: 'What is an electrochemical cell?',
        options: [
          'A device that converts chemical energy to electrical energy',
          'A device that converts electrical energy to chemical energy',
          'A device that stores electrical energy',
          'A device that measures electrical current',
        ],
        correctAnswer: 0,
      },
    ],
  },
  physics: {
    'Electric Charges and Fields': [
      {
        question: "What is Coulomb's Law?",
        options: [
          'The force between two charges is directly proportional to the product of charges and inversely proportional to the square of distance',
          'The force between two charges is directly proportional to the square of distance',
          'The force between two charges is independent of distance',
          'The force between two charges is always attractive',
        ],
        correctAnswer: 0,
      },
    ],
    'Current Electricity': [
      {
        question: "What is Ohm's Law?",
        options: [
          'The current through a conductor is directly proportional to the voltage across it and inversely proportional to its resistance',
          'The current through a conductor is directly proportional to its resistance',
          'The voltage across a conductor is directly proportional to its resistance',
          'The current through a conductor is independent of voltage',
        ],
        correctAnswer: 0,
      },
    ],
  },
  biology: {
    'Sexual Reproduction in Flowering Plants': [
      {
        question: 'What is pollination?',
        options: [
          'The transfer of pollen from anther to stigma',
          'The fusion of male and female gametes',
          'The development of seed',
          'The formation of fruit',
        ],
        correctAnswer: 0,
      },
    ],
    'Human Reproduction': [
      {
        question: 'What is gametogenesis?',
        options: [
          'The process of formation of gametes',
          'The process of fertilization',
          'The process of embryo development',
          'The process of cell division',
        ],
        correctAnswer: 0,
      },
    ],
  },
};

function Quiz({ open, onClose, subject, topic }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const questions = quizQuestions[subject]?.[topic] || [];
  const progress = (currentQuestion / questions.length) * 100;

  const handleAnswerSelect = (event) => {
    setSelectedAnswer(parseInt(event.target.value));
  };

  const handleNext = () => {
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    onClose();
  };

  if (!questions.length) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Quiz Not Available</DialogTitle>
        <DialogContent>
          <Typography>
            Quiz questions for this topic are not available yet.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">
          {topic} - Quiz
        </Typography>
        <LinearProgress variant="determinate" value={progress} />
      </DialogTitle>
      <DialogContent>
        {!showResults ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="body1">
                {questions[currentQuestion].question}
              </Typography>
            </Paper>
            <FormControl component="fieldset">
              <FormLabel component="legend">Select your answer:</FormLabel>
              <RadioGroup
                value={selectedAnswer}
                onChange={handleAnswerSelect}
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        ) : (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Quiz Completed!
            </Typography>
            <Typography variant="h6">
              Your Score: {score} out of {questions.length}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {score === questions.length
                ? 'Perfect score! Excellent work!'
                : score >= questions.length / 2
                ? 'Good job! Keep practicing!'
                : 'Keep studying! You can do better!'}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!showResults ? (
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            variant="contained"
          >
            {currentQuestion + 1 === questions.length ? 'Finish' : 'Next'}
          </Button>
        ) : (
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default Quiz; 