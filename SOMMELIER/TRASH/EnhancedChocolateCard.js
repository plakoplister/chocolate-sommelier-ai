export default function EnhancedChocolateCard({ chocolate }) {
  return (
    <div className="bg-charcoal/70 border-2 border-warm-gray/50 rounded-2xl p-6 hover:border-accent-gold/70 transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm">
      <div className="space-y-4">

        {/* Header with Name and Brand */}
        <div className="border-b-2 border-warm-gray/30 pb-4">
          <h4 className="font-display font-semibold text-primary text-xl leading-tight mb-2">
            {chocolate.name}
          </h4>
          <p className="text-accent-gold text-base font-sans font-medium tracking-wide">
            {chocolate.brand}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-sans text-cream bg-charcoal/80 px-3 py-1.5 rounded-full">
              {chocolate.cocoa_percentage}% cacao
            </span>
            {chocolate.rating && (
              <div className="flex items-center space-x-1">
                <span className="text-accent-gold text-sm">★</span>
                <span className="text-sm font-sans text-secondary">{chocolate.rating}/5</span>
              </div>
            )}
          </div>
        </div>

        {/* Origin Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-sans text-muted">Origine</span>
            <span className="text-sm font-sans text-secondary">
              {chocolate.origin_region && chocolate.origin_country
                ? `${chocolate.origin_region}, ${chocolate.origin_country}`
                : chocolate.origin_country || chocolate.origin_region}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-sans text-muted">Type</span>
            <span className="text-sm font-sans text-secondary capitalize">{chocolate.type}</span>
          </div>
          {chocolate.bean_variety && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-muted">Variété</span>
              <span className="text-sm font-sans text-secondary">{chocolate.bean_variety}</span>
            </div>
          )}
        </div>

        {/* Flavor Profile */}
        {chocolate.flavor_notes_primary && (
          <div className="space-y-2">
            <h5 className="text-sm font-sans text-accent-gold uppercase tracking-wide font-medium">
              Profil Gustatif
            </h5>
            <div className="space-y-1">
              <p className="text-sm font-sans text-primary">
                <span className="text-muted">Primaire:</span> {chocolate.flavor_notes_primary}
              </p>
              {chocolate.flavor_notes_secondary && (
                <p className="text-sm font-sans text-secondary">
                  <span className="text-muted">Secondaire:</span> {chocolate.flavor_notes_secondary}
                </p>
              )}
              {chocolate.flavor_notes_tertiary && (
                <p className="text-sm font-sans text-secondary">
                  <span className="text-muted">Tertiaire:</span> {chocolate.flavor_notes_tertiary}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Texture Details */}
        {(chocolate.texture_mouthfeel || chocolate.texture_melt || chocolate.texture_snap) && (
          <div className="space-y-2">
            <h5 className="text-sm font-sans text-accent-gold uppercase tracking-wide font-medium">
              Texture
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              {chocolate.texture_mouthfeel && (
                <div>
                  <span className="text-muted">Bouche:</span>
                  <span className="text-secondary ml-1">{chocolate.texture_mouthfeel}</span>
                </div>
              )}
              {chocolate.texture_melt && (
                <div>
                  <span className="text-muted">Fonte:</span>
                  <span className="text-secondary ml-1">{chocolate.texture_melt}</span>
                </div>
              )}
              {chocolate.texture_snap && (
                <div>
                  <span className="text-muted">Cassure:</span>
                  <span className="text-secondary ml-1">{chocolate.texture_snap}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Finish */}
        {(chocolate.finish_length || chocolate.finish_character) && (
          <div className="space-y-1">
            <h5 className="text-sm font-sans text-accent-gold uppercase tracking-wide font-medium">
              Finale
            </h5>
            <div className="flex items-center justify-between">
              {chocolate.finish_length && (
                <span className="text-sm font-sans text-secondary">
                  Longueur: {chocolate.finish_length}
                </span>
              )}
              {chocolate.finish_character && (
                <span className="text-sm font-sans text-secondary">
                  Caractère: {chocolate.finish_character}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sustainability */}
        {chocolate.sustainability_certifications && (
          <div className="space-y-1">
            <span className="text-xs font-sans text-accent-gold uppercase tracking-wide font-medium">
              Certifications
            </span>
            <p className="text-xs font-sans text-secondary">
              {chocolate.sustainability_certifications}
            </p>
          </div>
        )}

        {/* Pairings */}
        {(chocolate.pairings_wine || chocolate.pairings_spirits || chocolate.pairings_cheese) && (
          <div className="space-y-2">
            <h5 className="text-sm font-sans text-accent-gold uppercase tracking-wide font-medium">
              Accords Recommandés
            </h5>
            <div className="space-y-1 text-xs font-sans">
              {chocolate.pairings_wine && (
                <div>
                  <span className="text-muted">Vins:</span>
                  <span className="text-secondary ml-1">{chocolate.pairings_wine}</span>
                </div>
              )}
              {chocolate.pairings_spirits && (
                <div>
                  <span className="text-muted">Spiritueux:</span>
                  <span className="text-secondary ml-1">{chocolate.pairings_spirits}</span>
                </div>
              )}
              {chocolate.pairings_cheese && (
                <div>
                  <span className="text-muted">Fromages:</span>
                  <span className="text-secondary ml-1">{chocolate.pairings_cheese}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price & Level */}
        <div className="border-t-2 border-warm-gray/30 pt-3 flex items-center justify-between">
          {chocolate.price_retail && (
            <span className="text-accent-gold font-sans font-semibold text-lg">
              ${chocolate.price_retail}
            </span>
          )}
          <span className="text-sm font-sans text-muted">
            {chocolate.production_craft_level || 'Premium'}
          </span>
        </div>

        {/* Expert Review */}
        {chocolate.expert_review && (
          <div className="bg-charcoal/50 rounded-lg p-3 mt-3">
            <p className="text-sm font-sans text-secondary italic leading-relaxed">
              "{chocolate.expert_review}"
            </p>
          </div>
        )}

        {/* Tasting Notes */}
        {chocolate.tasting_notes && (
          <div className="bg-accent-gold/10 rounded-lg p-3 mt-2">
            <h6 className="text-xs font-sans text-accent-gold uppercase tracking-wide font-medium mb-1">
              Notes de Dégustation
            </h6>
            <p className="text-sm font-sans text-primary leading-relaxed">
              {chocolate.tasting_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}