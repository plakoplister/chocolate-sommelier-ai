import { useState } from 'react'
import Head from 'next/head'
import ChatInterface from '../components/Chat/ChatInterface'
import Header from '../components/UI/Header'
import LanguageSelector from '../components/LanguageSelector/LanguageSelector'
import { useLanguage } from '../contexts/LanguageContext'

export default function Home() {
  const { language } = useLanguage()

  return (
    <>
      <Head>
        <title>{`XOCOA - ${language === 'fr' ? 'Sommelier du Chocolat' : 'Chocolate Sommelier'}`}</title>
        <meta name="description" content={language === 'fr'
          ? "Découvrez le chocolat parfait avec XOCOA, votre sommelier personnel"
          : "Discover the perfect chocolate with XOCOA, your personal sommelier"} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-black to-secondary-black">
        <Header />
        <LanguageSelector />
        <main className="w-full px-16 py-8">
          <div className="max-w-7xl mx-auto">

            <ChatInterface />
          </div>
        </main>
      </div>
    </>
  )
}