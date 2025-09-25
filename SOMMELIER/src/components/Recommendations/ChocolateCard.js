export default function ChocolateCard({ chocolate }) {
  return (
    <div className="card hover:border-accent-gold/70 transition-all duration-300 transform hover:scale-105 p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b-2 border-warm-gray/30 pb-4">
          <h4 className="font-display font-semibold text-primary text-xl leading-tight mb-2">
            {chocolate.name}
          </h4>
          <p className="text-accent-gold text-base font-sans font-medium tracking-wide">
            {chocolate.brand}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-cream bg-charcoal/80 px-3 py-1.5 rounded-full font-sans">
              {chocolate.cocoa_percentage}% cacao
            </span>
            {chocolate.rating && (
              <div className="flex items-center space-x-1">
                <span className="text-accent-gold text-xs">★</span>
                <span className="text-xs text-secondary">{chocolate.rating}/5</span>
              </div>
            )}
          </div>
        </div>

        {/* Origin & Type */}
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
        </div>

        {/* Flavor Profile */}
        {chocolate.flavor_notes_primary && (
          <div className="space-y-2">
            <h5 className="text-sm font-sans text-accent-gold uppercase tracking-wide font-medium">
              Notes Gustatives
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
            </div>
          </div>
        )}

        {/* Texture */}
        {chocolate.texture_mouthfeel && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-sans text-muted">Texture</span>
            <span className="text-sm font-sans text-secondary capitalize">{chocolate.texture_mouthfeel}</span>
          </div>
        )}

        {/* Price */}
        {chocolate.price_retail && (
          <div className="border-t border-warm-gray pt-3 flex items-center justify-between">
            <span className="text-accent-gold font-semibold">
              ${chocolate.price_retail}
            </span>
            <span className="text-sm font-sans text-muted">
              {chocolate.production_craft_level || 'Premium'}
            </span>
          </div>
        )}

        {/* Tasting Notes */}
        {chocolate.tasting_notes && (
          <div className="bg-accent-gold/10 rounded-lg p-3 mt-3">
            <h5 className="text-sm font-sans text-accent-gold uppercase tracking-wide font-medium mb-2">
              Notes de Dégustation
            </h5>
            <p className="text-sm font-sans text-secondary leading-relaxed">
              {chocolate.tasting_notes}
            </p>
          </div>
        )}

        {/* Expert Review */}
        {chocolate.expert_review && (
          <div className="bg-charcoal/50 rounded-lg p-3 mt-3">
            <h5 className="text-sm font-sans text-accent-gold uppercase tracking-wide font-medium mb-2">
              Avis Expert
            </h5>
            <p className="text-sm font-sans text-secondary italic leading-relaxed">
              "{chocolate.expert_review}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}