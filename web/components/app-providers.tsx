'use client'

import { ReduxProviders } from '@/store/provider'
import React from 'react'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {

  return (

    <ReduxProviders>
      {children}
    </ReduxProviders>

  )
}

