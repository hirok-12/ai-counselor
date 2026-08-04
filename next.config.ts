import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

// Cloudflare bindings を next dev でも使えるようにする
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
