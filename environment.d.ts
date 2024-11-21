declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NOTION_API_KEY: string;
      BLOG_DATABASE_ID: string;
      GA_ANALYTICS_ID: string;
    }
  }
}

export {};
