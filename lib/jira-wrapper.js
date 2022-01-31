const async = require("async");
const _ = require("lodash");
const chalk = require('chalk');
const slugify = require('slugify');
const JiraApi = require('jira-client');

module.exports = class JiraWrapper {
  
  constructor(settings) {
    const { host, username, password } = settings;
    
    this.settings = settings;
    this.jira = new JiraApi({
      protocol: 'https',
      host,
      username,
      password,
      apiVersion: '2',
      strictSSL: true
    });

  }

  /**
   * @description Fetch all or specified Jira boards for current user
   * @param {string} boardName
   * @returns {object}
   */
  async getBoards(boardName) {
    try {
      const boards = await this.jira.getAllBoards();

      return !boardName ? boards.values : boards.values.find(board => slugify(board.name, { lower: true }) === slugify(boardName, { lower: true }));
      /*
      {
        "id": 1,
        "self": "...",
        "name": "...",
        "type": "scrum",
        "location": {
          "projectId": ...,
          "displayName": "...",
          "projectName": "...",
          "projectKey": "...",
          "projectTypeKey": "...",
          "avatarURI": "...",
          "name": "..."
        }
      }
      */
    } catch (err) {
      console.error(err);
    }
  }
  
  /**
   * @description Fetch project by id
   * @param {string} boardId
   * @returns {object}
   */
  async getProject(boardId) {
    try {
      const res = await this.jira.getProjectsFull(boardId);
      /*
      {
        "self": "...",
        "id": "...",
        "key": "...",
        "name": "...",
        "projectTypeKey": "...",
        "simplified": ...,
        "avatarUrls": {
          "48x48": "...",
          "24x24": "...",
          "16x16": "...",
          "32x32": "..."
        }
      }
      */
      
      return res && res.values ? res.values[0] : null;
    } catch (err) {
      console.error(err);
    }
  }
  
  /**
   * @description Fetch statuses, optionally filter by project
   * @param {string} projectId
   * @returns {object}
   */
  async getStatuses(projectId = '') {
    try {
      return await this.jira.listStatus(projectId);
      /*
      [
        {
          "self": "...",
          "description": "...",
          "iconUrl": "...",
          "name": "...",
          "untranslatedName": "...",
          "id": "...",
          "statusCategory": {
            "self": "...",
            "id": ...,
            "key": "...",
            "colorName": "...",
            "name": "..."
          }
        },
        ....
      */
      
    } catch (err) {
      console.error(err);
    }
  }
  
  /**
   * @description Fetch list of branches for given task id
   * @param {string} issueId
   * @param {string} repo
   * @returns {object}
   */
  async getIssueBranches(issueId, repo) {
    try {
      const res = await this.jira.getDevStatusDetail(issueId , 'bitbucket', 'branch')
      
      // filter bu repo if provided
      return res.detail[0].branches.filter(item => {
        return repo ? slugify(item.repository.name, { lower: true }) === slugify(repo, { lower: true }) : true;
      });
      /*
      {
        "errors": [],
        "detail": [
          {
            "branches": [
              {
                "name": "...",
                "url": "...",
                "createPullRequestUrl": "...",
                "repository": {
                  "name": "...",
                  "avatar": "...",
                  "url": "...",
                  "commits": []
                },
                "lastCommit": {
                  "id": "...",
                  "displayId": "...",
                  "authorTimestamp": "...",
                  "merge": ...,
                  "files": []
                }
              }
            ],
            "pullRequests": [],
            "repositories": [],
            "_instance": {
              "singleInstance": true,
              "name": "Bitbucket",
              "typeName": "Bitbucket Cloud",
              "id": "bitbucket",
              "type": "bitbucket",
              "baseUrl": "https://bitbucket.org"
            }
          }
        ]
      }
      */
      
    } catch (err) {
      console.error(err);
    }
  }
  
  /**
   * @description Fetch issues with filters
   * @param {object} filters
   * @returns {object}
   */
  async getIssuesBy(filters) {
    try {
      let filterString = '';
      let filterArr = [];
  
      filters.forEach(filter => {
        filterArr.push(`${filter.name} ${filter.negation ? '!' : ''}= "${filter.value}"`)
      })
  
      filterString = filterArr.join(' AND ');
      
      const res = await this.jira.searchJira(filterString);
      return res ? res.issues : [];
      /*
      {
        "expand": "schema,names",
        "startAt": 0,
        "maxResults": 50,
        "total": 5,
        "issues": [
          {
            "expand": "customfield_10019.requestTypePractice,operations,versionedRepresentations,editmeta,changelog,renderedFields",
            "id": "...",
            "self": "...",
            "key": "...",
            "fields": {
              "statuscategorychangedate": "...",
              "issuetype": {
                "self": "...",
                "id": "...",
                "description": "A problem which impairs or prevents the functions of the product.",
                "iconUrl": "...",
                "name": "Bug",
                "subtask": false,
                "avatarId": ...,
                "hierarchyLevel": 0
              },
              "timespent": null,
              "project": {
                "self": "...",
                "id": "10000",
                "key": "GM",
                "name": "...",
                "projectTypeKey": "software",
                "simplified": false,
                "avatarUrls": {
                  "48x48": "...",
                  "24x24": "...",
                  "16x16": "...",
                  "32x32": "..."
                }
              },
              "fixVersions": [],
              "aggregatetimespent": null,
              "resolution": null,
              "resolutiondate": null,
              "workratio": -1,
              "lastViewed": "2021-11-05T01:48:15.336-0700",
              "watches": {
                "self": "...",
                "watchCount": 1,
                "isWatching": false
              },
              "created": "2021-11-04T06:09:09.106-0700",
              "customfield_10020": [],
              "customfield_10021": null,
              "customfield_10022": null,
              "customfield_10023": null,
              "priority": {
                "self": "...",
                "iconUrl": "...",
                "name": "Medium",
                "id": "3"
              },
              "customfield_10024": null,
              "customfield_10025": null,
              "labels": [],
              "customfield_10018": null,
              "customfield_10019": null,
              "aggregatetimeoriginalestimate": null,
              "timeestimate": null,
              "versions": [],
              "issuelinks": [
                {
                  "id": "15146",
                  "self": "...",
                  "type": {
                    "id": "10003",
                    "name": "Relates",
                    "inward": "relates to",
                    "outward": "relates to",
                    "self": "..."
                  },
                  "inwardIssue": {
                    "id": "13964",
                    "key": "...",
                    "self": "...",
                    "fields": {
                      "summary": "Dashboard design changes",
                      "status": {
                        "self": "...",
                        "description": "This issue was once resolved, but the resolution was deemed incorrect. From here issues are either marked assigned or resolved.",
                        "iconUrl": "...",
                        "name": "Reopened",
                        "id": "4",
                        "statusCategory": {
                          "self": "...",
                          "id": 2,
                          "key": "new",
                          "colorName": "blue-gray",
                          "name": "To Do"
                        }
                      },
                      "priority": {
                        "self": "...",
                        "iconUrl": "...",
                        "name": "Medium",
                        "id": "3"
                      },
                      "issuetype": {
                        "self": "...",
                        "id": "10002",
                        "description": "A task that needs to be done.",
                        "iconUrl": "...",
                        "name": "Task",
                        "subtask": false,
                        "avatarId": 10318,
                        "hierarchyLevel": 0
                      }
                    }
                  }
                }
              ],
              "assignee": {
                "self": "",
                "accountId": "...",
                "avatarUrls": {
                  "48x48": "...",
                  "24x24": "...",
                  "16x16": "...",
                  "32x32": "..."
                },
                "displayName": "...",
                "active": true,
                "timeZone": "America/Phoenix",
                "accountType": "atlassian"
              },
              "updated": "2021-11-05T04:07:12.030-0700",
              "status": {
                "self": "...",
                "description": "Indicates that the item is resolved by the owning developer, but not yet deployed and available to the QA team.",
                "iconUrl": "...",
                "name": "Ready For Handoff",
                "id": "10007",
                "statusCategory": {
                  "self": "...",
                  "id": 4,
                  "key": "indeterminate",
                  "colorName": "yellow",
                  "name": "In Progress"
                }
              },
              "components": [],
              "timeoriginalestimate": null,
              "description": "...",
              "customfield_10010": [
                {
                  "id": 80,
                  "name": "Sprint 72",
                  "state": "active",
                  "boardId": 1,
                  "goal": "",
                  "startDate": "2021-10-26T10:41:01.129Z",
                  "endDate": "2021-11-09T10:41:00.000Z"
                }
              ],
              "customfield_10011": "0|i00mpd:",
              "customfield_10012": null,
              "customfield_10013": null,
              "customfield_10014": null,
              "customfield_10015": null,
              "security": null,
              "customfield_10008": null,
              "aggregatetimeestimate": null,
              "customfield_10009": {
                "hasEpicLinkFieldDependency": false,
                "showField": false,
                "nonEditableReason": {
                  "reason": "PLUGIN_LICENSE_ERROR",
                  "message": "The Parent Link is only available to Jira Premium users."
                }
              },
              "summary": "Dashboard - All of the View All buttons lead to Stories Page, Archived Stories tab",
              "creator": {
                "self": "...",
                "accountId": "5c5816db8ca8841cd4e25617",
                "avatarUrls": {
                  "48x48": "...",
                  "24x24": "...",
                  "16x16": "...",
                  "32x32": "..."
                },
                "displayName": "...",
                "active": true,
                "timeZone": "America/Phoenix",
                "accountType": "atlassian"
              },
              "subtasks": [],
              "reporter": {
                "self": "",
                "accountId": "5c5816db8ca8841cd4e25617",
                "avatarUrls": {
                  "48x48": "...",
                  "24x24": "...",
                  "16x16": "...",
                  "32x32": "..."
                },
                "displayName": "...",
                "active": true,
                "timeZone": "America/Phoenix",
                "accountType": "atlassian"
              },
              "customfield_10000": "{repository={count=1, dataType=repository}, json={\"cachedValue\":{\"errors\":[],\"summary\":{\"repository\":{\"overall\":{\"count\":1,\"lastUpdated\":\"2021-11-05T03:57:23.000-0700\",\"dataType\":\"repository\"},\"byInstanceType\":{\"bitbucket\":{\"count\":1,\"name\":\"Bitbucket Cloud\"}}}}},\"isStale\":true}}",
              "aggregateprogress": {
                "progress": 0,
                "total": 0
              },
              "customfield_10001": null,
              "customfield_10004": null,
              "environment": "g-qa, prod",
              "duedate": null,
              "progress": {
                "progress": 0,
                "total": 0
              },
              "votes": {
                "self": "...",
                "votes": 0,
                "hasVoted": false
              }
            }
          },
      */
  
    } catch (err) {
      console.error(err);
    }
  }
  
  /**
   * @description Fetch issues from project with status
   * @param {string} project
   * @param {string} status
   * @returns {object}
   */
  async getIssuesByProjectAndStatus(project, status) {
    return await this.getIssuesBy([
      { name: 'project',  value: project },
      { name: 'status', value: status }
    ]);
  }
  
  /**
   * @description Fetch branches for given issue array
   * @param {object} issues
   * @param {string} repo
   * @returns {object}
   */
  async getIssueCollectionBranches(issues, repo) {
    try {
      const issueIds = _.sortBy(issues, item => {
        // sort from oldest by last commit
        try {
          return new Date(item.lastCommit.authorTimestamp).getTime();
        } catch(e) {
          return 0;
        }
      }).map(item => item.id).reverse();
  
      let branchNames = [];
  
      return new Promise((resolve, reject) => {
        async.eachLimit(issueIds, 5, (item, callback) => {
          this.getIssueBranches(item, repo).then(branches => {
            if (branches.length) {
              branches.forEach(branch => {
                branchNames.push(branch.name);
              })
            } 
            
            callback();
          }).catch(err => {
            reject(err);
          })
        }, function(err) {
          resolve(branchNames);
        });
      })
    } catch (err) {
      console.error(err);
    }
  }
  
  /**
   * @description Remap issue object leaving only basic props
   * @param {object} issue
   * @returns {object}
   */
  simplifyIssue(issue) {
    return {
      id: issue.id,
      key: issue.key,
      type: issue.fields.issuetype.name || '',
      created: issue.fields.created,
      updated: issue.fields.updated || null,
      priority: issue.fields.priority.name || '',
      creator: issue.fields.creator,
      assignee: issue.fields.assignee || null,
      title: issue.fields.summary || '',
      description: issue.fields.description || ''
    }
  }
  
  /**
   * @description Construct issue link string
   * @param {object} issue
   * @returns {string}
   */
  issueLink(issue) {
    return `https://${this.settings.host}/browse/${issue.key}`;
  }
  
  /**
   * @description Create object with indexes as group ids
   * @param {object} issues
   * @param {string} mapperFuncString
   * @returns {object}
   */
  groupIssuesByType(issues, mapperFuncString) {
    const grouped = _.groupBy(issues, issue => {
      try {
        return issue.fields.issuetype.name;
      } catch(e) {
        return 'Other'
      }
    });
  
    if (mapperFuncString && typeof this[mapperFuncString] === 'function') {
      Object.keys(grouped).forEach(groupKey => {
        grouped[groupKey].forEach((groupItem, groupIndex) => {
          grouped[groupKey][groupIndex] = this[mapperFuncString](groupItem);
        })
      })
    }
    
    return grouped;
  }
  
  /**
   * @description Generate report with bug and task listing
   * @param {object} input
   * @returns {string}
   */
  prettifyIssuesByType(input) {
    function isBug(type) {
      return type === 'Bug';
    }
    
    let bugTasksGrouped = {
      Tasks: [],
      Bugs: []
    };
  
    // first remap by bug or not
    Object.keys(input).forEach(groupKey => {
      input[groupKey].forEach((groupItem, groupIndex) => {
        const bugTaskIndex = isBug(groupKey) ? 'Bugs' : 'Tasks';
        bugTasksGrouped[bugTaskIndex].push(groupItem)
      })
    })
  
    let output = '';
  
    Object.keys(bugTasksGrouped).forEach(groupKey => {
      output += `\n`;
      if (groupKey === 'Bugs') {
        output += chalk.inverse.bold.red(groupKey+':');
      } else {
        output += chalk.inverse.bold.green(groupKey+':');
      }
      output += `\n\n`;
      
      bugTasksGrouped[groupKey].forEach((groupItem, groupIndex) => {
        output += `${groupItem}\n`;
      })
      
      output += `\n`;
    });
    
    return output;
  }
  
  /**
   * @description Generate report with git merge listing
   * @param {object} input
   * @returns 
   */
  prettifyBranchList(input) {
    return input.map(item => {
      return `git merge origin/${item}`
    }).join('\n') + '\n';
  }
}

