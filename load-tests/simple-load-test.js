#!/usr/bin/env node

/**
 * Simple Load Testing Script using Autocannon
 * Quick and easy load testing for Titan Fleet API
 */

const autocannon = require('autocannon');

// Configuration
const config = {
  url: process.env.API_URL || 'http://localhost:3000',
  connections: 100, // Number of concurrent connections
  duration: 60, // Duration in seconds
  pipelining: 1, // Number of pipelined requests
  timeout: 10, // Request timeout in seconds
};

// Test scenarios
const scenarios = {
  health: {
    title: 'Health Check Endpoint',
    requests: [
      {
        method: 'GET',
        path: '/api/health',
      },
    ],
  },
  
  inspections: {
    title: 'Get Inspections',
    requests: [
      {
        method: 'GET',
        path: '/api/inspections',
        headers: {
          'Cookie': 'connect.sid=test-session-id',
        },
      },
    ],
  },
  
  vehicles: {
    title: 'Get Vehicles',
    requests: [
      {
        method: 'GET',
        path: '/api/vehicles',
        headers: {
          'Cookie': 'connect.sid=test-session-id',
        },
      },
    ],
  },
  
  defects: {
    title: 'Get Defects',
    requests: [
      {
        method: 'GET',
        path: '/api/defects',
        headers: {
          'Cookie': 'connect.sid=test-session-id',
        },
      },
    ],
  },
  
  mixed: {
    title: 'Mixed Workload',
    requests: [
      {
        method: 'GET',
        path: '/api/health',
      },
      {
        method: 'GET',
        path: '/api/vehicles',
        headers: {
          'Cookie': 'connect.sid=test-session-id',
        },
      },
      {
        method: 'GET',
        path: '/api/inspections',
        headers: {
          'Cookie': 'connect.sid=test-session-id',
        },
      },
      {
        method: 'GET',
        path: '/api/defects',
        headers: {
          'Cookie': 'connect.sid=test-session-id',
        },
      },
    ],
  },
};

/**
 * Run a load test scenario
 */
async function runTest(scenarioName) {
  const scenario = scenarios[scenarioName];
  
  if (!scenario) {
    console.error(`❌ Scenario "${scenarioName}" not found`);
    console.log('Available scenarios:', Object.keys(scenarios).join(', '));
    process.exit(1);
  }
  
  console.log(`\n🚀 Starting load test: ${scenario.title}`);
  console.log(`   URL: ${config.url}`);
  console.log(`   Connections: ${config.connections}`);
  console.log(`   Duration: ${config.duration}s`);
  console.log('');
  
  const instance = autocannon({
    ...config,
    requests: scenario.requests,
  }, (err, result) => {
    if (err) {
      console.error('❌ Load test failed:', err);
      process.exit(1);
    }
    
    console.log('\n📊 Load Test Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Requests:        ${result.requests.total}`);
    console.log(`   Duration:        ${result.duration}s`);
    console.log(`   Throughput:      ${result.throughput.mean} req/sec`);
    console.log(`   Latency (avg):   ${result.latency.mean}ms`);
    console.log(`   Latency (p50):   ${result.latency.p50}ms`);
    console.log(`   Latency (p95):   ${result.latency.p95}ms`);
    console.log(`   Latency (p99):   ${result.latency.p99}ms`);
    console.log(`   Errors:          ${result.errors}`);
    console.log(`   Timeouts:        ${result.timeouts}`);
    console.log(`   Non-2xx:         ${result.non2xx}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Performance assessment
    console.log('\n🎯 Performance Assessment:');
    if (result.latency.mean < 100) {
      console.log('   ✅ Excellent: Average latency < 100ms');
    } else if (result.latency.mean < 500) {
      console.log('   ✅ Good: Average latency < 500ms');
    } else if (result.latency.mean < 1000) {
      console.log('   ⚠️  Warning: Average latency < 1000ms');
    } else {
      console.log('   ❌ Poor: Average latency > 1000ms');
    }
    
    if (result.errors === 0 && result.timeouts === 0) {
      console.log('   ✅ No errors or timeouts');
    } else {
      console.log(`   ❌ ${result.errors} errors, ${result.timeouts} timeouts`);
    }
    
    if (result.throughput.mean > 1000) {
      console.log('   ✅ High throughput: > 1000 req/sec');
    } else if (result.throughput.mean > 500) {
      console.log('   ✅ Good throughput: > 500 req/sec');
    } else {
      console.log('   ⚠️  Low throughput: < 500 req/sec');
    }
    
    console.log('');
  });
  
  // Track progress
  autocannon.track(instance, {
    renderProgressBar: true,
    renderResultsTable: false,
  });
}

/**
 * Run all scenarios
 */
async function runAllTests() {
  console.log('🧪 Running all load test scenarios...\n');
  
  for (const scenarioName of Object.keys(scenarios)) {
    await runTest(scenarioName);
    
    // Wait 5 seconds between tests
    if (scenarioName !== Object.keys(scenarios)[Object.keys(scenarios).length - 1]) {
      console.log('\n⏳ Waiting 5 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('\n✅ All load tests completed!\n');
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

if (command === 'all') {
  runAllTests().catch(err => {
    console.error('❌ Error running tests:', err);
    process.exit(1);
  });
} else if (command && scenarios[command]) {
  runTest(command).catch(err => {
    console.error('❌ Error running test:', err);
    process.exit(1);
  });
} else {
  console.log('Titan Fleet Load Testing Tool\n');
  console.log('Usage:');
  console.log('  node simple-load-test.js <scenario>');
  console.log('  node simple-load-test.js all\n');
  console.log('Available scenarios:');
  Object.entries(scenarios).forEach(([name, scenario]) => {
    console.log(`  ${name.padEnd(15)} - ${scenario.title}`);
  });
  console.log('');
  process.exit(0);
}
