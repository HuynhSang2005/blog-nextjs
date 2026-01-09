'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { signIn } from './actions'

const loginSchema = z.object({
  email: z.email({ error: 'Email không hợp lệ' }),
  password: z.string().min(1, { error: 'Vui lòng nhập mật khẩu' }),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('auth')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn(data.email, data.password)

      if (result.error) {
        setError(result.error)
      } else {
        const redirectTo = new URLSearchParams(window.location.search).get(
          'redirectTo'
        )
        const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'
        const targetPath = redirectTo || `/${locale}${adminPath}`
        router.push(targetPath)
        router.refresh()
      }
    } catch (_err) {
      setError(t('errors.unknown_error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('login.title')}</CardTitle>
        <CardDescription>{t('login.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.email')}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="email"
                      disabled={isLoading}
                      placeholder={t('login.email_placeholder')}
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.password')}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="current-password"
                      disabled={isLoading}
                      placeholder={t('login.password_placeholder')}
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? t('login.logging_in') : t('login.submit')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
