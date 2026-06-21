Playwright Automation Suite - Generic README

Overview
This document explains how to pull automation code from a Git branch and run a Playwright test suite.

Prerequisites
1. Git installed
2. Node.js LTS and npm installed
3. Internet access for dependency and browser installation

Get code from Git branch

Option A: Repository already exists locally
1. Open terminal in your repository folder.
2. Fetch remote updates:
   git fetch --all --prune
3. Switch to your branch:
   git checkout <branch-name>
4. Pull latest branch changes:
   git pull origin <branch-name>

If the branch is not available locally:
git checkout -b <branch-name> origin/<branch-name>

Option B: Fresh clone
1. Clone repository:
   git clone <repo-url>
2. Enter project folder:
   cd <repo-folder>
3. Checkout branch:
   git checkout -b <branch-name> origin/<branch-name>

Install project dependencies
1. Install npm packages:
   npm install
2. Install Playwright browsers:
   npx playwright install

Run test suite
1. Run all tests (headless):
   npm test
2. Run all tests with browser visible:
   npm run test:headed
3. Run tests in Playwright UI mode:
   npm run test:ui
4. Run a specific test file:
   npx playwright test <path-to-spec-file>

Reports
1. Open Playwright HTML report:
   npm run report
2. If your project supports Cucumber reporting, run:
   npm run test:cucumber

Troubleshooting
1. Browser binaries missing:
   npx playwright install
2. Dependencies issue:
   rm -rf node_modules package-lock.json
   npm install
3. Verify Playwright is installed:
   npx playwright --version
