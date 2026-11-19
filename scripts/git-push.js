const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

async function main() {
  const repoUrl = process.argv[2];
  const token = process.argv[3];

  if (!repoUrl) {
    console.log('Usage: node scripts/git-push.js <github-repo-url> [github-token]');
    process.exit(1);
  }

  const dir = path.resolve(__dirname, '..');

  // Add remote
  try {
    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: repoUrl,
      force: true
    });
    console.log(`✓ Added remote origin: ${repoUrl}`);
  } catch (e) {
    console.log('Remote note:', e.message);
  }

  if (token) {
    console.log('Pushing to GitHub on branch main...');
    await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      onAuth: () => ({ username: token })
    });
    console.log('✓ Successfully pushed to GitHub!');
  } else {
    console.log('\nRemote configured. To push using personal access token:');
    console.log(`node scripts/git-push.js "${repoUrl}" "<YOUR_GITHUB_TOKEN>"`);
  }
}

main().catch(err => {
  console.error('Push error:', err);
  process.exit(1);
});
