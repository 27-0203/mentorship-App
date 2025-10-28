// app/api/robots.txt/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const robots = `User-agent: *
Allow: /

Sitemap: https://mentorship-app-one.vercel.app/api/sitemap.xml`;

  return new NextResponse(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}