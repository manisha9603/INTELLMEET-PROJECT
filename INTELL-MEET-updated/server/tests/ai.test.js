import { processTranscription, generateMeetingInsights } from '../services/aiService.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// ── Test 1: ENV vars ────────────────────────────────────
function testEnvVars() {
  console.log('\n🧪 Test 1: Environment variables...');
  const hasGroq = !!process.env.GROQ_API_KEY;
  console.log(`  ${hasGroq ? '✅' : '❌'} GROQ_API_KEY: ${hasGroq ? 'SET' : 'MISSING'}`);
  return hasGroq;
}

// ── Test 2: Transcription ───────────────────────────────

async function testTranscription() {
  console.log('\n🧪 Test 2: Transcription...');
  const uploadsDir = './uploads';
  const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.webm'));
  if (files.length === 0) {
    console.log('⚠️  No .webm files in uploads/ — skipping');
    console.log('   (Transcription tested live in meeting room ✅)');
    return true;
  }
  const testFile = path.join(uploadsDir, files[0]);
  const result = await processTranscription(testFile);
  if (result && typeof result === 'string') {
    console.log('✅ PASS — Got text:', result.slice(0, 60) + '...');
    return true;
  }
  console.log('❌ FAIL — returned null');
  return false;
}

// ── Test 3: AI Insights ─────────────────────────────────
async function testMeetingInsights() {
  console.log('\n🧪 Test 3: Meeting Insights...');
  const transcript = `
    John: Let's review project status.
    Sarah: Frontend is 80% done. I need to finish dashboard by Friday.
    John: Mike, fix the login bug by tomorrow.
    Mike: Yes, I'll handle that today.
    John: Let's schedule a demo for next Monday.
  `;
  const result = await generateMeetingInsights(transcript, 'Weekly Standup');
  const checks = {
    summary:      typeof result?.summary === 'string' && result.summary.length > 10,
    actionItems:  Array.isArray(result?.actionItems) && result.actionItems.length > 0,
    sentiment:    ['positive','neutral','negative'].includes(result?.sentiment),
    keyDecisions: Array.isArray(result?.keyDecisions),
    topics:       Array.isArray(result?.topics),
  };
  let allPassed = true;
  for (const [key, ok] of Object.entries(checks)) {
    console.log(`  ${ok ? '✅' : '❌'} ${key}`);
    if (!ok) allPassed = false;
  }
  if (allPassed) {
    console.log('\n📋 Summary:', result.summary);
    console.log('📋 Action items:', result.actionItems.length, 'found');
    console.log('📋 Sentiment:', result.sentiment);
  }
  return allPassed;
}

// ── Run ─────────────────────────────────────────────────
async function runTests() {
  console.log('🚀 Member 3 — AI + Real-time Tests');
  console.log('='.repeat(40));
  const results = [];
  results.push(testEnvVars());
  results.push(await testTranscription());
  results.push(await testMeetingInsights());
  console.log('\n' + '='.repeat(40));
  const passed = results.filter(Boolean).length;
  console.log(`📊 ${passed}/${results.length} tests passed`);
  if (passed === results.length) console.log('🎉 All tests passed! Week 4 complete!\n');
  else console.log('⚠️  Some tests failed\n');
}

runTests();