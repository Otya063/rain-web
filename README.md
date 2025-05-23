<img src="https://raw.githubusercontent.com/Otya063/rain-web/development/static/img/common/rain_server_logo.webp" width="50%" height="50%" />

This is the [Rain Website](https://www.rain-server.com/) repository.

## Get Started

Install dependencies.
```bash
npm install
```

Generate prisma client for accelerate.
```bash
npx prisma generate --no-engine
```

Put file to local R2 env.
```bash
npx wrangler r2 object put bucket_name/file_name --local --file=file_name
```

Start a local server for developing Worker.
```bash
npx wrangler dev
```

### Deploy the website.
 - Development Site: Push or merge to the development branch.
 - Production Site: Push or merge to the main branch.

## Documentation
 - [Sveltekit](https://kit.svelte.dev/docs/introduction)
 - [Typescript](https://www.typescriptlang.org/docs/)
 - [Prisma](https://www.prisma.io/docs)
 - [Sass](https://sass-lang.com/documentation/)
 - [Typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n/tree/main/packages/adapter-svelte)
 - [Cloudflare Workers](https://developers.cloudflare.com/workers/)