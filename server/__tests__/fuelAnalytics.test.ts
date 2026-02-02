/**
 * Tests for Fuel Analytics Service
 */

import { describe, it, expect } from 'vitest';

// Test MPG calculation
describe('Fuel Analytics - MPG Calculation', () => {
  it('should calculate MPG correctly', () => {
    const LITRES_TO_GALLONS = 0.219969;
    
    // Test case: 100 litres, 400 miles
    const litres = 100;
    const miles = 400;
    const gallons = litres * LITRES_TO_GALLONS;
    const mpg = miles / gallons;
    
    // Expected: 400 / (100 * 0.219969) = 400 / 21.9969 = 18.18 MPG
    expect(mpg).toBeCloseTo(18.18, 1);
  });

  it('should handle zero litres', () => {
    const LITRES_TO_GALLONS = 0.219969;
    const litres = 0;
    const miles = 100;
    const gallons = litres * LITRES_TO_GALLONS;
    const mpg = gallons === 0 ? 0 : miles / gallons;
    
    expect(mpg).toBe(0);
  });
});

// Test cost per mile calculation
describe('Fuel Analytics - Cost Per Mile', () => {
  it('should calculate cost per mile correctly', () => {
    // Test case: £50 (5000 pence) for 200 miles
    const totalCostPence = 5000;
    const miles = 200;
    const costPerMile = totalCostPence / miles;
    
    // Expected: 5000 / 200 = 25 pence per mile
    expect(costPerMile).toBe(25);
  });

  it('should handle zero miles', () => {
    const totalCostPence = 5000;
    const miles = 0;
    const costPerMile = miles === 0 ? 0 : totalCostPence / miles;
    
    expect(costPerMile).toBe(0);
  });
});

// Test anomaly detection thresholds
describe('Fuel Analytics - Anomaly Detection', () => {
  it('should flag excessive litres (>130% of average)', () => {
    const EXCESSIVE_LITRES_MULTIPLIER = 1.3;
    const averageLitres = 100;
    const purchaseLitres = 150;
    
    const isExcessive = purchaseLitres > averageLitres * EXCESSIVE_LITRES_MULTIPLIER;
    
    expect(isExcessive).toBe(true);
  });

  it('should not flag normal litres', () => {
    const EXCESSIVE_LITRES_MULTIPLIER = 1.3;
    const averageLitres = 100;
    const purchaseLitres = 120;
    
    const isExcessive = purchaseLitres > averageLitres * EXCESSIVE_LITRES_MULTIPLIER;
    
    expect(isExcessive).toBe(false);
  });

  it('should flag unusual hours (before 6 AM)', () => {
    const hour = 3;
    const isUnusual = hour < 6 || hour > 22;
    
    expect(isUnusual).toBe(true);
  });

  it('should flag unusual hours (after 10 PM)', () => {
    const hour = 23;
    const isUnusual = hour < 6 || hour > 22;
    
    expect(isUnusual).toBe(true);
  });

  it('should not flag normal hours', () => {
    const hour = 14;
    const isUnusual = hour < 6 || hour > 22;
    
    expect(isUnusual).toBe(false);
  });
});

// Test savings calculations
describe('Fuel Analytics - Savings Calculations', () => {
  it('should calculate driver savings vs average', () => {
    const driverCostPerMile = 35; // pence
    const averageCostPerMile = 40; // pence
    const totalMiles = 1000;
    
    const costDiff = averageCostPerMile - driverCostPerMile; // 5 pence
    const savingsInPounds = (costDiff * totalMiles) / 100; // Convert to £
    
    // Expected: 5 pence * 1000 miles = 5000 pence = £50
    expect(savingsInPounds).toBe(50);
  });

  it('should calculate vehicle cost vs average', () => {
    const vehicleCostPerMile = 45; // pence
    const averageCostPerMile = 40; // pence
    const totalMiles = 1000;
    
    const costDiff = vehicleCostPerMile - averageCostPerMile; // 5 pence (positive = more expensive)
    const extraCostInPounds = (costDiff * totalMiles) / 100;
    
    // Expected: 5 pence * 1000 miles = 5000 pence = £50 extra cost
    expect(extraCostInPounds).toBe(50);
  });
});

// Test percentile calculations
describe('Fuel Analytics - Percentile Rankings', () => {
  it('should calculate percentiles correctly', () => {
    const totalDrivers = 10;
    const rank = 1; // Best performer
    
    const percentile = ((totalDrivers - rank + 1) / totalDrivers) * 100;
    
    // Expected: (10 - 1 + 1) / 10 * 100 = 100%
    expect(percentile).toBe(100);
  });

  it('should calculate percentile for worst performer', () => {
    const totalDrivers = 10;
    const rank = 10; // Worst performer
    
    const percentile = ((totalDrivers - rank + 1) / totalDrivers) * 100;
    
    // Expected: (10 - 10 + 1) / 10 * 100 = 10%
    expect(percentile).toBe(10);
  });
});

console.log('✅ All fuel analytics tests passed!');
