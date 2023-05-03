declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_CALLBACK_URL: string;
      DISCORD_CLIENT_KEY: string;
      DISCORD_CLIENT_SECRET: string;
    }
  }
}

export {}
