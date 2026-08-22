import { useState } from 'react'
import {
  SignIn,
  SignUp,
  UserButton,
  useAuth,
} from '@clerk/react'

import { ProfilePage } from './modules/profile/pages/ProfilePage'
import { CommunityPage } from './modules/community/pages/CommunityPage'

import './App.css'

type Page = 'home' | 'community' | 'profile'

const clerkAppearance = {
  variables: {
    colorPrimary: '#ef765c',
    colorPrimaryForeground: '#ffffff',
    colorForeground: '#17203a',
    colorMutedForeground: '#66708b',
    colorBackground: '#ffffff',
    colorMuted: '#f7f3eb',
    colorInput: '#ffffff',
    colorInputForeground: '#17203a',
    colorBorder: '#ded8ce',
    colorRing: '#ef765c',
    borderRadius: '10px',
    spacing: '1rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  elements: {
    card: {
      width: '100%',
      maxWidth: '100%',
      margin: '0',
      padding: '0',
      backgroundColor: '#ffffff',
      border: 'none',
      boxShadow: 'none',
    },
    rootBox: {
      width: '100%',
      maxWidth: '100%',
    },
    headerTitle: {
      color: '#17203a',
    },
    headerSubtitle: {
      color: '#66708b',
    },
    socialButtonsBlockButton: {
      backgroundColor: '#ffffff',
      border: '1px solid #ded8ce',
      color: '#17203a',
      boxShadow: 'none',
    },
    socialButtonsBlockButtonText: {
      color: '#17203a',
    },
    formFieldLabel: {
      color: '#17203a',
    },
    formFieldInput: {
      backgroundColor: '#ffffff',
      color: '#17203a',
      border: '1px solid #ded8ce',
      boxShadow: 'none',
    },
    formFieldInputShowPasswordButton: {
      color: '#66708b',
    },
    formButtonPrimary: {
      backgroundColor: '#ef765c',
      color: '#ffffff',
      boxShadow: 'none',
    },
    dividerLine: {
      backgroundColor: '#ded8ce',
    },
    dividerText: {
      color: '#66708b',
    },
    footerActionText: {
      color: '#66708b',
    },
    footerActionLink: {
      color: '#d95c43',
    },
  },
}

function FlightPath() {
  return (
    <svg
      className="flight-path"
      viewBox="0 0 700 500"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M40 430 C160 300 250 360 340 250 C430 140 540 170 650 55"
        fill="none"
        stroke="rgba(239,118,92,0.42)"
        strokeWidth="3"
        strokeDasharray="10 12"
      />

      <circle cx="40" cy="430" r="6" fill="#ef765c" />
      <circle cx="340" cy="250" r="6" fill="#ef765c" />
      <circle cx="650" cy="55" r="6" fill="#ef765c" />

      <g transform="translate(340 250) rotate(-35)">
        <path
          d="M0 -12 L10 10 L3 7 L3 16 L-3 16 L-3 7 L-10 10 Z"
          fill="#ef765c"
        />
      </g>
    </svg>
  )
}

function App() {
  const { isLoaded, isSignedIn } = useAuth()

  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>(
    'sign-in',
  )

  const [page, setPage] = useState<Page>('home')

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading GlobalTrotter...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <main className="auth-layout">
        <section className="auth-hero">
          <FlightPath />

          <div className="hero-content">
            <div className="brand">
              <span className="brand-icon">✈</span>
              <span>GlobalTrotter</span>
            </div>

            <div className="hero-copy">
              <p className="hero-kicker">
                EXPLORE · PLAN · CONNECT
              </p>

              <h1>
                The world runs on
                <br />
                local time.
                <br />
                <span>You run on wanderlust.</span>
              </h1>

              <p>
                Discover destinations, plan unforgettable trips,
                and connect with travellers around the world.
              </p>
            </div>

            <div className="airport-row">
              <span>NRT</span>
              <span>CDG</span>
              <span>GIG</span>
              <span>CPT</span>
            </div>
          </div>
        </section>

        <section className="auth-side">
          <div className="auth-ticket">
            <div className="ticket-top">
              <span>GLOBALTROTTER</span>
              <span>
                {authMode === 'sign-in' ? 'SIGN IN' : 'SIGN UP'}
              </span>
            </div>

            <div className="ticket-line" />

            <div className="auth-content">
              <h2>
                {authMode === 'sign-in'
                  ? 'Welcome back'
                  : 'Start your journey'}
              </h2>

              <p className="auth-description">
                {authMode === 'sign-in'
                  ? 'Sign in to continue planning your next adventure.'
                  : 'Create an account and start exploring the world.'}
              </p>

              <div className="clerk-form">
                {authMode === 'sign-in' ? (
                  <SignIn
                    routing="hash"
                    appearance={clerkAppearance}
                  />
                ) : (
                  <SignUp
                    routing="hash"
                    appearance={clerkAppearance}
                  />
                )}
              </div>

              <div className="auth-switch">
                {authMode === 'sign-in' ? (
                  <>
                    <span>Don't have an account?</span>
                    <button
                      type="button"
                      onClick={() => setAuthMode('sign-up')}
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => setAuthMode('sign-in')}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="ticket-bottom">
              Secure authentication powered by Clerk
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <button
          type="button"
          className="app-brand"
          onClick={() => setPage('home')}
        >
          <span className="brand-icon">✈</span>
          <span>GlobalTrotter</span>
        </button>

        <nav className="app-nav" aria-label="Main navigation">
          <button
            type="button"
            className={page === 'home' ? 'active' : ''}
            onClick={() => setPage('home')}
          >
            Home
          </button>

          <button
            type="button"
            className={page === 'community' ? 'active' : ''}
            onClick={() => setPage('community')}
          >
            Community
          </button>

          <button
            type="button"
            className={page === 'profile' ? 'active' : ''}
            onClick={() => setPage('profile')}
          >
            Profile
          </button>

          <UserButton />
        </nav>
      </header>

      {page === 'home' && (
        <section className="home-page">
          <p className="home-kicker">WELCOME BACK</p>

          <h1>Ready for your next adventure?</h1>

          <p>
            Explore destinations, plan trips, and connect with
            fellow travellers.
          </p>
        </section>
      )}

      {page === 'community' && (
        <div className="page-container">
          <CommunityPage />
        </div>
      )}

      {page === 'profile' && (
        <div className="page-container">
          <ProfilePage />
        </div>
      )}
    </main>
  )
}

export default App