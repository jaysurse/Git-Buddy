import { askBuddy } from '../services/aiService.js';

/**
 * Controller to handle POST /api/ai/ask
 */
export async function askBuddyHandler(req, res, next) {
  try {
    const { question, repositoryContext } = req.body;
    const response = await askBuddy(question, repositoryContext);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
}
