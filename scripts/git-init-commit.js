const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

async function main() {
  const dir = path.resolve(__dirname, '..');
  console.log('Target directory:', dir);

  // 1. Initialize repository
  await git.init({ fs, dir, defaultBranch: 'main' });
  console.log('✓ Git repository initialized with branch main.');

  // Helper to list files recursively respecting .gitignore
  const ignorePatterns = [
    'node_modules',
    '.next',
    '.git',
    '.env.local',
    '.env',
    'coverage',
    'build',
    'dist'
  ];

  function getFiles(currentDir, relativePath = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    let files = [];

    for (const entry of entries) {
      if (ignorePatterns.includes(entry.name)) continue;

      const fullPath = path.join(currentDir, entry.name);
      const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        files = files.concat(getFiles(fullPath, rel));
      } else {
        files.push(rel);
      }
    }
    return files;
  }

  const filesToAdd = getFiles(dir);
  console.log(`Found ${filesToAdd.length} files to stage.`);

  // 2. Stage each file
  for (const filepath of filesToAdd) {
    await git.add({ fs, dir, filepath });
  }
  console.log('✓ Staged all project files.');

  // 3. Commit
  const sha = await git.commit({
    fs,
    dir,
    message: 'Initial commit: FareLens Bus Ticket Price Comparison & Book-Now-or-Wait Engine',
    author: {
      name: 'FareLens Engineer',
      email: 'engineer@farelens.in'
    }
  });

  console.log('✓ Committed successfully! Commit SHA:', sha);
}

main().catch(err => {
  console.error('Git error:', err);
  process.exit(1);
});
