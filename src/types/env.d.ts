declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test"
    NEXT_RUNTIME?: "nodejs" | "edge"

    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string


    NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?: string
    NEXT_PUBLIC_POSTHOG_HOST?: string

    NEXT_PUBLIC_SENTRY_DSN?: string
    SENTRY_DSN?: string
    SENTRY_AUTH_TOKEN?: string
    SENTRY_ORG?: string
    SENTRY_PROJECT?: string

    NEXT_PUBLIC_FACEBOOK_APP_ID?: string
    NEXT_PUBLIC_FACEBOOK_API_VERSION?: string

    GROQ_API_KEY?: string
    FONNTE_API_TOKEN?: string

    DATABASE_URL: string
  }
}
