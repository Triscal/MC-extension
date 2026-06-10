# MC (Markdown Copy) Chrome Extension

This is a simple chrome extension intended to copy the page title as well as the current URL.

## Building

Dependencies are managed via Nix flakes, install [Nix](https://nix.dev/install-nix.html) (I did via [lix](https://lix.systems/)) and [Direnv](https://direnv.net/#basic-installation) then navigate to the directory and run `direnv allow`. If you install Nix manually you may need to [enable flakes](https://nix.dev/concepts/flakes.html#running-commands).

Once you have all the necessary dependencies you can use `node build.mjs` to build the extension.

That will create a `dist` folder with everything you need to use the extension.

### CI Building

Any new commit will cause a GitHub action to run which will check the formatting, for cve's in the Flake, and pnpm modiules, and build the extension. You can download it from the artifacts.

## Releases

Releases also contain a build of the extension and can be downloaded directly and should be considered "stable".
