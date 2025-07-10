import { APP_NAME } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <h2>Welcome to {APP_NAME}</h2>
      <p>A site brought to you by</p>
      <ul>
        <li className="no-underline">
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </a>
        </li>
        <li>
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercel
          </a>
        </li>
        <li>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            React
          </a>
        </li>
        <li>
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tailwind CSS
          </a>
        </li>
        <li>
          <a
            href="https://www.postgresql.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            PostgreSQL
          </a>
        </li>
        <li>
          <a href="https://prisma.io" target="_blank" rel="noopener noreferrer">
            Prisma
          </a>
        </li>
        <li>
          <a
            href="https://next-auth.js.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            NextAuth.js
          </a>
        </li>
        <li>
          <a
            href="https://ui.shadcn.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ShadCN UI
          </a>
        </li>
        <li>
          <a
            href="https://www.typescriptlang.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Typescript
          </a>
        </li>
      </ul>
    </>
  );
}
