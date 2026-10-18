import assert from 'node:assert/strict'

process.env.SUPABASE_URL = 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.BETA_ACCESS_PASSWORD = 'test-beta-password'
delete process.env.BETA_OWNER_EMAIL

const { default: handler } = await import('../api/beta-access.js')

function createResponse() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(name, value) {
      this.headers[name] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
    end() {
      return this
    },
  }
}

async function request(req) {
  const res = createResponse()
  await handler({ headers: {}, ...req }, res)
  return res
}

const publicWaitlistResponse = await request({
  method: 'GET',
  headers: { origin: 'https://allignd.nl' },
})
assert.equal(publicWaitlistResponse.statusCode, 401, 'public waitlist visitor without the beta code stays locked out')

const nativeLoginResponse = await request({
  method: 'GET',
  headers: { origin: 'capacitor://localhost' },
})
assert.equal(nativeLoginResponse.statusCode, 200, 'native app can reach the sign-in screen without relying on cross-site cookies')
assert.equal(nativeLoginResponse.body.ownerAuthenticated, false, 'native login access does not grant app access')

const unlockResponse = await request({
  method: 'POST',
  headers: { origin: 'https://allignd.nl' },
  body: { password: 'test-beta-password' },
})
assert.equal(unlockResponse.statusCode, 200, 'correct beta password unlocks the login flow')

const betaCookie = unlockResponse.headers['Set-Cookie'].split(';')[0]
const loginOnlyResponse = await request({
  method: 'GET',
  headers: { origin: 'https://allignd.nl', cookie: betaCookie },
})
assert.equal(loginOnlyResponse.statusCode, 200, 'beta cookie permits the login flow')
assert.equal(loginOnlyResponse.body.ownerAuthenticated, false, 'beta cookie alone does not grant app access')

const missingOwnerConfigResponse = await request({
  method: 'GET',
  headers: {
    origin: 'https://allignd.nl',
    cookie: betaCookie,
    authorization: 'Bearer owner-session-token',
  },
})
assert.equal(missingOwnerConfigResponse.statusCode, 503, 'app access fails closed until the owner email is configured')

console.log('Beta access tests passed: waitlist stays locked; only authenticated owner access can open the app.')
