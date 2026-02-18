This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Demo Mode

Set `DEMO_MODE=1` to enable safety limits for public deployments (e.g. Vercel previews). This adds per-IP rate limiting and caps the Anthropic `max_tokens` to control costs.

| Variable | Default | Description |
|---|---|---|
| `DEMO_MODE` | `0` | Set to `1` to enable demo protections |
| `DEMO_MAX_REQ_PER_MINUTE` | `6` | Max chat requests per IP per minute |
| `DEMO_MAX_REQ_PER_HOUR` | `30` | Max chat requests per IP per hour |
| `DEMO_MAX_TOKENS` | `500` | Anthropic `max_tokens` clamp in demo mode |

When a limit is hit the API returns **HTTP 429** with:

```json
{ "error": "Rate limit exceeded", "message": "Demo is rate-limited. Try again in a moment." }
```

If `ANTHROPIC_API_KEY` is not set, the chat endpoint returns a deterministic mock response regardless of demo mode.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
