schema_version = 1

project {
  license        = "MPL-2.0"
  copyright_year = 2022

  # (OPTIONAL) A list of globs that should not have copyright/license headers.
  # Supports doublestar glob patterns for more flexibility in defining which
  # files or folders should be ignored
  header_ignore = [
    # "vendors/**",
    # "**autogen**",
    "**/node_modules/**",
    "**/.mergify.yml",
    "**/.github/workflows/*.yml",
    "**/coverage/**",
    "**/test-reports/**",
    "**/dist/**",
    "examples/**", # this probably should have the headers, but I'm tired of fighting Projen
  ]
}
