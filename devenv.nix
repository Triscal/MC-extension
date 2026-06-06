{
  pkgs,
  lib,
  config,
  ...
}:
{
  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  # https://devenv.sh/packages/
  packages = [
    pkgs.esbuild
    pkgs.typescript
  ];

  # run via command `devenv tasks run xtn:build`
  tasks."xtn:build" = {
    exec = ''node build.mjs'';
  };

  # See full reference at https://devenv.sh/reference/options/
}
