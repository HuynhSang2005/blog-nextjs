'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestErrorPage() {
  function throwClientError() {
    throw new Error('Test client-side error - Error boundary working!')
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test Error Boundaries</CardTitle>
          <CardDescription>
            Click the button below to test the error boundary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={throwClientError} variant="destructive">
            Throw Client Error
          </Button>
          <p className="text-sm text-muted-foreground">
            This will trigger the error.tsx boundary and display the error UI.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
