import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "production",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "../dist/umd"),
    filename: "index.js",
    library: "exampleTypescriptPackage",
    libraryTarget: "umd",
    globalObject: "this",
  },
  module: {
    rules: [
      {
        test: /\.ts(x*)?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "config/tsconfig.umd.json",
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx", ".jsx"],
  },
};
