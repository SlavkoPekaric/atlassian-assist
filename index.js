#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config();

const JiraWrapper = require('./lib/jira-wrapper');
const Display = require('./lib/display');

const {
  ATLASSIAN_HOST,
  ATLASSIAN_USERNAME,
  ATLASSIAN_API_TOKEN
} = process.env;

const {
  boardName,
  repoName,
  issueStatusName
} = argv;

// check for all params
if (!ATLASSIAN_HOST || !ATLASSIAN_USERNAME || !ATLASSIAN_API_TOKEN) {
  return console.log(`ATLASSIAN_HOST, ATLASSIAN_USERNAME,  ATLASSIAN_API_TOKEN are required env variables!`);
} else if (!boardName || !repoName || !issueStatusName) {
  return console.log(`--boardName, --repoName, --issueStatusName are required script params!`);
}

(async () => {
  let jira;
  
  try {
    jira = new JiraWrapper({
      host: ATLASSIAN_HOST,
      username: ATLASSIAN_USERNAME,
      password: ATLASSIAN_API_TOKEN
    })
  } catch(e) {
    console.error('Error while attemting to connect to Jira');
    process.exit(1);
  }

  try {
    const board = await jira.getBoards(boardName);
    const project = await jira.getProject(board.id);

    const issues = await jira.getIssuesByProjectAndStatus(project.key, issueStatusName)
    const issuesPretty = jira.prettifyIssuesByType(jira.groupIssuesByType(issues, 'issueLink'));

    console.log(Display.displayTitle(`RELEASE NOTES`));
    console.log(issuesPretty);

    const issueBranches = await jira.getIssueCollectionBranches(issues, repoName);
    
    if (issueBranches) {
      console.log(Display.displayTitle(`BRANCHES`));
      console.log(jira.prettifyBranchList(issueBranches));
    }
    
  } catch(e) {
    console.error('Error while attemting to get issue data');
  }
  
})()
