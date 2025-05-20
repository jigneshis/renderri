import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'erfuoutzrqhpdjnzemyd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Next.js's default loader supports data URIs, but for optimization,
    // it's better to upload large data URIs to a storage provider.
    // The `unoptimized` prop on `next/image` can be set to true for data URIs if issues arise or if they are small.
    // No specific `dangerouslyAllowSVG` or `contentSecurityPolicy` changes needed for data URIs by default unless specific issues occur.
  },
};

export default nextConfig;
