# DVLA API Test Environment

## 🧪 **Test Environment Details**

### **Test API Endpoint:**
```
https://uat.driver-vehicle-licensing.api.gov.uk/full-driver-enquiry/v1/driving-licences/retrieve
```

### **Production API Endpoint:**
```
https://driver-vehicle-licensing.api.gov.uk/full-driver-enquiry/v1/driving-licences/retrieve
```

---

## 📋 **Test Data Available**

The DVLA provides predefined test license numbers that cover various scenarios:

### **Example Test License Numbers:**

1. **Valid License with Endorsements:**
   - License: `TCAEU610267NO9EK`
   - Returns: Valid full license with SP30 endorsement (3 penalty points)

2. **Not Found (404 Error):**
   - License: `JONES712249IP6VV`
   - Returns: 404 - Driver not found

3. **Additional Test Data:**
   - Test data is provided on request from DVLA
   - Covers many license statuses
   - Includes CPC and tachograph card data
   - Contact: `serviceenquiries@dvla.gov.uk`

---

## 🔐 **Authentication Requirements**

### **Required Headers:**
```bash
Content-Type: application/json
Accept: application/json
Authorization: Bearer {JWT_TOKEN}
X-Api-Key: {YOUR_API_KEY}
```

### **Authentication Flow:**
1. Use DVLA Authentication API to get JWT token
2. Include JWT in Authorization header
3. Include API Key in X-Api-Key header
4. Make POST request to endpoint

---

## 📝 **Example Test Request**

```bash
curl -X POST \
  https://uat.driver-vehicle-licensing.api.gov.uk/full-driver-enquiry/v1/driving-licences/retrieve \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {JWT_TOKEN}' \
  -H 'X-Api-Key: {YOUR_API_KEY}' \
  -d '{
    "drivingLicenceNumber": "TCAEU610267NO9EK",
    "includeCPC": false,
    "includeTacho": false,
    "acceptPartialResponse": "false"
  }'
```

---

## 📊 **Example Test Response**

```json
{
  "driver": {
    "drivingLicenceNumber": "TCAEU610267NO9EK",
    "firstNames": "NPBPG OYOT",
    "lastName": "TCAEUCJ",
    "gender": "Male",
    "dateOfBirth": "1967-10-26",
    "address": {
      "unstructuredAddress": {
        "line1": "78 A TEST DATA DO NOT DELIVER",
        "line5": "GREAT YARMOUTH",
        "postcode": "NR30 4BH"
      }
    }
  },
  "licence": {
    "type": "Full",
    "status": "Valid"
  },
  "entitlement": [
    {
      "categoryCode": "A",
      "categoryLegalLiteral": "A motorcycle...",
      "categoryType": "Full",
      "fromDate": "2013-01-19",
      "expiryDate": "2037-10-25",
      "restrictions": [
        {
          "restrictionCode": "79(03)",
          "restrictionLiteral": "Restricted to tricycles"
        }
      ]
    }
  ],
  "endorsements": [
    {
      "offenceCode": "SP30",
      "offenceLiteral": "Exceeding statutory speed limit on a public road",
      "offenceDate": "2018-04-28",
      "penaltyPoints": 3,
      "penaltyPointsExpiryDate": "2022-04-28"
    }
  ],
  "token": {
    "validFromDate": "1999-04-11",
    "validToDate": "2037-10-25",
    "issueNumber": "69"
  }
}
```

---

## ⚠️ **Rate Limits**

### **Throttling:**
- Individual client limits based on usage plan
- Overall service limit for all clients
- Returns HTTP 429 (Too Many Requests) when exceeded

### **Best Practices:**
- Implement exponential backoff for 429 errors
- Cache license data to reduce API calls
- Only check licenses when necessary (not on every page load)

---

## 🎯 **Integration Strategy**

### **Phase 1: Get API Access**
1. Register at https://developer-portal.driver-vehicle-licensing.api.gov.uk/
2. Apply for "Access to Driver Data" API
3. Wait for approval (5-10 business days)
4. Receive API key and credentials

### **Phase 2: Test Integration**
1. Use UAT endpoint for testing
2. Test with provided license numbers
3. Handle all response scenarios (success, 404, 429, 503)
4. Verify data parsing and storage

### **Phase 3: Production Deployment**
1. Switch to production endpoint
2. Use real license numbers
3. Monitor API usage and costs
4. Implement caching and rate limiting

---

## 📧 **DVLA Support Contacts**

**New Customer Enquiries:**
- Email: `serviceenquiries@dvla.gov.uk`
- Use for: Initial API access requests, test data requests

**Current Customers:**
- Email: `ADDEnquiries@dvla.gov.uk`
- Use for: Technical support, API issues, production problems

---

## 🚀 **Next Steps for Titan Fleet**

### **Option 1: Apply for API Access NOW**
1. Email `serviceenquiries@dvla.gov.uk`
2. Request:
   - Access to "Access to Driver Data" API
   - Test data for UAT environment
   - Pricing information
3. Provide:
   - Business name: Titan Fleet
   - Use case: Fleet management driver license verification
   - Expected volume: 50-100 checks per day

### **Option 2: Build Mock Integration**
1. Create database schema for license data
2. Build UI for license checking
3. Use mock data for testing
4. Replace with real API when approved

### **Option 3: Wait and Build Other Features**
1. Build Service Intervals
2. Build Countdown Timers
3. Build Report System
4. Apply for DVLA when ready to launch

---

## 💡 **Recommended Approach**

**Do both Option 1 and Option 2 in parallel:**

1. **Today:** Apply for DVLA API access (email sent)
2. **This week:** Build mock license checking feature with UI
3. **While waiting:** Build other features (Service Intervals, Reports)
4. **When approved:** Replace mock with real DVLA API
5. **Launch:** Full license checking feature ready

**Timeline:**
- Week 1: Apply + Build mock (2 days)
- Week 2-3: Build other features while waiting for approval
- Week 3-4: DVLA approval received
- Week 4: Integrate real API (1 day)
- Week 4: Launch with license checking ✅

---

**Would you like me to help you draft the email to DVLA to request API access?**
