import { useState } from 'react'
import Head from 'next/head'
import ChatInterface from '../components/Chat/ChatInterface'
import Header from '../components/UI/Header'

export default function Home() {
  return (
    <>
      <Head>
        <title>XOCOA - Sommelier du Chocolat</title>
        <meta name="description" content="Découvrez le chocolat parfait avec XOCOA, votre sommelier personnel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-black to-secondary-black">
        <Header />
        <main className="w-full px-16 py-8">
          <div className="max-w-7xl mx-auto">

            <ChatInterface />
          </div>
        </main>
      </div>
    </>
  )
}