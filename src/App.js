import { Cake, Copy, Check, XCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { FollowerPointerCard } from './components/ui/following-pointer'
import { AuroraBackground } from './lib/background'
import { Button, Card, Container, Heading, Text } from './components/shared'
import { SignedMessage, Utils } from '@bsv/sdk'

/**
 * ============================================================================
 * PART 1: SignIn Component - Identity-Based Authentication Gate
 * ============================================================================
 *
 * A signature-based authentication gate that requires users to sign
 * a challenge message before accessing the birthday countdown app.
 *
 * No passwords, no accounts - just cryptographic signatures.
 */
const SignIn = ({ onSignInSuccess }) => {
  // UI state management
  const [view, setView] = useState('welcome') // 'welcome' | 'signing'
  const [challengeMessage, setChallengeMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [copied, setCopied] = useState(false)

  /**
   * Generate a human-readable sign-in challenge message
   * Includes timestamp and nonce for replay protection
   */
  const generateChallenge = () => {
    const timestamp = new Date().toISOString()
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const message = `Birthday Countdown Demo
Action: Sign in
Issued at: ${timestamp}
Nonce: ${nonce}`

    return message
  }

  /**
   * Handle "Sign in with Identity Client" button click
   * Generates challenge and transitions to signing view
   */
  const handleStartSignIn = () => {
    const challenge = generateChallenge()
    setChallengeMessage(challenge)
    setSignature('')
    setError('')
    setView('signing')
  }

  /**
   * Copy the challenge message to clipboard
   * Preserves exact formatting including line breaks
   */
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(challengeMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy message:', err)
      setError('Failed to copy message to clipboard')
    }
  }

  /**
   * Verify signature and complete sign-in
   *
   * SECURITY: This function MUST verify that:
   * 1. The signature is cryptographically valid
   * 2. The signature was created for the EXACT challenge message we generated
   * 3. The message hasn't been tampered with
   * 4. The signature isn't being reused (nonce/timestamp check)
   *
   * NOTE: Current implementation is a STUB for demo purposes.
   * TODO: Integrate real cryptographic verification library (e.g., bsv.js, elliptic, etc.)
   */
  const handleVerifyAndSignIn = async () => {
    setError('')

    // Basic validation: check if signature is provided
    if (!signature.trim()) {
      setError('Please paste your signature')
      return
    }

    setIsVerifying(true)

    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // ============================================================
      // STUB VERIFICATION - REPLACE WITH REAL CRYPTO VERIFICATION
      // ============================================================
      // In production, you would:
      // 1. Parse the signature (usually base64 or hex encoded)
      // 2. Recover the public key from the signature
      // 3. Verify signature cryptographically: verify(challengeMessage, signature, publicKey)
      // 4. Check the nonce/timestamp to prevent replay attacks
      // 5. Optionally verify against a known public key or key registry

      const verificationResult = await stubVerifySignature(
        challengeMessage,
        signature.trim()
      )

      if (verificationResult.valid) {
        // Sign-in successful
        onSignInSuccess()
      } else {
        setError(verificationResult.error || 'Invalid signature. The signature could not be verified against the challenge message.')
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  /**
   * BRC-77 Message Signature Verification
   *
   * This function uses the BSV SDK's SignedMessage.verify() method to verify
   * signatures in BRC-77 format (Message Signature Creation and Verification).
   *
   * BRC-77 Signature Format (140-141 bytes):
   * - Version: 4 bytes (0x42423301)
   * - Signer ID: 33 bytes (DER compressed public key)
   * - Verifier ID: 1 or 33 bytes (0x00 for public signatures)
   * - Key ID: 32 bytes (unique identifier)
   * - Signature: Variable length (BRC-3 DER-formatted ECDSA signature)
   *
   * NOTE: This demo uses a simplified identity approach (single key pair from seed).
   * BRC-77 supports advanced features like BRC-42 key derivation and BRC-43 invoice
   * numbers, but those are not required for basic signature verification.
   *
   * Reference: https://brc.dev/77
   *
   * @param {string} originalMessage - The challenge message we generated
   * @param {string} providedSignature - The base64-encoded BRC-77 signature (140-141 bytes)
   * @returns {Promise<{valid: boolean, error?: string, publicKey?: string}>}
   */
  const stubVerifySignature = async (originalMessage, providedSignature) => {
    try {
      // SECURITY CHECK 1: Signature must be present
      if (!providedSignature || providedSignature.trim().length === 0) {
        return {
          valid: false,
          error: 'No signature provided.'
        }
      }

      // SECURITY CHECK 2: Challenge message must exist
      if (!originalMessage) {
        return {
          valid: false,
          error: 'No challenge message found. Please restart the sign-in process.'
        }
      }

      console.log('🔍 Verifying BRC-77 signature...')
      console.log('📝 Original message:', originalMessage)
      console.log('✍️ BRC-77 Signature (base64, first 50 chars):', providedSignature.substring(0, 50) + '...')

      // Convert the message to UTF-8 byte array using BSV SDK Utils
      const messageBytes = Utils.toArray(originalMessage, 'utf8')

      // Convert the base64 signature to byte array
      let signatureBytes
      try {
        const binaryString = atob(providedSignature.trim())
        signatureBytes = Array.from(binaryString, char => char.charCodeAt(0))
      } catch (e) {
        return {
          valid: false,
          error: 'Invalid signature encoding. Expected base64 format.'
        }
      }

      console.log(`📏 Signature length: ${signatureBytes.length} bytes`)
      console.log(`📏 Message length: ${messageBytes.length} bytes`)

      // Verify the signature using BSV SDK's SignedMessage.verify()
      // This handles the Bitcoin Signed Message format automatically
      let isValid
      try {
        isValid = SignedMessage.verify(messageBytes, signatureBytes)
      } catch (verifyError) {
        console.error('❌ Signature verification error:', verifyError)
        return {
          valid: false,
          error: `Verification failed: ${verifyError.message}`
        }
      }

      if (!isValid) {
        return {
          valid: false,
          error: 'Signature verification failed. The signature does not match the challenge message.'
        }
      }

      console.log('✅ BRC-77 signature verified successfully!')
      console.log('📝 Message verified:', originalMessage.substring(0, 50) + '...')
      console.log('📋 Format: BRC-77 (Message Signature Creation and Verification)')

      return {
        valid: true,
        publicKey: 'recovered-from-signature' // SignedMessage.verify doesn't return the public key
      }
    } catch (error) {
      console.error('❌ Verification error:', error)
      return {
        valid: false,
        error: `Verification error: ${error.message}`
      }
    }
  }

  /**
   * Cancel signing process and return to welcome screen
   */
  const handleCancel = () => {
    setView('welcome')
    setChallengeMessage('')
    setSignature('')
    setError('')
    setCopied(false)
  }

  // Welcome screen view
  if (view === 'welcome') {
    return (
      <Container>
        <Card className="w-full max-w-md">
          <div className="text-center">
            <Heading level={1}>Welcome</Heading>

            <Text className="mb-8 text-lg">
              Sign in to access the Birthday Countdown App!
            </Text>

            <Button
              onClick={handleStartSignIn}
              className="mb-4 w-full"
            >
              Sign in with Identity Client
            </Button>

            <Text variant="secondary" className="mb-6 text-sm">
              No passwords. No accounts. You will be asked to sign a message locally.
            </Text>

            <Text variant="tertiary" className="text-xs leading-relaxed">
              Demo: Uses cryptographic key-based authentication. In production, this would verify signatures using your identity client.
            </Text>
          </div>
        </Card>
      </Container>
    )
  }

  // Signing screen view
  return (
    <Container className="py-8">
      <Card className="w-full max-w-2xl">
        <Heading level={1} className="mb-6">
          Sign In
        </Heading>

        <div className="space-y-5">
          {/* Challenge Message */}
          <div>
            <label className="block text-sm font-medium text-[#16243E] mb-3">
              Message to sign (exact text)
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Sign the entire message below exactly as shown.
            </p>
            <div className="bg-[#F2F6F7] border border-[#C9E5E9] rounded-lg p-4">
              <pre className="text-xs text-[#16243E] whitespace-pre-wrap font-mono leading-relaxed">
{challengeMessage}
              </pre>
            </div>
            <div className="mt-3 flex items-start gap-2">
              <button
                onClick={handleCopyMessage}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9E5E9] text-[#16243E] rounded-lg hover:bg-[#F2F6F7] transition-colors text-sm font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#019AA8]" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy message to sign
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2 flex-1">
                Click 'Copy message to sign', then sign the copied text using your identity client.
              </p>
            </div>
          </div>

          {/* Signature Input */}
          <div>
            <label className="block text-sm font-medium text-[#16243E] mb-2">
              Paste your signature
            </label>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Paste the signature generated by your identity client…"
              className="w-full px-3 py-2.5 border border-[#C9E5E9] rounded-lg focus:ring-2 focus:ring-[#019AA8] focus:border-transparent resize-none font-mono text-sm text-gray-700"
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Verification Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs">
            <p className="font-semibold mb-1">🔐 BRC-77 Signature Verification</p>
            <p className="mb-3">
              This app uses <strong>BRC-77</strong> (Message Signature Creation and Verification) format.
              Your signature will be cryptographically verified against the exact challenge message above using BRC-3 ECDSA verification.
            </p>
            <p className="text-blue-700 leading-relaxed">
              <strong>In plain English:</strong> You're proving you control your identity key, like showing you have the right key to unlock a door.
              Your identity client signs the message above, and this app verifies it's really from you.
              No password needed, no account created. Your data stays with you.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleVerifyAndSignIn}
              disabled={isVerifying || !signature}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#019AA8] to-[#16243E] text-white font-medium rounded-lg hover:from-[#017a86] hover:to-[#0f1a2f] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify and sign in'}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 text-gray-600 hover:text-[#16243E] hover:bg-[#F2F6F7] rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Card>
    </Container>
  )
}

/**
 * ============================================================================
 * PART 2: SetupScreen Component - Post-Authentication Onboarding
 * ============================================================================
 *
 * After successful authentication, this screen:
 * - Explains what just happened (key-based auth, no data stored)
 * - Educates about BSV identity architecture
 * - Collects personalized info (name, birthday)
 */
const SetupScreen = ({ onComplete }) => {
  const [name, setName] = useState('')
  const [month, setMonth] = useState('0') // January
  const [day, setDay] = useState('1')
  const [error, setError] = useState('')

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!month || !day) {
      setError('Please select your birthday')
      return
    }

    onComplete(name.trim(), parseInt(month), parseInt(day))
  }

  return (
    <Container>
      <Card className="w-full max-w-2xl">
        <div className="space-y-6">
          {/* Success Header */}
          <div className="text-center pb-4 border-b border-[#C9E5E9]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#019AA8] bg-opacity-10 mb-4">
              <Check className="w-8 h-8 text-[#019AA8]" />
            </div>
            <Heading level={1} className="mb-2">
              Successfully Connected!
            </Heading>
            <Text variant="secondary" className="text-base">
              You've proven control of your cryptographic key
            </Text>
          </div>

          {/* Educational Content */}
          <div className="space-y-4">
            <div className="bg-[#F2F6F7] rounded-lg p-5 space-y-3">
              <h3 className="font-semibold text-[#16243E] text-lg">
                What just happened?
              </h3>
              <div className="space-y-2 text-sm text-[#16243E] opacity-90">
                <p>
                  <strong>No password was stored.</strong> No account was created.
                  You proved you control a cryptographic key by signing a challenge message.
                </p>
                <p>
                  <strong>This app authenticated to you</strong> — not the other way around.
                  You didn't "log in" to this app. This app verified your signature and granted you access.
                </p>
                <p>
                  <strong>Nothing about you was saved.</strong> Your identity, data, and keys
                  remain under your control. This is a glimpse of the future identity architecture
                  in Bitcoin SV.
                </p>
                <p className="pt-2 border-t border-[#C9E5E9] text-xs opacity-75">
                  <strong>How it worked:</strong> Your signature was cryptographically verified using
                  <strong> BRC-77</strong> (BSV's Message Signature standard). The signature was verified
                  against the exact challenge message byte-for-byte using BRC-3 ECDSA verification.
                  No password needed, no central authority required - just your cryptographic key.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#019AA8] to-[#16243E] rounded-lg p-5 text-white space-y-2">
              <h3 className="font-semibold text-lg">
                The Future: You Own Your Identity
              </h3>
              <p className="text-sm opacity-95">
                In BSV's architecture, one seed key pair controls all your identities,
                data, and payments. Apps don't hold your information — they request
                access from you. You authenticate apps, not the reverse.
              </p>
            </div>
          </div>

          {/* Personalization Form */}
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="border-t border-[#C9E5E9] pt-6">
              <h3 className="font-semibold text-[#16243E] text-lg mb-4">
                Let's personalize your experience
              </h3>

              <div className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-[#16243E] mb-2">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2.5 border border-[#C9E5E9] rounded-lg focus:ring-2 focus:ring-[#019AA8] focus:border-transparent text-[#16243E]"
                  />
                </div>

                {/* Birthday Inputs */}
                <div>
                  <label className="block text-sm font-medium text-[#16243E] mb-2">
                    Your birthday
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="px-3 py-2.5 border border-[#C9E5E9] rounded-lg focus:ring-2 focus:ring-[#019AA8] focus:border-transparent text-[#16243E]"
                    >
                      {months.map((m, idx) => (
                        <option key={idx} value={idx}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="px-3 py-2.5 border border-[#C9E5E9] rounded-lg focus:ring-2 focus:ring-[#019AA8] focus:border-transparent text-[#16243E]"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-[#019AA8] to-[#16243E] text-white font-medium rounded-lg hover:from-[#017a86] hover:to-[#0f1a2f] transition-all shadow-md hover:shadow-lg"
            >
              Continue to Your Birthday Countdown
            </button>
          </form>
        </div>
      </Card>
    </Container>
  )
}

/**
 * ============================================================================
 * PART 3: BirthdayCountdown Component - Personalized Birthday App
 * ============================================================================
 *
 * Now displays a personalized countdown using the user's name and birthday
 */
const BirthdayCountdown = ({ userName, userBirthday }) => {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    // Use personalized birthday (month is 0-indexed in Date)
    let birthdayDate = new Date(currentYear, userBirthday.month, userBirthday.day, 6, 0, 0)

    if (now > birthdayDate) {
      birthdayDate.setFullYear(currentYear + 1)
    }

    const difference = birthdayDate - now
    return Math.floor(difference / 1000)
  })

  const [isBirthday, setIsBirthday] = useState(false)

  useEffect(() => {
    if (secondsLeft <= 0) {
      setIsBirthday(true)
      return
    }

    const timerId = setTimeout(() => {
      setSecondsLeft(secondsLeft - 1)
    }, 1000)

    return () => clearTimeout(timerId)
  }, [secondsLeft])

  const days = Math.floor(secondsLeft / (24 * 60 * 60))
  const hours = Math.floor((secondsLeft % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((secondsLeft % (60 * 60)) / 60)
  const seconds = secondsLeft % 60

  const cakeColors = [
    'text-red-500',
    'text-blue-500',
    'text-green-500',
    'text-yellow-500',
    'text-purple-500',
    'text-pink-500',
  ]

  // Create colorful letters from user's name
  const coloredName = userName.split('').map((letter, index) => (
    <span key={index} className={cakeColors[index % cakeColors.length]}>
      {letter}
    </span>
  ))

  return (
    <div className="relative z-10">
      {isBirthday && <Confetti />}
      <Card className="max-w-2xl mx-auto text-center">
        <h1 className="mb-2 text-center text-3xl font-bold sm:text-4xl" style={{ color: 'var(--color-text-primary)' }}>
          {coloredName}
          <span style={{ color: 'var(--color-text-primary)' }}>'s</span>
        </h1>
        <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-text-primary)' }}>
          Birthday Countdown!
        </h2>
        <div className="mb-6 text-center text-base sm:text-lg lg:text-xl" style={{ color: 'var(--color-text-primary)' }}>
          {!isBirthday ? (
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span>
                <span className="font-semibold">{days}</span> days
              </span>
              <span>
                <span className="font-semibold">{hours}</span> hours
              </span>
              <span>
                <span className="font-semibold">{minutes}</span> minutes
              </span>
              <span>
                <span className="font-semibold">{seconds}</span> seconds
              </span>
            </div>
          ) : (
            <span>Happy Birthday!</span>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {cakeColors.map((color, index) => (
            <Cake
              key={index}
              className={`${color} h-10 w-10 animate-bounce sm:h-12 sm:w-12 lg:h-14 lg:w-14`}
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </div>
        <div className="mt-8 max-w-full">
          <img
            src={`${process.env.PUBLIC_URL}/Day1Pic.jpg`}
            alt="Birthday celebration"
            className="mx-auto w-[300px] rounded-lg border-none"
          />
        </div>
      </Card>
    </div>
  )
}

/**
 * ============================================================================
 * PART 3: Main App Component - Authentication Gate
 * ============================================================================
 *
 * This component manages the authentication state and decides whether
 * to show the SignIn component or the BirthdayCountdown component.
 *
 * The identity sign-in acts as a gate:
 * - If NOT logged in → Show SignIn component
 * - If logged in → Show existing birthday countdown app
 */
function App() {
  // Authentication state - gates access to the birthday app
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false)

  // User profile data
  const [userName, setUserName] = useState('')
  const [userBirthday, setUserBirthday] = useState({ month: 9, day: 28 }) // Default: Oct 28

  // Handler for successful sign-in
  const handleSignInSuccess = () => {
    setIsLoggedIn(true)
  }

  // Handler for completing setup
  const handleSetupComplete = (name, birthdayMonth, birthdayDay) => {
    setUserName(name)
    setUserBirthday({ month: birthdayMonth, day: birthdayDay })
    setHasCompletedSetup(true)
  }

  // If not logged in, show the SignIn component
  if (!isLoggedIn) {
    return <SignIn onSignInSuccess={handleSignInSuccess} />
  }

  // If logged in but hasn't completed setup, show the SetupScreen
  if (!hasCompletedSetup) {
    return <SetupScreen onComplete={handleSetupComplete} />
  }

  // If logged in and setup complete, render personalized birthday countdown
  return (
    <FollowerPointerCard
      title={
        <TitleComponent
          title={blogContent.author}
          avatar={blogContent.authorAvatar}
        />
      }
    >
      <AuroraBackground>
        <BirthdayCountdown userName={userName} userBirthday={userBirthday} />
      </AuroraBackground>
    </FollowerPointerCard>
  )
}

/**
 * ============================================================================
 * Supporting Components and Data (from original app)
 * ============================================================================
 */
const blogContent = {
  author: "This is fun",
  date: '28th October, 2024',
  title: "Rocket's Birthday Countdown",
  description: "Counting down the days to Rocket's big day!",
  image: `${process.env.PUBLIC_URL}/Day1Pic.jpg`,
  authorAvatar: `${process.env.PUBLIC_URL}/Day1Pic.jpg`,
}

const TitleComponent = ({ title, avatar }) => (
  <div className="flex items-center space-x-2">
    <img
      src={avatar}
      alt="thumbnail"
      className="w-5 h-5 rounded-full border-2 border-white object-cover"
      onError={(e) => {
        console.error("Error loading avatar:", avatar)
        e.target.src = 'https://placehold.co/20x20'
      }}
    />
    <p className="text-sm">{title}</p>
  </div>
)

export default App
