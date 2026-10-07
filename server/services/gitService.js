/**
 * Git Assistant & Error Diagnostician Service.
 * Provides categorized commands, natural-language goal-to-command matching,
 * and comprehensive diagnosis for common Git errors.
 */

// Categorized Git Commands
export const GIT_COMMAND_CATEGORIES = [
  {
    category: 'Setup & Config',
    description: 'Initial repository setup and user identity configuration.',
    commands: [
      {
        cmd: 'git init',
        description: 'Initialize a brand new local Git repository in the current folder.',
        example: 'git init',
      },
      {
        cmd: 'git clone <url>',
        description: 'Download an existing repository from a remote host like GitHub.',
        example: 'git clone https://github.com/facebook/react.git',
      },
      {
        cmd: 'git config --global user.name "<name>"',
        description: 'Set your commit author name globally.',
        example: 'git config --global user.name "Jane Doe"',
      },
      {
        cmd: 'git config --global user.email "<email>"',
        description: 'Set your commit email address globally.',
        example: 'git config --global user.email "jane@example.com"',
      },
    ],
  },
  {
    category: 'Branches',
    description: 'Create, switch, list, and delete isolated lines of development.',
    commands: [
      {
        cmd: 'git checkout -b <branch-name>',
        description: 'Create a new branch and switch to it immediately.',
        example: 'git checkout -b feature-login',
      },
      {
        cmd: 'git switch -c <branch-name>',
        description: 'Modern Git command to create and switch to a new branch.',
        example: 'git switch -c fix-navbar',
      },
      {
        cmd: 'git branch',
        description: 'List all local branches in the repository.',
        example: 'git branch',
      },
      {
        cmd: 'git branch -a',
        description: 'List both local and remote-tracking branches.',
        example: 'git branch -a',
      },
      {
        cmd: 'git branch -d <branch-name>',
        description: 'Safely delete a merged local branch.',
        example: 'git branch -d feature-login',
      },
    ],
  },
  {
    category: 'Commits & Staging',
    description: 'Stage changes and save project snapshots.',
    commands: [
      {
        cmd: 'git status',
        description: 'Check the state of the working directory and staging area.',
        example: 'git status',
      },
      {
        cmd: 'git add <file>',
        description: 'Stage a specific file for the next commit snapshot.',
        example: 'git add src/App.jsx',
      },
      {
        cmd: 'git add .',
        description: 'Stage all modified and new files in the current project.',
        example: 'git add .',
      },
      {
        cmd: 'git commit -m "<message>"',
        description: 'Commit staged changes with a descriptive message.',
        example: 'git commit -m "feat: add user authentication"',
      },
      {
        cmd: 'git log --oneline --graph',
        description: 'View a clean, condensed visual history of recent commits.',
        example: 'git log --oneline --graph -n 10',
      },
    ],
  },
  {
    category: 'Remote & Sync',
    description: 'Push, fetch, and pull commits with GitHub or other remote remotes.',
    commands: [
      {
        cmd: 'git push -u origin <branch>',
        description: 'Push local branch to remote repository and set upstream tracking.',
        example: 'git push -u origin feature-login',
      },
      {
        cmd: 'git pull',
        description: 'Fetch and immediately merge changes from remote into current branch.',
        example: 'git pull origin main',
      },
      {
        cmd: 'git fetch',
        description: 'Download objects and refs from remote without modifying local files.',
        example: 'git fetch origin',
      },
      {
        cmd: 'git remote -v',
        description: 'Show URL addresses of all connected remote repositories.',
        example: 'git remote -v',
      },
    ],
  },
  {
    category: 'Merge & Rebase',
    description: 'Integrate changes between branches.',
    commands: [
      {
        cmd: 'git merge <branch>',
        description: 'Merge specified branch history into the currently active branch.',
        example: 'git merge feature-login',
      },
      {
        cmd: 'git rebase <base-branch>',
        description: 'Re-apply commits on top of another base tip for a clean linear history.',
        example: 'git rebase main',
      },
      {
        cmd: 'git merge --abort',
        description: 'Abort a conflicted merge and restore the pre-merge state.',
        example: 'git merge --abort',
      },
    ],
  },
  {
    category: 'Stash & Temporary Work',
    description: 'Shelve dirty working state without committing.',
    commands: [
      {
        cmd: 'git stash',
        description: 'Save modified tracked files to a temporary clipboard.',
        example: 'git stash',
      },
      {
        cmd: 'git stash pop',
        description: 'Restore the most recently stashed changes and remove from stash list.',
        example: 'git stash pop',
      },
      {
        cmd: 'git stash list',
        description: 'View all saved stashes.',
        example: 'git stash list',
      },
    ],
  },
  {
    category: 'Undo & Reset',
    description: 'Safely recover from mistakes and rollback changes.',
    commands: [
      {
        cmd: 'git restore <file>',
        description: 'Discard uncommitted changes in a specific file.',
        example: 'git restore src/index.css',
      },
      {
        cmd: 'git restore --staged <file>',
        description: 'Unstage a file while keeping your modifications.',
        example: 'git restore --staged package.json',
      },
      {
        cmd: 'git reset --soft HEAD~1',
        description: 'Undo the last commit, keeping all changed files staged.',
        example: 'git reset --soft HEAD~1',
      },
      {
        cmd: 'git revert <commit-hash>',
        description: 'Safely create a new commit that inverts the changes of a past commit.',
        example: 'git revert 7a9b2c3',
      },
    ],
  },
  {
    category: 'Collaboration',
    description: 'Tags, diffs, and team workflows.',
    commands: [
      {
        cmd: 'git diff',
        description: 'Show unstaged line-by-line differences since last commit.',
        example: 'git diff',
      },
      {
        cmd: 'git tag -a v1.0.0 -m "Release version 1.0"',
        description: 'Create an annotated release tag pointing to current commit.',
        example: 'git tag -a v1.0.0 -m "Initial release"',
      },
      {
        cmd: 'git push origin --tags',
        description: 'Push all local tags to GitHub.',
        example: 'git push origin --tags',
      },
    ],
  },
];

