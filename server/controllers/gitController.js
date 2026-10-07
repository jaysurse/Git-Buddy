import { GIT_COMMAND_CATEGORIES, matchNaturalLanguageGoal, diagnoseGitError } from '../services/gitService.js';

/**
 * Controller to handle GET /api/git/commands
 */
export function getGitCommandsHandler(req, res) {
  const { search, goal } = req.query;

  if (goal) {
    const matched = matchNaturalLanguageGoal(goal);
    return res.json({
      success: true,
      data: {
        goal,
        matchedResult: matched,
      },
    });
  }

  if (search) {
    const q = search.toLowerCase().trim();
    const filtered = GIT_COMMAND_CATEGORIES.map((cat) => ({
      ...cat,
      commands: cat.commands.filter(
        (cmd) => cmd.cmd.toLowerCase().includes(q) || cmd.description.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.commands.length > 0);

    return res.json({
      success: true,
      data: {
        categories: filtered,
      },
    });
  }

  res.json({
    success: true,
    data: {
      categories: GIT_COMMAND_CATEGORIES,
    },
  });
}

/**
 * Controller to handle POST /api/git/explain-error
 */
export function explainGitErrorHandler(req, res) {
  const { error } = req.body;
  const diagnosis = diagnoseGitError(error);

  res.json({
    success: true,
    data: diagnosis,
  });
}
