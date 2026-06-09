{
  description = "Dev shell with Node, pnpm, TypeScript, esbuild, and Prettier";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }: 
  let
    system = "aarch64-darwin";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    devShells.${system}.default = pkgs.mkShell {
      packages = with pkgs; [
        nodejs
        pnpm
        typescript
        prettier
        esbuild
      ];
    };
  };
}
