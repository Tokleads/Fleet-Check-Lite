#!/usr/bin/env node

/**
 * Performance Benchmarking Script
 * Comprehensive performance testing for Titan Fleet
 */

const { performance } = require('perf_hooks');
const https = require('https');
const http = require('http');

// Configuration
const config = {
  baseUrl: process.env.API_URL || 'http://localhost:3000',
  iterations: 100,
  warmupIterations: 10,
};

// Test data
const testData = {
  login: {
    email: 'driver@example.com',
    password: 'password123',
  },
  inspection: {
    vehicleId: 1,
    driverId: 1,
    companyId: 1,
    type: 'PRE_TRIP',
    odometerReading: 50000,
    fuelLevel: 75,
    tyresCondition: 'PASS',
    lightsCondition: 'PASS',
    brakesCondition: 'PASS',
    fluidLevelsCondition: 'PASS',
    bodyCondition: 'PASS',
    interiorCondition: 'PASS',
    overallStatus: 'PASS',
  },
};

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, config.baseUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : null;
          resolve({ statusCode: res.statusCode, body: json, headers: res.headers });
        } catch (err) {
          resolve({ statusCode: res.statusCode, body, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Benchmark a single endpoint
 */
async function benchmarkEndpoint(name, method, path, data = null, headers = {}) {
  console.log(`\n📊 Benchmarking: ${name}`);
  console.log(`   Method: ${method} ${path}`);
  
  const times = [];
  let errors = 0;
  
  // Warm-up
  console.log(`   Warming up (${config.warmupIterations} iterations)...`);
  for (let i = 0; i < config.warmupIterations; i++) {
    try {
      await makeRequest(method, path, data, headers);
    } catch (err) {
      // Ignore warm-up errors
    }
  }
  
  // Actual benchmark
  console.log(`   Running benchmark (${config.iterations} iterations)...`);
  for (let i = 0; i < config.iterations; i++) {
    const start = performance.now();
    
    try {
      const response = await makeRequest(method, path, data, headers);
      const end = performance.now();
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        times.push(end - start);
      } else {
        errors++;
      }
    } catch (err) {
      errors++;
    }
    
    // Progress indicator
    if ((i + 1) % 10 === 0) {
      process.stdout.write('.');
    }
  }
  
  console.log('');
  
  // Calculate statistics
  if (times.length === 0) {
    console.log('   ❌ All requests failed');
    return;
  }
  
  times.sort((a, b) => a - b);
  
  const min = times[0];
  const max = times[times.length - 1];
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const median = times[Math.floor(times.length / 2)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];
  
  console.log('\n   Results:');
  console.log(`   ├─ Min:      ${min.toFixed(2)}ms`);
  console.log(`   ├─ Max:      ${max.toFixed(2)}ms`);
  console.log(`   ├─ Mean:     ${mean.toFixed(2)}ms`);
  console.log(`   ├─ Median:   ${median.toFixed(2)}ms`);
  console.log(`   ├─ P95:      ${p95.toFixed(2)}ms`);
  console.log(`   ├─ P99:      ${p99.toFixed(2)}ms`);
  console.log(`   └─ Errors:   ${errors}/${config.iterations}`);
  
  // Performance grade
  let grade = '❌ F';
  if (mean < 50) grade = '✅ A+';
  else if (mean < 100) grade = '✅ A';
  else if (mean < 200) grade = '✅ B';
  else if (mean < 500) grade = '⚠️  C';
  else if (mean < 1000) grade = '⚠️  D';
  
  console.log(`\n   Grade: ${grade}`);
  
  return { name, min, max, mean, median, p95, p99, errors };
}

/**
 * Run all benchmarks
 */
async function runBenchmarks() {
  console.log('🚀 Titan Fleet Performance Benchmarks');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Base URL: ${config.baseUrl}`);
  console.log(`   Iterations: ${config.iterations}`);
  console.log(`   Warmup: ${config.warmupIterations}`);
  console.log('');
  
  const results = [];
  
  // Health check
  results.push(await benchmarkEndpoint(
    'Health Check',
    'GET',
    '/api/health'
  ));
  
  // Get vehicles (requires auth)
  results.push(await benchmarkEndpoint(
    'Get Vehicles',
    'GET',
    '/api/vehicles',
    null,
    { 'Cookie': 'connect.sid=test-session' }
  ));
  
  // Get inspections (requires auth)
  results.push(await benchmarkEndpoint(
    'Get Inspections',
    'GET',
    '/api/inspections?limit=20',
    null,
    { 'Cookie': 'connect.sid=test-session' }
  ));
  
  // Get defects (requires auth)
  results.push(await benchmarkEndpoint(
    'Get Defects',
    'GET',
    '/api/defects?status=OPEN',
    null,
    { 'Cookie': 'connect.sid=test-session' }
  ));
  
  // Get reminders (requires auth)
  results.push(await benchmarkEndpoint(
    'Get Reminders',
    'GET',
    '/api/reminders?status=ACTIVE',
    null,
    { 'Cookie': 'connect.sid=test-session' }
  ));
  
  // Summary
  console.log('\n\n📈 Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Endpoint                  Mean      P95       P99       Errors');
  console.log('─────────────────────────────────────────────────────────────────');
  
  results.forEach(result => {
    if (result) {
      const name = result.name.padEnd(25);
      const mean = `${result.mean.toFixed(2)}ms`.padEnd(10);
      const p95 = `${result.p95.toFixed(2)}ms`.padEnd(10);
      const p99 = `${result.p99.toFixed(2)}ms`.padEnd(10);
      const errors = `${result.errors}/${config.iterations}`;
      console.log(`${name}${mean}${p95}${p99}${errors}`);
    }
  });
  
  console.log('');
  
  // Overall assessment
  const validResults = results.filter(r => r);
  const avgMean = validResults.reduce((sum, r) => sum + r.mean, 0) / validResults.length;
  
  console.log('\n🎯 Overall Performance:');
  if (avgMean < 100) {
    console.log('   ✅ Excellent: Average response time < 100ms');
  } else if (avgMean < 500) {
    console.log('   ✅ Good: Average response time < 500ms');
  } else if (avgMean < 1000) {
    console.log('   ⚠️  Warning: Average response time < 1000ms');
  } else {
    console.log('   ❌ Poor: Average response time > 1000ms');
  }
  
  console.log('');
}

// Run benchmarks
runBenchmarks().catch(err => {
  console.error('❌ Benchmark failed:', err);
  process.exit(1);
});
