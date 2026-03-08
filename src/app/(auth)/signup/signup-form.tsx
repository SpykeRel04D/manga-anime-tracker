'use client'

import Link from 'next/link'
import { type FormEvent, type ReactElement, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

interface SignupFormProps {
  registrationOpen: boolean
}

export function SignupForm({ registrationOpen }: SignupFormProps): ReactElement {
  if (!registrationOpen) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registration closed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This app is for personal use and registration is currently closed.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-foreground underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    )
  }

  return <SignupFormFields />
}

function SignupFormFields(): ReactElement {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await authClient.signUp.email({
      email,
      password,
      name: '',
    })

    if (result.error) {
      if (result.error.message?.includes('Registration is closed')) {
        setError('Registration is closed')
      } else {
        setError('Something went wrong. Please try again.')
      }
      setLoading(false)
      return
    }

    window.location.href = '/'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Choose a password (8+ characters)"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </CardContent>
      </form>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground underline">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
