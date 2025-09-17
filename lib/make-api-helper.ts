// Helper for Make.com API calls with automatic region detection
export async function makeApiRequest(
  endpoint: string,
  apiToken: string,
  organizationId: string,
  options: RequestInit = {}
): Promise<Response> {
  // Prioritize us2 region based on user's zone
  const regions = ['us2', 'us1', 'eu1', 'eu2'];

  // Cache the successful region in memory for subsequent requests
  const cachedRegion = (global as any).__makeApiRegion;

  if (cachedRegion) {
    try {
      const url = `https://${cachedRegion}.make.com/api/v2${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.ok) {
        return response;
      }

      // If cached region fails, clear cache and try all regions
      delete (global as any).__makeApiRegion;
    } catch (error) {
      console.log(`Cached region ${cachedRegion} failed, trying all regions...`);
      delete (global as any).__makeApiRegion;
    }
  }

  let lastError: any;

  for (const region of regions) {
    const url = `https://${region}.make.com/api/v2${endpoint}`;
    console.log(`Trying Make API region ${region}: ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log(`Region ${region} response status:`, response.status, response.statusText);

      if (response.ok) {
        // Cache the successful region
        (global as any).__makeApiRegion = region;
        console.log(`Successfully connected to Make API region: ${region}`);
        return response;
      } else if (response.status === 404) {
        // Organization not found in this region, try next
        console.log(`Organization not found in region ${region}, trying next...`);
        continue;
      } else if (response.status === 401) {
        // Authentication error
        const errorText = await response.text();
        console.error(`Authentication failed in region ${region}:`, errorText);
        console.error(`API Token (first 10 chars): ${apiToken.substring(0, 10)}...`);
        console.error(`Organization ID: ${organizationId}`);
        console.error(`Full URL attempted: ${url}`);
        lastError = {
          region,
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          type: 'authentication_error'
        };
      } else {
        // Other error
        const errorText = await response.text();
        lastError = {
          region,
          status: response.status,
          statusText: response.statusText,
          body: errorText
        };
      }
    } catch (error) {
      console.log(`Failed to connect to region ${region}:`, error instanceof Error ? error.message : 'Unknown error');
      lastError = {
        region,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // If we get here, all regions failed
  const error = new Error(`Failed to connect to any Make API region. Last error: ${JSON.stringify(lastError)}`);
  (error as any).lastError = lastError;
  throw error;
}