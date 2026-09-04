import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error('No GEMINI_API_KEY'); process.exit(1); }

// Test 1: Direct REST call to list models
console.log('=== Test 1: Direct REST API - list available models ===\n');
try {
  const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
  const data = await resp.json();
  if (data.models) {
    const embedModels = data.models.filter(function(m) {
      return (m.name || '').toLowerCase().includes('embed') ||
        (m.supportedGenerationMethods || []).includes('embedContent');
    });
    console.log('Total models available:', data.models.length);
    console.log('Embedding-capable models found:', embedModels.length);
    for (const m of embedModels) {
      console.log('  -', m.name, '| methods:', (m.supportedGenerationMethods || []).join(', '), '| dims:', m.inputTokenLimit || 'N/A');
    }
    // Also show all model names for reference
    console.log('\nAll model names:');
    for (const m of data.models) {
      console.log('  ', m.name);
    }
  } else {
    console.log('Response:', JSON.stringify(data, null, 2).slice(0, 500));
  }
} catch (err) {
  console.error('REST list failed:', err.message || err);
}

// Test 2: Try embedding with different httpOptions / apiVersion
console.log('\n=== Test 2: Try with explicit httpOptions apiVersion ===\n');

var testText = 'Women protection law Punjab Pakistan rights';

// Try creating client with different apiVersion
var versions = ['v1beta', 'v1'];
var modelNames = [
  'text-embedding-004',
  'models/text-embedding-004',
  'publishers/google/models/text-embedding-004',
  'text-embedding-005',
  'models/text-embedding-005',
];

for (var ver of versions) {
  console.log('--- API version:', ver, '---');
  try {
    var ai2 = new GoogleGenAI({ apiKey: apiKey, httpOptions: { apiVersion: ver } });
    for (var mn of modelNames) {
      process.stdout.write('  ' + mn + '... ');
      try {
        var result = await ai2.models.embedContent({ model: mn, contents: testText });
        var vals = result && result.embeddings && result.embeddings[0] ? result.embeddings[0].values : null;
        if (vals && vals.length > 0) {
          console.log('OK - ' + vals.length + '-dim vector');
        } else {
          console.log('WARN - empty result');
        }
      } catch (e) {
        var msg = (e.message || '').slice(0, 100);
        console.log('FAIL - ' + msg);
      }
      await new Promise(function(r) { setTimeout(r, 200); });
    }
  } catch (e2) {
    console.log('  Client creation failed:', e2.message || e2);
  }
}

console.log('\n=== Done ===');
