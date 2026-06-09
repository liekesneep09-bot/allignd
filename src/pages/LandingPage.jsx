import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './LandingPage.css';
import logo from '../assets/logo-primary.png';
import vandaagScherm from '../assets/vandaag-scherm-app.png';
import phoneMockup from '../assets/telefoon-app-goed-small.webp';

// Icon placeholders
const DropIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" strokeLinejoin="round"/>
  </svg>
);

const CircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="8"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/>
    <path d="M12 4v-2"/>
    <path d="M10 4c0 1.5 1 2 2 2"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v18M3 12h18M7.5 7.5l9 9M16.5 7.5l-9 9"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const BowlIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M3 12h18a1 1 0 0 1 1 1v2a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7v-2a1 1 0 0 1 1-1z" />
    <path d="M12 12V7" />
    <path d="M12 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
  </svg>
);

const DumbbellIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M18 6.5V17.5M6 6.5V17.5M2 10H6M18 10H22M6 12H18" />
    <circle cx="20" cy="12" r="2" />
    <circle cx="4" cy="12" r="2" />
  </svg>
);

const ChatIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 14h6M9 10h6M9 18h6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function LandingPage({ onEnterApp }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email }]);
        
      if (error) {
        if (error.code === '23505') { 
          setStatus('success'); 
        } else {
          console.error("Waitlist error:", error);
          setStatus('idle');
          alert(t('landing.waitlist_error'));
        }
      } else {
        setStatus('success');
        setEmail('');
      }
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <div className="lp-container">
      
      {/* HEADER */}
      <header className="lp-header">
        <div className="lp-logo-container">
          <img src={logo} alt="Allignd" className="lp-logo" />
        </div>
        <nav className="lp-nav">
          <a href="#about" style={{ color: '#FFF', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>{t('landing.about')}</a>
          <a href="#features" style={{ color: '#FFF', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>{t('landing.features')}</a>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '10px' }}>
             <button 
                onClick={() => setLanguage('nl')} 
                style={{ color: '#FFF', background: 'none', opacity: language === 'nl' ? 1 : 0.5, fontWeight: language === 'nl' ? 700 : 400, fontSize: '0.8rem' }}
             >NL</button>
             <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
             <button 
                onClick={() => setLanguage('en')} 
                style={{ color: '#FFF', background: 'none', opacity: language === 'en' ? 1 : 0.5, fontWeight: language === 'en' ? 700 : 400, fontSize: '0.8rem' }}
             >EN</button>
          </div>

          <a href="#waitlist" style={{ 
            color: '#FFF', 
            textDecoration: 'none', 
            fontSize: '0.85rem', 
            fontWeight: 500, 
            letterSpacing: '1px',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '10px 20px',
            borderRadius: '30px',
            marginLeft: '20px'
          }}>{t('landing.cta_first')}</a>
        </nav>

        <button className="lp-mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {isMenuOpen && (
          <div className="lp-mobile-menu">
            <a href="#features" onClick={() => { setIsMenuOpen(false); }}>{t('landing.features')}</a>
            <div className="lp-mobile-lang-switcher">
              <button 
                onClick={() => { setLanguage('nl'); setIsMenuOpen(false); }} 
                className="lp-mobile-lang-btn"
                style={{ opacity: language === 'nl' ? 1 : 0.4, fontWeight: language === 'nl' ? 700 : 300 }}
              >NL</button>
              <button 
                onClick={() => { setLanguage('en'); setIsMenuOpen(false); }} 
                className="lp-mobile-lang-btn"
                style={{ opacity: language === 'en' ? 1 : 0.4, fontWeight: language === 'en' ? 700 : 300 }}
              >EN</button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <h1 className="lp-h1">
            {t('landing.hero_title_1')}<br />{t('landing.hero_title_2')}<br />
            <span style={{ fontStyle: 'italic' }}>{t('landing.hero_title_3')}</span>
          </h1>
          <p style={{ color: '#FDF5F7', fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.9, whiteSpace: 'pre-line' }}>
            {t('landing.hero_subtitle')}
          </p>
          <a href="#waitlist" style={{
            display: 'inline-block',
            backgroundColor: '#ffaeb9',
            color: '#1E1B1B',
            padding: '16px 32px',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: '1px',
            marginBottom: '1rem'
          }}>
            {t('landing.cta_first')}
          </a>
          <p style={{ color: 'rgba(253, 245, 247, 0.5)', fontSize: '0.9rem', marginLeft: '1rem' }}>{t('landing.coming_soon')}</p>
        </div>
        <div className="lp-hero-bg" />
      </section>


      <section id="features" className="lp-features">
        <p className="lp-features-label">
          {t('landing.features_label')}
        </p>
        <h2 className="lp-h2 lp-features-title">
          {t('landing.features_title')}
        </h2>
        <p className="lp-features-subtitle">
          {t('landing.features_subtitle')}
        </p>
        
        <div className="lp-features-grid">
          {[
            { Icon: MoonIcon, titleKey: 'landing.feat_1_title', descKey: 'landing.feat_1_desc', num: '01' },
            { Icon: BowlIcon, titleKey: 'landing.feat_2_title', descKey: 'landing.feat_2_desc', num: '02' },
            { Icon: DumbbellIcon, titleKey: 'landing.feat_3_title', descKey: 'landing.feat_3_desc', num: '03' },
            { Icon: ChatIcon, titleKey: 'landing.feat_4_title', descKey: 'landing.feat_4_desc', num: '04' }
          ].map((feat, i) => (
            <div key={i} className="lp-feature-card">
              <div className="lp-feature-icon-wrapper">
                <feat.Icon />
              </div>
              <span className="lp-feature-number">{feat.num}</span>
              <h3 className="lp-feature-title">
                {t(feat.titleKey)}
              </h3>
              <p className="lp-feature-desc">{t(feat.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* APP PREVIEW SECTION */}
      <section id="preview" className="lp-preview" style={{ backgroundColor: '#ffffff', background: '#ffffff' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          #preview, #preview *, .lp-preview, .lp-preview * {
            background-color: #ffffff !important;
            background: #ffffff !important;
            filter: none !important;
            box-shadow: none !important;
          }
        ` }} />
        <div className="lp-preview-content-wrapper">
          <div className="lp-preview-content">
            <p className="lp-preview-label">
              {t('landing.preview_label')}
            </p>
            <h2 className="lp-h2 lp-preview-title">
              {t('landing.preview_title')}
            </h2>
            
            <div className="lp-preview-list">
              {[
                { Icon: MoonIcon, key: 'landing.preview_1' },
                { Icon: BowlIcon, key: 'landing.preview_2' },
                { Icon: DumbbellIcon, key: 'landing.preview_3' },
                { Icon: ClipboardIcon, key: 'landing.preview_4' },
                { Icon: ChatIcon, key: 'landing.preview_5' }
              ].map((item, i) => (
                <div key={i} className="lp-preview-list-item">
                  <div className="lp-preview-icon-circle">
                    <item.Icon />
                  </div>
                  <CheckIcon />
                  <span>{t(item.key)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lp-preview-visual">
            <img src={phoneMockup} alt="App Preview" className="lp-phone-mockup-img" />
          </div>
        </div>
      </section>

      {/* WAITLIST SECTION */}
      <section id="waitlist" className="lp-waitlist">
        <div>
          <h2 className="lp-h2" style={{ marginBottom: '0.5rem' }}>{t('landing.waitlist_title')}</h2>
          <p style={{ color: '#666', whiteSpace: 'pre-line' }}>{t('landing.waitlist_desc')}</p>
        </div>
        
        <div>
          {status === 'success' ? (
            <div style={{ padding: '20px', backgroundColor: '#FFF', borderRadius: '8px', color: '#a3b899', fontWeight: 600, textAlign: 'center' }}>
              {t('landing.waitlist_success')}
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="lp-form">
              <input 
                type="email" 
                placeholder={t('landing.waitlist_placeholder')} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? t('landing.waitlist_button_loading') : t('landing.waitlist_button')}
              </button>
            </form>
          )}
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '12px', marginLeft: '10px' }}>{t('landing.waitlist_spam')}</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div>
          <img src={logo} alt="Allignd" className="lp-footer-logo" />
          <p style={{ fontSize: '0.85rem', color: '#999', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{t('landing.footer_tagline')}</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '1.5rem', color: '#999' }}>
            <span>Instagram</span>
            <span>TikTok</span>
          </div>
        </div>
        
        <div className="lp-footer-links">
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '1px', color: '#666', textTransform: 'uppercase', marginBottom: '1rem' }}>{t('landing.footer_company')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><a href="#about" style={{ color: '#999', textDecoration: 'none', fontSize: '0.85rem' }}>{t('landing.about').toLowerCase()}</a></li>
              <li><a href="#features" style={{ color: '#999', textDecoration: 'none', fontSize: '0.85rem' }}>{t('landing.features').toLowerCase()}</a></li>
              <li><a href="#contact" style={{ color: '#999', textDecoration: 'none', fontSize: '0.85rem' }}>{t('landing.footer_contact')}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '1px', color: '#666', textTransform: 'uppercase', marginBottom: '1rem' }}>{t('landing.footer_legal')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><a href="#privacy" style={{ color: '#999', textDecoration: 'none', fontSize: '0.85rem' }}>{t('landing.footer_privacy')}</a></li>
              <li><a href="#terms" style={{ color: '#999', textDecoration: 'none', fontSize: '0.85rem' }}>{t('landing.footer_terms')}</a></li>
            </ul>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: '#666' }}>© 2024 allignd<br />all rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
