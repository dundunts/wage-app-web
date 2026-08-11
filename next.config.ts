import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    /* config options here */
    reactCompiler: true,
    experimental: {
        optimizePackageImports: ["@chakra-ui/react"],
    }
};

export default nextConfig;
