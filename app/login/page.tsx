import LoginPageClient from "./LoginPageClient"

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const message = resolvedSearchParams.message

  return (
    <LoginPageClient
      signupMessage={typeof message === "string" ? message : ""}
    />
  )
}
