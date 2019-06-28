[Français](CONTRIBUTING_FR.md)

# How to Contribute

This library is one of the open source projects of the Ville de Montréal which is currently under active development and which is also used to operate online services on [beta.montreal.com](https://beta.montreal.com).

## [Code of Conduct](http://ville.montreal.qc.ca/pls/portal/docs/page/intra_fr/media/documents/code_conduite_employes.pdf)

Ville de Montreal has adopted a Code of Conduct that we expect project participants to adhere to. Please read [the full text](http://ville.montreal.qc.ca/pls/portal/docs/page/intra_fr/media/documents/code_conduite_employes.pdf) so that you can understand what actions will and will not be tolerated.

## Open Development

All work on this library happens directly on [GitHub](/). Both core team members and external contributors send pull requests which go through the same review process.

### `master` is unsafe

We will do our best to keep `master` in good shape, with tests passing at all times. But in order to move fast, we will make API changes that your application might not be compatible with. We will do our best to communicate these changes and always version appropriately so you can lock into a specific version if need be.

### Github

My PR addresses the following Github issues and references them in the PR title. For example, "#XXX My PR"
In case you are fixing a typo in the documentation you can prepend your commit with docs: xxxx #XXX, code changes always need a Github issue.

#### Description
  
Here are some details about my PR, including screenshots of any UI changes:

-   Clarify the documentation.
-   No UI changes.

#### Tests

My PR adds the following unit tests OR does not need testing for this extremely good reason:

-   It's just a simple documentation change.

#### Commits
  My commits all reference Github issues in their subject lines (recommended), 
  and I have **squashed** multiple commits if they address the same issue. 
  In addition, my commits follow the guidelines from ["How to write a good git commit message"](https://www.conventionalcommits.org/en/v1.0.0-beta.3)

#### Documentation
  In case of new functionality, my PR adds documentation that describes how to use it.

## Developer Certificate of Origin (DCO)
In order to accept your pull request, we need you to submit a DCO. You only need to add `-s` command line option to append this automatically to your commit message.
[More details](https://github.com/probot/dco)
