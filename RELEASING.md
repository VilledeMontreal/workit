# Publishing to npm

The five public packages are published from GitHub Actions when a GitHub release is published. Private example
workspaces are automatically skipped.

## One-time npm configuration

Configure npm Trusted Publishing for each public package:

- Provider: GitHub Actions
- Organization or user: `VilledeMontreal`
- Repository: `workit`
- Workflow filename: `publish.yml`
- Environment: `npm`
- Allowed action: `npm publish`

The npm account performing this configuration must be an owner or maintainer of every package under the
`@villedemontreal` scope. Also create a GitHub environment named `npm`; deployment protection and required reviewers
can be configured on that environment.

Trusted Publishing uses short-lived OIDC credentials. The workflow therefore does not require an `NPM_TOKEN` secret.

## Creating a release

1. Run `npm run release:version -- <version>` to update the five public package manifests, their internal WorkIt
   dependencies, and `package-lock.json`.
   Use `npm run release:version -- <version> --dry-run` to preview the change.
2. Run `npm run release:verify -- v<version>`.
3. Run `npm ci`, `npm run build`, `npm run lint`, and `npm test`.
4. Merge the release commit, create a `v<version>` tag, then publish the corresponding GitHub release.

The workflow validates the tag, package versions, and internal dependency ranges before publishing.

## Token fallback

If Trusted Publishing cannot be used, create a granular npm access token restricted to the five packages, with
read/write access and the minimum necessary expiration. Publishing from non-interactive CI may require the token's
2FA bypass capability. Store it in GitHub as the `NPM_TOKEN` Actions secret, then add this environment variable only
to the publish step:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

OIDC Trusted Publishing is preferred because it avoids a reusable write credential.