// Natural language intent patterns
const INTENT_PATTERNS = [
  {
    keywords: ['new branch', 'create branch', 'make branch', 'start branch'],
    command: 'git checkout -b <branch-name>',
    explanation: 'Creates a new branch starting from your current commit and switches to it immediately.',
  },
  {
    keywords: ['switch branch', 'change branch', 'go to branch'],
    command: 'git checkout <branch-name>',
    explanation: 'Switches your working directory to an existing branch.',
  },
  {
    keywords: ['undo last commit', 'cancel commit', 'uncommit'],
    command: 'git reset --soft HEAD~1',
    explanation: 'Undoes your most recent commit and keeps all the file changes staged so you can adjust them.',
  },
  {
    keywords: ['discard changes', 'revert file', 'throw away changes'],
    command: 'git restore <file-path>',
    explanation: 'Discards uncommitted local changes and restores the file to the last committed state.',
  },
  {
    keywords: ['rename branch', 'change branch name'],
    command: 'git branch -m <new-branch-name>',
    explanation: 'Renames the currently checked-out branch to the new name.',
  },
  {
    keywords: ['save work temporarily', 'save without commit', 'stash'],
    command: 'git stash',
    explanation: 'Shelves your current uncommitted changes so you have a clean working tree.',
  },
  {
    keywords: ['restore stash', 'get stashed work back', 'pop stash'],
    command: 'git stash pop',
    explanation: 'Applies your shelved changes back to your working tree and deletes them from the stash list.',
  },
  {
    keywords: ['pull latest', 'update my branch', 'sync with github', 'get changes'],
    command: 'git pull origin <branch-name>',
    explanation: 'Downloads and integrates the latest changes from the remote GitHub branch into your current branch.',
  },
  {
    keywords: ['push first time', 'publish branch', 'push new branch'],
    command: 'git push -u origin <branch-name>',
    explanation: 'Pushes your local branch to GitHub and sets up upstream tracking for future git push calls.',
  },
  {
    keywords: ['view history', 'see commits', 'commit log'],
    command: 'git log --oneline --graph',
    explanation: 'Displays a clean, compact one-line visual history of recent commits.',
  },
];

export function matchNaturalLanguageGoal(query) {
  if (!query || typeof query !== 'string') return null;
  const lower = query.toLowerCase().trim();

  for (const intent of INTENT_PATTERNS) {
    if (intent.keywords.some((kw) => lower.includes(kw))) {
      return {
        matched: true,
        command: intent.command,
        explanation: intent.explanation,
      };
    }
  }

  // Fallback search across all commands
  for (const cat of GIT_COMMAND_CATEGORIES) {
    for (const cmd of cat.commands) {
      if (cmd.description.toLowerCase().includes(lower) || cmd.cmd.toLowerCase().includes(lower)) {
        return {
          matched: true,
          command: cmd.example || cmd.cmd,
          explanation: cmd.description,
        };
      }
    }
  }

  return {
    matched: false,
    command: 'git status',
    explanation: "Check the current status of your repository to see what files were modified or staged.",
  };
}

