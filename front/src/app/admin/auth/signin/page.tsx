import { Suspense } from "react"
import SignInClient from "./signin-client"

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInClient />
    </Suspense>
  )
}
