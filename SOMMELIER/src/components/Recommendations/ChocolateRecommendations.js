import PremiumChocolateCard from './PremiumChocolateCard'

export default function ChocolateRecommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return null
  }

  return (
    <div className="fade-in">
      <div className="recommendations-header" style={{
        textAlign: 'center',
        margin: 'var(--space-xl) 0 var(--space-lg)',
        position: 'relative'
      }}>
        <h3 className="recommendations-title" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-3xl)',
          fontWeight: '700',
          background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Mes Recommandations pour Vous
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {recommendations.map((chocolate) => (
          <PremiumChocolateCard key={chocolate.id} chocolate={chocolate} />
        ))}
      </div>

      {recommendations.length > 3 && (
        <div className="text-center mt-4">
          <p className="text-sm text-muted">
            {recommendations.length} chocolats correspondent à vos préférences
          </p>
        </div>
      )}
    </div>
  )
}