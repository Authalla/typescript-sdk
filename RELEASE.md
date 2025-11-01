# Release Guide

This guide explains how to synchronize npm publishes with GitHub releases so that the same version number points to the same release in both places.

## Method 1: Using npm version (Recommended)

This method automatically creates git tags that match your npm version.

### Step-by-step process:

1. **Update CHANGELOG.md** - Add your release notes for the new version
2. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: your changes"
   ```

3. **Bump version and create tag**:
   ```bash
   # For patch releases (1.0.0 -> 1.0.1)
   npm version patch
   
   # For minor releases (1.0.0 -> 1.1.0)
   npm version minor
   
   # For major releases (1.0.0 -> 2.0.0)
   npm version major
   ```

   This command will:
   - Update `package.json` version
   - Create a git commit with the version change
   - Create a git tag with format `v1.0.0`

4. **Push commits and tags**:
   ```bash
   git push
   git push --tags
   ```

5. **Publish to npm**:
   ```bash
   pnpm publish
   ```

6. **GitHub Release will be created automatically** via the GitHub Actions workflow when the tag is pushed

## Method 2: Manual Release (More Control)

If you prefer more control over the process:

1. **Update version manually in package.json** (e.g., `1.0.0` -> `1.0.1`)
2. **Update CHANGELOG.md** with release notes
3. **Commit changes**:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: release v1.0.1"
   ```

4. **Create git tag**:
   ```bash
   git tag -a v1.0.1 -m "Release v1.0.1"
   ```

5. **Push commits and tags**:
   ```bash
   git push
   git push --tags
   ```

6. **Publish to npm**:
   ```bash
   pnpm publish
   ```

7. **GitHub Release will be created automatically** via GitHub Actions

## Verifying Sync

After releasing, verify that versions match:

- **npm**: Visit `https://www.npmjs.com/package/@authalla/sdk` - should show your version
- **GitHub**: Visit your repo's Releases page - should show the same version tag

Both should point to the same code commit.

## GitHub Actions Workflow

The `.github/workflows/release.yml` workflow automatically:
- Creates a GitHub Release when you push a version tag (`v*`)
- Uses the CHANGELOG.md entry for that version as release notes
- Links the release to the git tag

## Important Notes

- Always update CHANGELOG.md before releasing
- The git tag format must be `v1.0.0` (with 'v' prefix) to match npm version `1.0.0`
- Make sure you're logged into npm (`npm whoami`) before publishing
- Test your build before releasing: `pnpm run build && pnpm run test`

## Security

✅ **This release process is safe for public repositories:**
- No secrets are exposed (verified in earlier security scan)
- Only compiled code (`dist/`) is published to npm, not source files
- GitHub Actions workflow has minimal permissions (only creates releases)
- Workflow only triggers on tag pushes (controlled by repo owners)
- See `SECURITY.md` for detailed security checklist

