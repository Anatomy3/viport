'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useAuth } from './auth-provider'
import { API_CONFIG } from '@/lib/api/config'
import { getTokens } from '@/lib/api/client'
import { toast } from 'react-hot-toast'
import type { WebSocketMessage } from '@/types/api'

interface WebSocketContextType {
  isConnected: boolean
  isConnecting: boolean
  sendMessage: (message: any) => void
  subscribe: (type: string, handler: (data: any) => void) => () => void
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

interface WebSocketProviderProps {
  children: ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [isConnecting, setIsConnecting] = useState(false)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map())
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = useRef(1000) // Start with 1 second

  const connect = useCallback(() => {
    if (!isAuthenticated || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return
    }

    setIsConnecting(true)
    setConnectionStatus('connecting')

    try {
      const { accessToken } = getTokens()
      const wsUrl = new URL(API_CONFIG.WEBSOCKET_URL)
      
      if (accessToken) {
        wsUrl.searchParams.set('token', accessToken)
      }

      const ws = new WebSocket(wsUrl.toString())
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnectionStatus('connected')
        setIsConnecting(false)
        reconnectAttempts.current = 0
        reconnectDelay.current = 1000 // Reset delay
        
        // Send authentication message
        if (accessToken) {
          ws.send(JSON.stringify({
            type: 'auth',
            token: accessToken,
          }))
        }
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          // Handle different message types
          switch (message.type) {
            case 'notification':
              // Show notification toast
              toast.success(message.data.title || 'New notification')
              break
            case 'like':
              // Handle real-time like updates
              break
            case 'comment':
              // Handle real-time comment updates
              break
            case 'follow':
              // Handle real-time follow updates
              break
            case 'system':
              // Handle system messages
              if (message.data.level === 'error') {
                toast.error(message.data.message)
              } else {
                toast(message.data.message)
              }
              break
          }

          // Notify subscribers
          const subscribers = subscribersRef.current.get(message.type)
          if (subscribers) {
            subscribers.forEach(handler => {
              try {
                handler(message.data)
              } catch (error) {
                console.error('Error in WebSocket message handler:', error)
              }
            })
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setConnectionStatus('disconnected')
        setIsConnecting(false)
        wsRef.current = null

        // Attempt to reconnect if it wasn't a clean close and user is still authenticated
        if (event.code !== 1000 && isAuthenticated && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(reconnectDelay.current * Math.pow(2, reconnectAttempts.current), 30000)
          
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionStatus('error')
          toast.error('Unable to maintain connection. Please refresh the page.')
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
        setIsConnecting(false)
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      setConnectionStatus('error')
      setIsConnecting(false)
    }
  }, [isAuthenticated])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect')
      wsRef.current = null
    }

    setConnectionStatus('disconnected')
    setIsConnecting(false)
    reconnectAttempts.current = 0
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message)
    }
  }, [])

  const subscribe = useCallback((type: string, handler: (data: any) => void) => {
    if (!subscribersRef.current.has(type)) {
      subscribersRef.current.set(type, new Set())
    }
    
    const subscribers = subscribersRef.current.get(type)!
    subscribers.add(handler)

    // Return unsubscribe function
    return () => {
      subscribers.delete(handler)
      if (subscribers.size === 0) {
        subscribersRef.current.delete(type)
      }
    }
  }, [])

  // Connect when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, connect, disconnect])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, don't actively reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
      } else if (isAuthenticated && connectionStatus === 'disconnected') {
        // Page is visible again and we're disconnected, try to reconnect
        connect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, connectionStatus, connect])

  // Handle network status changes
  useEffect(() => {
    const handleOnline = () => {
      if (isAuthenticated && connectionStatus !== 'connected') {
        console.log('Network back online, attempting to reconnect')
        connect()
      }
    }

    const handleOffline = () => {
      console.log('Network offline')
      disconnect()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isAuthenticated, connectionStatus, connect, disconnect])

  const value: WebSocketContextType = {
    isConnected: connectionStatus === 'connected',
    isConnecting,
    sendMessage,
    subscribe,
    connectionStatus,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}