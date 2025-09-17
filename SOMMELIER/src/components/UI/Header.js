export default function Header() {
  return (
    <header className="border-b-2 border-warm-gray/30 bg-black/30 backdrop-blur-md">
      <div className="container mx-auto px-8 py-12">
        <div className="flex justify-center items-center w-full">
          <img
            src="/logo-Sommelier.png"
            alt="Le Sommelier by Xocoa"
            style={{
              height: '240px',
              width: 'auto',
              filter: 'brightness(1.5) contrast(1.3) saturate(1.2)',
              maxWidth: '100%',
              display: 'block',
              margin: '0 auto'
            }}
          />
        </div>
      </div>
    </header>
  )
}