'use client'

import { useState, useCallback } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: '确认操作',
    description: '确定要执行此操作吗？',
    confirmText: '确认',
    cancelText: '取消',
    destructive: false,
    onConfirm: () => {},
    onCancel: () => {},
  })

  const confirm = useCallback((options: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title || '确认操作',
        description: options.description || '确定要执行此操作吗？',
        confirmText: options.confirmText || '确认',
        cancelText: options.cancelText || '取消',
        destructive: options.destructive || false,
        onConfirm: () => {
          setState((prev) => ({ ...prev, open: false }))
          resolve(true)
        },
        onCancel: () => {
          setState((prev) => ({ ...prev, open: false }))
          resolve(false)
        },
      })
    })
  }, [])

  const ConfirmDialog = (
    <AlertDialog open={state.open} onOpenChange={(open) => !open && state.onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state.title}</AlertDialogTitle>
          <AlertDialogDescription>{state.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={state.onCancel}>{state.cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={state.onConfirm}
            className={state.destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {state.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { confirm, ConfirmDialog }
}
