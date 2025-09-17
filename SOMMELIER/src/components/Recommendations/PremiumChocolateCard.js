export default function PremiumChocolateCard({ chocolate }) {
  return (
    <div className="chocolate-card-container" style={{
      marginBottom: 'var(--space-lg)',
      padding: 'var(--space-md)',
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease'
    }}>

      {/* Header Principal */}
      <div style={{ marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
        <h3 className="chocolate-title" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-2xl)',
          fontWeight: '700',
          color: 'var(--color-gold)',
          marginBottom: 'var(--space-xs)',
          lineHeight: '1.2'
        }}>
          {chocolate.name}
        </h3>

        <p className="chocolate-brand" style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 'var(--space-sm)'
        }}>
          {chocolate.brand}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="cacao-percentage" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))',
            color: 'var(--color-bg-dark)',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: 'var(--text-sm)',
            fontWeight: '600'
          }}>
            {chocolate.cocoa_percentage}% cacao
          </span>

          {chocolate.rating && (
            <div className="rating" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              color: 'var(--color-gold)',
              fontSize: 'var(--text-lg)'
            }}>
              <span>★</span>
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)' }}>
                {chocolate.rating}/5
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Section Informations Générales */}
      <div className="section-container" style={{
        marginBottom: 'var(--space-md)',
        paddingBottom: 'var(--space-sm)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
      }}>
        <h4 className="section-title" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-lg)',
          fontWeight: '400',
          color: 'var(--color-gold)',
          marginBottom: 'var(--space-sm)',
          position: 'relative'
        }}>
          Informations Générales
          <span style={{
            content: '',
            position: 'absolute',
            bottom: '-4px',
            left: '0',
            width: '40px',
            height: '2px',
            background: 'var(--color-gold)',
            display: 'block'
          }}></span>
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-base)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
              Origine
            </span>
            <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: '500' }}>
              {chocolate.origin_region && chocolate.origin_country
                ? `${chocolate.origin_region}, ${chocolate.origin_country}`
                : chocolate.origin_country || chocolate.origin_region}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-base)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
              Type
            </span>
            <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: '500', textTransform: 'capitalize' }}>
              {chocolate.type}
            </span>
          </div>

          {chocolate.bean_variety && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                Variété
              </span>
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                {chocolate.bean_variety}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Section Profil Gustatif */}
      {chocolate.flavor_notes_primary && (
        <div className="section-container" style={{
          marginBottom: 'var(--space-md)',
          paddingBottom: 'var(--space-sm)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
        }}>
          <h4 className="section-title" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-lg)',
            fontWeight: '400',
            color: 'var(--color-gold)',
            marginBottom: 'var(--space-sm)',
            position: 'relative'
          }}>
            Profil Gustatif
            <span style={{
              content: '',
              position: 'absolute',
              bottom: '-4px',
              left: '0',
              width: '40px',
              height: '2px',
              background: 'var(--color-gold)',
              display: 'block'
            }}></span>
          </h4>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: '0.5rem' }}>
            {chocolate.flavor_notes_primary.split(',').map((flavor, index) => (
              <span key={index} className="flavor-tag" style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-gold-light)',
                padding: '0.25rem 0.75rem',
                borderRadius: '16px',
                fontSize: 'var(--text-sm)',
                transition: 'all 0.2s ease'
              }}>
                {flavor.trim()}
              </span>
            ))}
          </div>

          {chocolate.flavor_notes_secondary && (
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Secondaire:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: '0.25rem' }}>
                {chocolate.flavor_notes_secondary.split(',').map((flavor, index) => (
                  <span key={index} className="flavor-tag" style={{
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-gold-light)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '16px',
                    fontSize: 'var(--text-sm)',
                    transition: 'all 0.2s ease'
                  }}>
                    {flavor.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section Texture */}
      {(chocolate.texture_mouthfeel || chocolate.texture_melt || chocolate.texture_snap) && (
        <div className="section-container" style={{
          marginBottom: 'var(--space-md)',
          paddingBottom: 'var(--space-sm)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
        }}>
          <h4 className="section-title" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-lg)',
            fontWeight: '400',
            color: 'var(--color-gold)',
            marginBottom: 'var(--space-sm)',
            position: 'relative'
          }}>
            Texture
            <span style={{
              content: '',
              position: 'absolute',
              bottom: '-4px',
              left: '0',
              width: '40px',
              height: '2px',
              background: 'var(--color-gold)',
              display: 'block'
            }}></span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xs)' }}>
            {chocolate.texture_mouthfeel && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                  En bouche
                </span>
                <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: '500', textTransform: 'capitalize' }}>
                  {chocolate.texture_mouthfeel}
                </span>
              </div>
            )}

            {chocolate.texture_melt && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                  Fonte
                </span>
                <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: '500', textTransform: 'capitalize' }}>
                  {chocolate.texture_melt}
                </span>
              </div>
            )}

            {chocolate.texture_snap && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                  Cassure
                </span>
                <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: '500', textTransform: 'capitalize' }}>
                  {chocolate.texture_snap}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Accords */}
      {(chocolate.pairings_wine || chocolate.pairings_spirits || chocolate.pairings_cheese) && (
        <div className="section-container" style={{
          marginBottom: 'var(--space-md)',
          paddingBottom: 'var(--space-sm)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
        }}>
          <h4 className="section-title" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-lg)',
            fontWeight: '400',
            color: 'var(--color-gold)',
            marginBottom: 'var(--space-sm)',
            position: 'relative'
          }}>
            Accords Recommandés
            <span style={{
              content: '',
              position: 'absolute',
              bottom: '-4px',
              left: '0',
              width: '40px',
              height: '2px',
              background: 'var(--color-gold)',
              display: 'block'
            }}></span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xs)' }}>
            {chocolate.pairings_wine && (
              <div>
                <span style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Vins:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: '0.25rem' }}>
                  {chocolate.pairings_wine.split(',').map((wine, index) => (
                    <span key={index} className="pairing-tag" style={{
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-gold-light)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '16px',
                      fontSize: 'var(--text-sm)',
                      transition: 'all 0.2s ease'
                    }}>
                      {wine.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {chocolate.pairings_spirits && (
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <span style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Spiritueux:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: '0.25rem' }}>
                  {chocolate.pairings_spirits.split(',').map((spirit, index) => (
                    <span key={index} className="pairing-tag" style={{
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-gold-light)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '16px',
                      fontSize: 'var(--text-sm)',
                      transition: 'all 0.2s ease'
                    }}>
                      {spirit.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer avec Prix */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 'var(--space-sm)',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        {chocolate.price_retail && (
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xl)',
            fontWeight: '700',
            color: 'var(--color-gold)'
          }}>
            ${chocolate.price_retail}
          </span>
        )}

        <span style={{
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--color-text-secondary)',
          textTransform: 'capitalize',
          padding: '0.25rem 0.75rem',
          background: 'rgba(212, 175, 55, 0.1)',
          borderRadius: '20px'
        }}>
          {chocolate.production_craft_level || 'Premium'}
        </span>
      </div>

      {/* Avis Expert */}
      {chocolate.expert_review && (
        <div style={{
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: 'var(--space-sm)',
          marginTop: 'var(--space-md)'
        }}>
          <h5 style={{
            fontSize: 'var(--text-base)',
            fontWeight: '600',
            color: 'var(--color-gold)',
            marginBottom: '0.5rem'
          }}>
            Avis Expert
          </h5>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            fontStyle: 'italic',
            lineHeight: '1.5'
          }}>
            "{chocolate.expert_review}"
          </p>
        </div>
      )}
    </div>
  )
}