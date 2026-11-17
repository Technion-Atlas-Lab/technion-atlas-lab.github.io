# Static Eleventy site on GitHub Pages, not the CS faculty WordPress

The CS faculty hosts lab sites on its shared WordPress server, but ATLAS Lab's site is a static Eleventy site built from a public GitHub repo and served by GitHub Pages at a Technion subdomain through a DNS CNAME, the same setup CS IT runs for the TDK lab (`tdk.cs.technion.ac.il`). We chose it because there is no server, database or plugin to patch; every change is versioned and reviewable; a Maintainer working with a coding agent can keep it current; and hosting is free.

## Consequences

- GitHub Pages cannot set HTTP response headers, so security policy that would normally be a header must be expressed in the page itself or accepted as a gap.
- Files are hosted by GitHub in the US, so visitor IP logging and cross-border hosting are disclosed on the Privacy page.
- The build skeleton is taken, with the TDK maintainer's permission, from `TechnionTDK/techniontdk.github.io`, which has no open-source license.
