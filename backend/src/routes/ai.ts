import { Router } from 'express';
import { generateText } from 'ai';
import { xai } from '@ai-sdk/xai';

const router = Router();

// Ask AI a question
router.post('/query', async (req, res) => {
  try {
    const { teamId, question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Generate response using xAI
    const { text } = await generateText({
      model: xai('grok-2-1212'),
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for the ${teamId} team. Help answer questions about team projects, tasks, and performance. Be concise and helpful.`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      maxTokens: 500,
    });

    res.json({ answer: text });
  } catch (error: any) {
    console.error('AI query error:', error);
    res.status(500).json({ 
      error: 'Failed to process AI query',
      message: error.message 
    });
  }
});

// Get team summary
router.get('/team-summary/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    const { text } = await generateText({
      model: xai('grok-2-1212'),
      messages: [
        {
          role: 'user',
          content: `Provide a brief summary of the ${teamId} team's current status, including recent activities and key metrics.`,
        },
      ],
      maxTokens: 300,
    });

    res.json({ summary: text });
  } catch (error: any) {
    console.error('Team summary error:', error);
    res.status(500).json({ 
      error: 'Failed to generate team summary',
      message: error.message 
    });
  }
});

// Get AI suggestions
router.get('/suggestions/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    const { text } = await generateText({
      model: xai('grok-2-1212'),
      messages: [
        {
          role: 'user',
          content: `Provide 3-5 actionable suggestions to improve the ${teamId} team's productivity and collaboration.`,
        },
      ],
      maxTokens: 400,
    });

    // Parse suggestions from text
    const suggestions = text.split('\n').filter(line => line.trim().length > 0);

    res.json({ suggestions });
  } catch (error: any) {
    console.error('Suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to generate suggestions',
      message: error.message 
    });
  }
});

export { router as aiRouter };
