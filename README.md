# VaasaETT web app

Monorepo with a Next.js frontend and an ASP.NET Core API.

```
frontend/   Next.js 16 (App Router, TypeScript)
backend/    .NET 10 Web API
```

## Prerequisites

- Node.js 20+ (24+ recommended)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)

If the SDK lives in `~/.dotnet`, add it to your PATH:

```bash
export DOTNET_ROOT="$HOME/.dotnet"
export PATH="$DOTNET_ROOT:$PATH"
```

## Run locally

In one terminal:

```bash
npm run dev:backend
```

API: [http://localhost:5080](http://localhost:5080)

In another:

```bash
npm run dev:frontend
```

App: [http://localhost:3000](http://localhost:3000)
