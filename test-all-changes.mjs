/**
 * Automated Verification Suite for Mehfooz Legal Navigator
 * Tests all backend routes, security middleware, input validation,
 * AI orchestration, channel recommendation, and danger triggers.
 */

const BASE_URL = 'http://localhost:3000';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('Starting Mehfooz Full-Stack Test Suite');
  console.log('====================================================\n');

  // Test Suite 1: Health & Security Endpoints
  console.log('Suite 1: Health & Security Endpoints');
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert(res.status === 200, 'GET /api/health returns HTTP 200');
    const data = await res.json();
    assert(data.status === 'ok', 'Health response status is "ok"');
    assert(data.app.includes('Mehfooz'), 'Health response identifies app as Mehfooz');
    assert(data.security?.rateLimiting?.includes('ACTIVE'), 'Security: Rate limiting active');
    assert(data.security?.zeroDataLeak?.includes('ACTIVE'), 'Security: Zero-data-leak client-side vault active');
    assert(data.integrations?.hybridRetriever?.embeddingsReady === true, 'Hybrid Retriever: Embeddings ready (34+ vectors loaded)');
    assert(data.hasGeminiKey === true, 'Gemini API key is configured');
  } catch (err) {
    assert(false, `GET /api/health threw: ${err.message}`);
  }

  // Test Suite 2: Security Headers
  console.log('\nSuite 2: Security & Permissions Headers');
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert(res.headers.get('x-content-type-options') === 'nosniff', 'Header X-Content-Type-Options is nosniff');
    assert(res.headers.get('x-xss-protection')?.includes('1; mode=block'), 'Header X-XSS-Protection enabled');
    const permPolicy = res.headers.get('permissions-policy') || '';
    assert(permPolicy.includes('microphone=(self)'), 'Permissions-Policy permits microphone for Speech-to-Text (STT)');
    assert(permPolicy.includes('camera=(self)'), 'Permissions-Policy permits camera for evidence photos');
    assert(permPolicy.includes('geolocation=(self)'), 'Permissions-Policy permits geolocation for location tagging');
  } catch (err) {
    assert(false, `Security headers check threw: ${err.message}`);
  }

  // Test Suite 3: Input Validation & Sanitization
  console.log('\nSuite 3: Input Validation & Sanitization');
  try {
    // 3a. Missing query
    const resEmpty = await fetch(`${BASE_URL}/api/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(resEmpty.status === 400, 'Missing query rejected with HTTP 400');
    const dataEmpty = await resEmpty.json();
    assert(dataEmpty.code === 'INVALID_QUERY', 'Missing query returns code INVALID_QUERY');

    // 3b. Oversized query (>3000 chars)
    const longQuery = 'x'.repeat(3005);
    const resLong = await fetch(`${BASE_URL}/api/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: longQuery })
    });
    assert(resLong.status === 400, 'Oversized query rejected with HTTP 400');
    const dataLong = await resLong.json();
    assert(dataLong.code === 'QUERY_TOO_LONG', 'Oversized query returns code QUERY_TOO_LONG');

    // 3c. Null-byte sanitization
    const resNull = await fetch(`${BASE_URL}/api/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What is\0 law in\0 Punjab?' })
    });
    assert(resNull.status === 200, 'Payload with null bytes sanitized without crashing');
  } catch (err) {
    assert(false, `Input validation check threw: ${err.message}`);
  }

  // Test Suite 4: Safety Orchestrator Grounded RAG Query
  console.log('\nSuite 4: Safety Orchestrator Grounded RAG Query');
  try {
    const res = await fetch(`${BASE_URL}/api/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'What legal rights protect a woman facing domestic violence in Lahore?',
        language: 'en'
      })
    });
    assert(res.status === 200, 'POST /api/orchestrate returned HTTP 200');
    const data = await res.json();
    assert(Boolean(data.answerSummary), 'Returned structured English answer summary');
    assert(Boolean(data.answerSummaryUrdu), 'Returned structured Urdu answer summary (answerSummaryUrdu)');
    assert(Array.isArray(data.sourceReferences) && data.sourceReferences.length > 0, 'Returned grounded Punjab statutory citations');
    assert(data.retrieverMode === 'hybrid-embedding', 'Used hybrid-embedding retrieval mode');
    assert(data.disclaimerRequired === true, 'Included required legal disclaimer flag');
  } catch (err) {
    assert(false, `Orchestrate query threw: ${err.message}`);
  }

  // Test Suite 5: Department & Channel Recommendation Engine
  console.log('\nSuite 5: Department & Official Channel Routing');
  try {
    const res = await fetch(`${BASE_URL}/api/recommend-channel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'workplace_harassment',
        district: 'Rawalpindi',
        rawNarrative: 'My manager at office is demanding inappropriate favors and threatening my employment.',
        isSituationOngoing: false
      })
    });
    assert(res.status === 200, 'POST /api/recommend-channel returned HTTP 200');
    const data = await res.json();
    assert(
      data.recommendedChannel === 'workplace_ombudsperson' || data.recommendedChannel === 'fospah',
      `Correctly identified workplace ombudsperson (got: ${data.recommendedChannel})`
    );
    assert(Boolean(data.applicableLaw), `Identified statutory law: ${data.applicableLaw}`);
    assert(Boolean(data.rationaleUrdu), 'Provided Urdu rationale for non-English speakers');
  } catch (err) {
    assert(false, `Recommend channel test threw: ${err.message}`);
  }

  // Test Suite 6: Check-In & Crisis Endpoints Auth Protection
  console.log('\nSuite 6: Auth Protection on Sensitive Endpoints');
  try {
    const res = await fetch(`${BASE_URL}/api/check-in/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: 'Mall Road', expectedMinutes: 20 })
    });
    assert(res.status === 503 || res.status === 401, `Unauthenticated check-in blocked gracefully (status: ${res.status})`);
    const data = await res.json();
    assert(Boolean(data.code), `Returned error code: ${data.code}`);
  } catch (err) {
    assert(false, `Check-in auth protection threw: ${err.message}`);
  }

  // Summary
  console.log('\n====================================================');
  console.log(`Test Results: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} total tests`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
