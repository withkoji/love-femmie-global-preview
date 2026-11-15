# LOVE FEMMIE GLOBAL — GitHub Container Package

## Package
`ghcr.io/withkoji/love-femmie-global`

## Publishing
The workflow at `.github/workflows/publish-package.yml` builds and pushes a Docker image when a `v*` tag is pushed, or when manually triggered from the GitHub Actions tab.

- For a versioned package, create a tag such as `v0.1.0-beta.1` pointing at a commit containing the workflow.
- For a manual development package, open Actions > Publish container package > Run workflow.
- Confirm the job succeeds and inspect the package under the GitHub repository or organization Packages area.
- Configure package visibility and access permissions in GitHub; this workflow does not itself guarantee private visibility.
- Runtime secrets such as `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ESSENTIAL`, `STRIPE_PRICE_PLUS`, `STRIPE_PRICE_ELITE`, and `DOMAIN` must be supplied by the deployment platform, not baked into the image.
- Do not deploy as a paid production service until signed webhook fulfillment, subscription persistence, and compatibility testing are complete.

## Local build
```sh
docker build -t love-femmie-global:dev .
docker run --rm --env-file .env -p 4242:4242 love-femmie-global:dev
```

This creates an image; it does not publish a package by itself.
