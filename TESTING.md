# Testing BRC-77 Signature Verification

This document explains how to test BRC-77 message signature verification in this app.

## How the Verification Works

The app implements **BRC-77 Message Signature Verification** using the @bsv/sdk library:

1. **BRC-77 Format**: Signatures follow the BRC-77 standard (140-141 bytes)
   - Version: `0x42423301` (4 bytes)
   - Signer ID: 33 bytes (compressed public key)
   - Verifier ID: 1 or 33 bytes (`0x00` for public signatures)
   - Key ID: 32 bytes
   - Signature: Variable length (BRC-3 DER-formatted ECDSA)

2. **Message Encoding**: Messages are encoded as UTF-8 byte arrays using Utils.toArray()

3. **Signature Verification**: Uses SignedMessage.verify() from @bsv/sdk

4. **Byte-for-Byte Verification**: The signature is verified against the exact original challenge message

**Reference:** https://brc.dev/77

## Testing with Real Signatures

### Option 1: Using a BRC-77 Compatible Identity Client (Recommended)

Use any BSV identity client that supports BRC-77 message signing:

1. **Click "Sign in with Identity Client"** in the app
2. **Copy the challenge message** (use the "Copy message to sign" button)
3. **Sign the message** with your BRC-77 identity client using `SignedMessage.sign()`
4. **Paste the BRC-77 signature** back into the app (140-141 bytes, base64-encoded)
5. **Click "Verify and sign in"**

The app will:
- ✅ Parse the BRC-77 signature format (version, signer ID, signature)
- ✅ Verify the signature cryptographically using BRC-3 ECDSA
- ✅ Validate against the exact challenge message byte-for-byte
- ✅ Display verification success in the console with BRC-77 details
- ✅ Allow you to proceed to the birthday countdown setup

**Compatible Identity Clients:**
- Any client using @bsv/sdk's SignedMessage
- BSV-based identity wallets supporting BRC-77
- Custom implementations following the BRC-77 specification

### Option 2: Using OpenSSL (Command Line)

```bash
# Generate a private key
openssl ecparam -name secp256k1 -genkey -noout -out private-key.pem

# Sign a message (save your challenge message to challenge.txt)
openssl dgst -sha256 -sign private-key.pem challenge.txt | base64
```

Note: OpenSSL signatures may need additional formatting to work with the compact signature format.

### Option 3: Using a JavaScript Library

```javascript
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

// Generate a key pair
const keyPair = ec.genKeyPair()

// Your challenge message from the app
const message = `Birthday Countdown Demo
Action: Sign in
Issued at: 2025-12-23T23:30:00.000Z
Nonce: abc123...`

// Hash the message
const crypto = require('crypto')
const hash = crypto.createHash('sha256').update(message).digest('hex')

// Sign the hash
const signature = keyPair.sign(hash)

// Create compact signature format
const r = signature.r.toString('hex').padStart(64, '0')
const s = signature.s.toString('hex').padStart(64, '0')
const compactSig = r + s

console.log('Signature (hex):', compactSig)
console.log('Public Key:', keyPair.getPublic('hex'))
```

## What Gets Verified

When you submit a BRC-77 signature, the app verifies:

1. ✅ **Signature Format**: Must be valid base64-encoded BRC-77 format (140-141 bytes)
2. ✅ **Message Match**: The signature must be for the EXACT challenge message shown
3. ✅ **Cryptographic Validity**: Uses BRC-3 ECDSA verification on secp256k1 curve
4. ✅ **BRC-77 Structure**: Validates version marker (`0x42423301`), signer ID, and signature components

## What Gets Rejected

The verification will FAIL if:

- ❌ The challenge message is modified before signing
- ❌ The signature is for a different message
- ❌ The signature format is invalid
- ❌ The signature is corrupted or incomplete
- ❌ Random strings that aren't valid signatures

## Browser Console Output

When BRC-77 verification succeeds, you'll see:
```
🔍 Verifying BRC-77 signature...
📝 Original message: Birthday Countdown Demo...
✍️ BRC-77 Signature (base64, first 50 chars): [signature]
📏 Signature length: 140 bytes
📏 Message length: [X] bytes
✅ BRC-77 signature verified successfully!
📝 Message verified: Birthday Countdown Demo...
📋 Format: BRC-77 (Message Signature Creation and Verification)
```

When verification fails, you'll see the specific error:
```
❌ Signature verification failed. The signature does not match the challenge message.
```

## Security Notes

This BRC-77 implementation:
- ✅ Prevents message tampering (can't modify the challenge)
- ✅ Verifies cryptographic signatures using BRC-3 ECDSA (not just checking format)
- ✅ Validates BRC-77 signature structure (version, signer ID, signature)
- ✅ Uses simplified identity approach (single key pair from seed with HMAC)
- ⚠️ Does NOT yet implement replay attack prevention (nonce tracking)
- ⚠️ Does NOT yet implement timestamp expiration

For production use, add nonce tracking and timestamp validation as described in SECURITY.md.

**BRC-77 Advantages:**
- Supports advanced features like BRC-42 key derivation and BRC-43 invoice numbers (not used in this simplified demo)
- Supports privately-verifiable signatures (only intended recipient can verify)
- More secure than legacy Bitcoin Signed Message format
- Standard format for BSV identity and authentication systems

## Example Test Flow with BRC-77

1. **Start the app**: Open http://localhost:3000
2. **Click "Sign in with Identity Client"**
3. **See the challenge message** with timestamp and nonce
4. **Copy the exact message** - every character matters!
5. **Sign with your BRC-77 identity client** - use SignedMessage.sign()
6. **Paste the BRC-77 signature** - 140-141 bytes in base64 format
7. **Verify** - the app will verify using BRC-77 format

### Success Case (BRC-77)
- Message: `Birthday Countdown Demo\nAction: Sign in\n...`
- You sign this exact message using BRC-77 SignedMessage.sign()
- Signature includes version `0x42423301` + signer ID + signature
- Verification: ✅ PASS - BRC-77 signature verified!

### Failure Case
- Message: `Birthday Countdown Demo\nAction: Sign in\n...`
- You modify it to: `Birthday Countdown Demo\nAction: Sign out\n...`
- You sign the modified message with BRC-77
- Verification: ❌ FAIL - signature doesn't match original challenge

This proves the BRC-77 signature verification is working correctly!

**BRC-77 Signature Structure Verified:**
```
[0x42, 0x42, 0x33, 0x01] - Version marker
[33 bytes]               - Signer's compressed public key
[1 or 33 bytes]          - Verifier ID (0x00 for public)
[32 bytes]               - Key ID
[Variable]               - BRC-3 ECDSA signature (DER format)
```
