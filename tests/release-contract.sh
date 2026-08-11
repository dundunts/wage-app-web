#!/usr/bin/env bash

set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
ci="$repo_root/.github/workflows/ci.yaml"
release="$repo_root/.github/workflows/release.yaml"
wizard="$repo_root/scripts/setup-web-release.sh"
tag_verifier="$repo_root/scripts/verify-docker-tag.sh"

for required in "$ci" "$release" "$wizard" "$tag_verifier"; do
  [[ -f "$required" ]] || { echo "missing release contract file: $required" >&2; exit 1; }
done

grep -Fq 'npm ci' "$ci"
grep -Fq 'npm run lint' "$ci"
grep -Fq 'npm run typecheck' "$ci"
grep -Fq 'npm run build' "$ci"
grep -Fq 'bash tests/release-contract.sh' "$ci"

grep -Fq 'workflow_dispatch:' "$release"
grep -Fq 'tag:' "$release"
grep -Fq 'RELEASE_TAG:' "$release"
grep -Fq 'group: web-release-publish' "$release"
grep -Fq 'Validate release tag input before checkout' "$release"
grep -Fq '[[ "$RELEASE_TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-U[1-9][0-9]*)?$ ]]' "$release"
grep -Fq 'path: release-source' "$release"
grep -Fq 'ref: refs/tags/${{ env.RELEASE_TAG }}' "$release"
grep -Fq 'git fetch --force origin "refs/tags/$release_tag:refs/tags/$release_tag"' "$release"
grep -Fq 'git cat-file -t "refs/tags/$release_tag"' "$release"
grep -Fq 'source_sha=$(git rev-parse "$release_tag^{commit}")' "$release"
grep -Fq '[[ "$(git rev-parse HEAD)" == "$source_sha" ]]' "$release"
grep -Fq 'release/$release_version' "$release"
grep -Fq 'bash scripts/verify-docker-tag.sh require-absent "$IMAGE" "$VERSION"' "$release"
grep -Fq 'bash scripts/verify-docker-tag.sh require-absent "$IMAGE" "git-$SOURCE_SHA"' "$release"
grep -Fq 'type=raw,value=git-${{ steps.version.outputs.source_sha }}' "$release"
grep -Fq 'org.opencontainers.image.revision=${{ steps.version.outputs.source_sha }}' "$release"
grep -Fq 'context: ./release-source' "$release"
grep -Fq 'cache-dependency-path: release-source/package-lock.json' "$release"
grep -Fq 'docker.io/${{ secrets.DOCKER_USERNAME }}/wage-app-web' "$release"
grep -Fq 'environments/production/web.yaml' "$release"
grep -Fq 'Refs dundunts/wage-app-infr#9' "$release"
grep -Fq 'permission-contents: write' "$release"
grep -Fq 'permission-pull-requests: write' "$release"

grep -Fq 'set_secret DOCKER_USERNAME' "$wizard"
grep -Fq 'set_secret DOCKER_PASSWORD' "$wizard"
grep -Fq 'set_secret INFRA_APP_ID' "$wizard"
grep -Fq 'set_secret INFRA_APP_PRIVATE_KEY' "$wizard"
grep -Fq 'dundunts/wage-app-web' "$wizard"

if grep -RIE 'DOCKER_PASSWORD:[[:space:]]+[^$]|INFRA_APP_PRIVATE_KEY:[[:space:]]+[^$]' \
  "$repo_root/.github" --include='*.yaml'; then
  echo "release workflow appears to embed a credential" >&2
  exit 1
fi

echo "web release contract is valid"
