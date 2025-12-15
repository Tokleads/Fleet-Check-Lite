// DVSA (Driver and Vehicle Standards Agency) API Integration
// Uses OAuth2 client credentials flow to access the Trade API

interface DVSAToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface MOTTest {
  completedDate: string;
  testResult: string;
  expiryDate: string;
  odometerValue: string;
  odometerUnit: string;
  motTestNumber: string;
  defects?: {
    text: string;
    type: string;
    dangerous: boolean;
  }[];
}

export interface DVSAVehicle {
  registration: string;
  make: string;
  model: string;
  primaryColour: string;
  fuelType: string;
  registrationDate: string;
  manufactureDate: string;
  engineSize: string;
  motTests: MOTTest[];
}

class DVSAService {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  private get clientId(): string {
    return process.env.DVSA_CLIENT_ID || "";
  }

  private get clientSecret(): string {
    return process.env.DVSA_CLIENT_SECRET || "";
  }

  private get apiKey(): string {
    return process.env.DVSA_API_KEY || "";
  }

  private get tokenUrl(): string {
    return process.env.DVSA_TOKEN_URL || "";
  }

  private get scopeUrl(): string {
    return process.env.DVSA_SCOPE_URL || "";
  }

  private isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.apiKey && this.tokenUrl);
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    if (!this.isConfigured()) {
      throw new Error("DVSA API is not configured");
    }

    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: this.scopeUrl,
    });

    const response = await fetch(this.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DVSA token error:", errorText);
      throw new Error(`Failed to get DVSA access token: ${response.status}`);
    }

    const data: DVSAToken = await response.json();
    this.token = data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000);

    return this.token;
  }

  async getVehicleByRegistration(registration: string): Promise<DVSAVehicle | null> {
    if (!this.isConfigured()) {
      console.warn("DVSA API not configured, skipping lookup");
      return null;
    }

    try {
      const token = await this.getAccessToken();
      const normalizedReg = registration.replace(/\s/g, "").toUpperCase();

      const response = await fetch(
        `https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests?registration=${normalizedReg}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": this.apiKey,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DVSA API error:", errorText);
        throw new Error(`DVSA API error: ${response.status}`);
      }

      const vehicles: DVSAVehicle[] = await response.json();
      return vehicles.length > 0 ? vehicles[0] : null;
    } catch (error) {
      console.error("DVSA lookup failed:", error);
      return null;
    }
  }

  async getMotStatus(registration: string): Promise<{
    valid: boolean;
    expiryDate: string | null;
    lastTestDate: string | null;
    lastTestResult: string | null;
    lastOdometer: number | null;
  } | null> {
    const vehicle = await this.getVehicleByRegistration(registration);
    if (!vehicle || !vehicle.motTests || vehicle.motTests.length === 0) {
      return null;
    }

    const latestTest = vehicle.motTests[0];
    return {
      valid: latestTest.testResult === "PASSED",
      expiryDate: latestTest.expiryDate || null,
      lastTestDate: latestTest.completedDate || null,
      lastTestResult: latestTest.testResult || null,
      lastOdometer: latestTest.odometerValue ? parseInt(latestTest.odometerValue, 10) : null,
    };
  }
}

export const dvsaService = new DVSAService();
