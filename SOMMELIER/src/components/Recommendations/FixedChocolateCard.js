export default function FixedChocolateCard({ chocolate }) {
  return (
    <div className="bg-charcoal/70 border-2 border-warm-gray/50 rounded-2xl p-8 hover:border-accent-gold/70 transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm">
      <div className="space-y-6">

        {/* HEADER - Nom et Marque */}
        <div className="border-b-2 border-accent-gold/30 pb-6">
          <h3 className="font-display font-bold text-primary text-2xl leading-tight mb-3">
            {chocolate.name}
          </h3>
          <p className="text-accent-gold text-lg font-sans font-semibold tracking-wide mb-4">
            {chocolate.brand}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-base font-sans font-medium text-cream bg-accent-gold/20 px-4 py-2 rounded-full border border-accent-gold/30">
              {chocolate.cocoa_percentage}% cacao
            </span>
            {chocolate.rating && (
              <div className="flex items-center space-x-2">
                <span className="text-accent-gold text-lg">★</span>
                <span className="text-base font-sans font-medium text-secondary">{chocolate.rating}/5</span>
              </div>
            )}
          </div>
        </div>

        {/* ORIGINE ET TYPE */}
        <div className="bg-warm-gray/10 rounded-lg p-4 space-y-3">
          <h4 className="text-lg font-sans font-semibold text-accent-gold mb-3">Informations Générales</h4>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center">
              <span className="text-base font-sans font-medium text-muted">Origine</span>
              <span className="text-base font-sans text-secondary font-medium">
                {chocolate.origin_region && chocolate.origin_country
                  ? `${chocolate.origin_region}, ${chocolate.origin_country}`
                  : chocolate.origin_country || chocolate.origin_region}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-base font-sans font-medium text-muted">Type</span>
              <span className="text-base font-sans text-secondary font-medium capitalize">{chocolate.type}</span>
            </div>

            {chocolate.bean_variety && (
              <div className="flex justify-between items-center">
                <span className="text-base font-sans font-medium text-muted">Variété</span>
                <span className="text-base font-sans text-secondary font-medium">{chocolate.bean_variety}</span>
              </div>
            )}
          </div>
        </div>

        {/* PROFIL GUSTATIF */}
        {chocolate.flavor_notes_primary && (
          <div className="bg-warm-gray/10 rounded-lg p-4 space-y-3">
            <h4 className="text-lg font-sans font-semibold text-accent-gold mb-3">Profil Gustatif</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-sans font-semibold text-muted uppercase tracking-wide">Primaire:</span>
                <p className="text-base font-sans text-primary mt-1">{chocolate.flavor_notes_primary}</p>
              </div>
              {chocolate.flavor_notes_secondary && (
                <div>
                  <span className="text-sm font-sans font-semibold text-muted uppercase tracking-wide">Secondaire:</span>
                  <p className="text-base font-sans text-secondary mt-1">{chocolate.flavor_notes_secondary}</p>
                </div>
              )}
              {chocolate.flavor_notes_tertiary && (
                <div>
                  <span className="text-sm font-sans font-semibold text-muted uppercase tracking-wide">Tertiaire:</span>
                  <p className="text-base font-sans text-secondary mt-1">{chocolate.flavor_notes_tertiary}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEXTURE */}
        {(chocolate.texture_mouthfeel || chocolate.texture_melt || chocolate.texture_snap) && (
          <div className="bg-warm-gray/10 rounded-lg p-4 space-y-3">
            <h4 className="text-lg font-sans font-semibold text-accent-gold mb-3">Texture</h4>
            <div className="grid grid-cols-1 gap-3">
              {chocolate.texture_mouthfeel && (
                <div className="flex justify-between items-center">
                  <span className="text-base font-sans font-medium text-muted">En bouche</span>
                  <span className="text-base font-sans text-secondary font-medium capitalize">{chocolate.texture_mouthfeel}</span>
                </div>
              )}
              {chocolate.texture_melt && (
                <div className="flex justify-between items-center">
                  <span className="text-base font-sans font-medium text-muted">Fonte</span>
                  <span className="text-base font-sans text-secondary font-medium capitalize">{chocolate.texture_melt}</span>
                </div>
              )}
              {chocolate.texture_snap && (
                <div className="flex justify-between items-center">
                  <span className="text-base font-sans font-medium text-muted">Cassure</span>
                  <span className="text-base font-sans text-secondary font-medium capitalize">{chocolate.texture_snap}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FINALE */}
        {(chocolate.finish_length || chocolate.finish_character) && (
          <div className="bg-warm-gray/10 rounded-lg p-4 space-y-3">
            <h4 className="text-lg font-sans font-semibold text-accent-gold mb-3">Finale</h4>
            <div className="grid grid-cols-1 gap-3">
              {chocolate.finish_length && (
                <div className="flex justify-between items-center">
                  <span className="text-base font-sans font-medium text-muted">Longueur</span>
                  <span className="text-base font-sans text-secondary font-medium capitalize">{chocolate.finish_length}</span>
                </div>
              )}
              {chocolate.finish_character && (
                <div className="flex justify-between items-center">
                  <span className="text-base font-sans font-medium text-muted">Caractère</span>
                  <span className="text-base font-sans text-secondary font-medium capitalize">{chocolate.finish_character}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CERTIFICATIONS */}
        {chocolate.sustainability_certifications && (
          <div className="bg-warm-gray/10 rounded-lg p-4">
            <h4 className="text-lg font-sans font-semibold text-accent-gold mb-3">Certifications</h4>
            <p className="text-base font-sans text-secondary">
              {chocolate.sustainability_certifications}
            </p>
          </div>
        )}

        {/* ACCORDS */}
        {(chocolate.pairings_wine || chocolate.pairings_spirits || chocolate.pairings_cheese) && (
          <div className="bg-warm-gray/10 rounded-lg p-4 space-y-3">
            <h4 className="text-lg font-sans font-semibold text-accent-gold mb-3">Accords Recommandés</h4>
            <div className="space-y-3">
              {chocolate.pairings_wine && (
                <div>
                  <span className="text-sm font-sans font-semibold text-muted uppercase tracking-wide">Vins:</span>
                  <p className="text-base font-sans text-secondary mt-1">{chocolate.pairings_wine}</p>
                </div>
              )}
              {chocolate.pairings_spirits && (
                <div>
                  <span className="text-sm font-sans font-semibold text-muted uppercase tracking-wide">Spiritueux:</span>
                  <p className="text-base font-sans text-secondary mt-1">{chocolate.pairings_spirits}</p>
                </div>
              )}
              {chocolate.pairings_cheese && (
                <div>
                  <span className="text-sm font-sans font-semibold text-muted uppercase tracking-wide">Fromages:</span>
                  <p className="text-base font-sans text-secondary mt-1">{chocolate.pairings_cheese}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRIX ET NIVEAU */}
        <div className="border-t-2 border-accent-gold/30 pt-6 flex items-center justify-between">
          {chocolate.price_retail && (
            <span className="text-accent-gold font-sans font-bold text-2xl">
              ${chocolate.price_retail}
            </span>
          )}
          <span className="text-base font-sans font-medium text-muted capitalize px-3 py-1 bg-warm-gray/20 rounded-full">
            {chocolate.production_craft_level || 'Premium'}
          </span>
        </div>

        {/* AVIS EXPERT */}
        {chocolate.expert_review && (
          <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-lg p-4">
            <h4 className="text-base font-sans font-semibold text-accent-gold mb-2">Avis Expert</h4>
            <p className="text-base font-sans text-primary italic leading-relaxed">
              "{chocolate.expert_review}"
            </p>
          </div>
        )}

        {/* NOTES DE DÉGUSTATION */}
        {chocolate.tasting_notes && (
          <div className="bg-charcoal/50 border border-warm-gray/30 rounded-lg p-4">
            <h4 className="text-base font-sans font-semibold text-accent-gold mb-2">Notes de Dégustation</h4>
            <p className="text-base font-sans text-primary leading-relaxed">
              {chocolate.tasting_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}