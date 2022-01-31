# atlassian-assist

v1 of `atlassian-assist`, a (for the time being) small module for listing out Jira issues and their feature branches in given board, project and under given status. The purpose is to make the job of gathering feature list documentation and branches to be merged into a release more streamlined.

Future plans are to integrate Git into the mix and create automatic code merges, add support for automatic generation of release reports to Confluence via a templating system, and many more which I have yet not thought of.

## Install

```bash
$ npm install -g atlassian-assist
```

## Usage

The script should be run at the root of the project.

Place required authorisation data in .env file and make sure you add this file to .gitignore if it's not there already(!):

```bash
ATLASSIAN_HOST=your-domain.atlassian.net
ATLASSIAN_USERNAME=your@email.com
ATLASSIAN_API_TOKEN=atlassian-api-token
```

> For more info on creating an API token [read this article](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/).

Required params for running script:

- boardName
- repoName
- issueStatusName

Params are NOT case sensitive (matching is done by lower case slugifying of the values).

```bash
$ atlassian-assist --boardName='my board name' --repoName='my repo' --issueStatusName='in progress'
```

Usage in NPM scripts:

```json
{
  "scripts": {
    "issuesInProgress": "atlassian-assist --boardName='...' --repoName='...' --issueStatusName='...'",
    "issuesForQA": "atlassian-assist --boardName='...' --repoName='...' --issueStatusName='...'"
  }
}
```

## Author

Slavko Pekarić

## License

MIT
