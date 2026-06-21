import { defineConfig } from "@rsbuild/core";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginSolid } from "@rsbuild/plugin-solid";
import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin";

// Docs: https://rsbuild.rs/config/
export default defineConfig({
	plugins: [
		pluginBabel({
			include: /\.(?:jsx|tsx)$/,
		}),
		pluginSolid(),
	],
	tools: {
		rspack: {
			plugins: [
				process.env.RSDOCTOR === "true" &&
					new RsdoctorRspackPlugin({
						// plugin options
					}),
			],
		},
	},
});