// Common Git Errors Knowledge Base
const ERROR_DIAGNOSES = [
  {
    pattern: /fatal:\s*not a git repository/i,
    name: 'Not a Git Repository',
    whatHappened: 'Git cannot find a `.git` folder in your current directory or any parent directories.',
    whyItHappened: 'You are running a git command inside a folder that has not been initialized with Git yet, or you are in the wrong directory.',
    howToFix: 'Navigate (`cd`) into your actual project folder containing the `.git` directory, or initialize a new Git repository here.',
    exampleCommand: 'git init\n# Or cd into your repository:\ncd path/to/your/project',
  },
  {
    pattern: /error:\s*failed to push some refs to/i,
    name: 'Remote Has Newer Commits (Push Rejected)',
    whatHappened: 'GitHub rejected your push because the remote branch has commits that you do not have locally.',
    whyItHappened: 'Someone else pushed commits to this branch, or you edited files directly on GitHub (like README or licenses).',
    howToFix: 'Pull the remote changes into your local branch first, resolve any conflicts if prompted, and then push again.',
    exampleCommand: 'git pull --rebase origin <branch-name>\ngit push origin <branch-name>',
  },
  {
    pattern: /error:\s*Your local changes to the following files would be overwritten by (checkout|merge)/i,
    name: 'Uncommitted Changes Would Be Overwritten',
    whatHappened: 'Git refused to switch branches or merge because you have local modified files that would be overwritten.',
    whyItHappened: 'You have unstaged or uncommitted changes in files that differ in the incoming branch.',
    howToFix: 'Either commit your changes, stash them temporarily, or discard them if you no longer need them.',
    exampleCommand: '# Option A: Stash changes temporarily\ngit stash\ngit checkout <branch>\ngit stash pop\n\n# Option B: Discard changes\ngit restore .',
  },
  {
    pattern: /CONFLICT \(content\):\s*Merge conflict in/i,
    name: 'Merge Conflict Detected',
    whatHappened: 'Git could not automatically combine changes from two branches because the same lines were modified differently.',
    whyItHappened: 'Both branches modified the exact same section of a file, requiring human decision on which version to keep.',
    howToFix: 'Open the conflicted files in your editor, look for the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), choose the correct code, remove markers, stage the file, and commit.',
    exampleCommand: '# 1. Inspect conflicted files\ngit status\n# 2. After editing and saving files:\ngit add .\ngit commit -m "fix: resolve merge conflicts"',
  },
  {
    pattern: /fatal:\s*Authentication failed for/i,
    name: 'Git Authentication Failed',
    whatHappened: 'GitHub rejected your login credentials or personal access token.',
    whyItHappened: 'GitHub no longer accepts account passwords for Git operations. You must use a Personal Access Token (PAT) or SSH key.',
    howToFix: 'Create a GitHub Personal Access Token with `repo` permissions at github.com/settings/tokens, and use it as your password.',
    exampleCommand: '# Update remote to use SSH or set up GitHub CLI:\ngh auth login',
  },
  {
    pattern: /fatal:\s*refusing to merge unrelated histories/i,
    name: 'Unrelated Histories',
    whatHappened: 'Git refuses to merge two branches that do not share a common commit history.',
    whyItHappened: 'Often occurs when you create a repo on GitHub with a README and initialize a local repo separately without cloning.',
    howToFix: 'Instruct Git to allow merging unrelated histories.',
    exampleCommand: 'git pull origin main --allow-unrelated-histories',
  },
  {
    pattern: /You are in 'detached HEAD' state/i,
    name: 'Detached HEAD State',
    whatHappened: 'You checked out a specific commit hash or tag rather than a named branch pointer.',
    whyItHappened: 'You ran `git checkout <hash>`. Commits made now will not belong to any branch and can become lost.',
    howToFix: 'If you want to save any new work, create a new branch immediately. Otherwise, switch back to your normal branch.',
    exampleCommand: '# Save changes into a new branch:\ngit switch -c my-new-branch\n# Or return to your main branch:\ngit switch main',
  },
];

export function diagnoseGitError(errorMessage) {
  if (!errorMessage || typeof errorMessage !== 'string') {
    return {
      name: 'Unrecognized Error',
      whatHappened: 'No error message provided.',
      whyItHappened: 'Please paste the terminal error message.',
      howToFix: 'Check git status to inspect your working tree.',
      exampleCommand: 'git status',
    };
  }

  for (const diag of ERROR_DIAGNOSES) {
    if (diag.pattern.test(errorMessage)) {
      return {
        name: diag.name,
        whatHappened: diag.whatHappened,
        whyItHappened: diag.whyItHappened,
        howToFix: diag.howToFix,
        exampleCommand: diag.exampleCommand,
      };
    }
  }

  return {
    name: 'General Git Issue',
    whatHappened: 'Git encountered an unexpected state or unrecognized error.',
    whyItHappened: 'The error text was not matched against standard common error signatures.',
    howToFix: 'Check your repository status and branch history to see what state Git is currently in.',
    exampleCommand: 'git status\ngit log -n 3 --oneline',
  };
}
