import axios from 'axios';

class URLScanner {
  constructor() {
    this.virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY;
    this.googleSafeBrowsingKey = process.env.GOOGLE_SAFE_BROWSING_KEY;
  }

  // Extract URLs from text
  extractURLs(text) {
    if (!text) return [];

    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urls = text.match(urlRegex) || [];

    // Remove duplicates and invalid URLs
    return [...new Set(urls)].filter((url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
  }

  // Main scan method
  async scanURL(url) {
    const results = {
      url,
      isMalicious: false,
      riskLevel: 'low',
      overallRisk: 'low', // Combined risk assessment
      threatLevel: 'none', // none, warning, danger
      threats: [],
      sources: [],
      details: {},
      warnings: [], // Pattern-based warnings
    };

    try {
      // Try VirusTotal first (most comprehensive)
      if (this.virusTotalApiKey) {
        const vtResult = await this.checkVirusTotal(url);
        if (vtResult) {
          results.details.virustotal = vtResult;
          if (vtResult.isMalicious) {
            results.isMalicious = true;
            results.riskLevel = vtResult.riskLevel;
            results.threatLevel = 'danger';
            results.threats = vtResult.threats;
            results.sources.push('VirusTotal');
          }
        }
      }

      // Try Google Safe Browsing
      if (this.googleSafeBrowsingKey && !results.isMalicious) {
        const gsResult = await this.checkGoogleSafeBrowsing(url);
        if (gsResult) {
          results.details.googlesafebrowsing = gsResult;
          if (gsResult.isMalicious) {
            results.isMalicious = true;
            results.riskLevel = gsResult.riskLevel;
            results.threatLevel = 'danger';
            results.threats = gsResult.threats;
            results.sources.push('Google Safe Browsing');
          }
        }
      }

      // Basic checks (always available)
      const basicResult = this.performBasicChecks(url);
      if (basicResult.suspicious) {
        results.details.basicChecks = basicResult;
        results.warnings = basicResult.warnings;

        if (!results.isMalicious) {
          // If not in threat database but has multiple suspicious patterns, mark as malicious
          if (basicResult.warnings.length >= 3) {
            results.isMalicious = true;
            results.riskLevel = 'high';
            results.overallRisk = 'high';
            results.threatLevel = 'danger';
            results.threats = [...new Set([...results.threats, ...basicResult.warnings])];
          } else {
            // If fewer patterns, just mark as warning
            results.riskLevel = 'medium';
            results.overallRisk = 'medium';
            results.threatLevel = 'warning';
            results.threats = [...new Set([...results.threats, ...basicResult.warnings])];
          }
        }
      } else if (!results.isMalicious) {
        results.overallRisk = 'low';
        results.threatLevel = 'none';
      }

      // If malicious in databases, override overall risk
      if (results.isMalicious) {
        results.overallRisk = results.riskLevel;
        results.threatLevel = 'danger';
      }

      return results;
    } catch (error) {
      console.error('Error scanning URL:', error.message);
      return {
        ...results,
        error: error.message,
      };
    }
  }

  // Check with VirusTotal
  async checkVirusTotal(url) {
    try {
      const response = await axios.get('https://www.virustotal.com/api/v3/urls', {
        params: { url },
        headers: {
          'x-apikey': this.virusTotalApiKey,
        },
        timeout: 5000,
      });

      if (response.data?.data) {
        const attributes = response.data.data.attributes;
        const stats = attributes.last_analysis_stats;

        // Count malicious detections
        const maliciousCount = stats.malicious + stats.suspicious;

        if (maliciousCount > 0) {
          return {
            isMalicious: true,
            riskLevel: maliciousCount > 5 ? 'high' : 'medium',
            threats: attributes.last_analysis_results
              ? Object.entries(attributes.last_analysis_results)
                  .filter(([_, result]) => result.category !== 'undetected')
                  .map(([vendor, result]) => `${vendor}: ${result.category}`)
                  .slice(0, 5)
              : [],
            score: maliciousCount,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('VirusTotal check failed:', error.message);
      return null;
    }
  }

  // Check with Google Safe Browsing
  async checkGoogleSafeBrowsing(url) {
    try {
      const response = await axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${this.googleSafeBrowsingKey}`,
        {
          client: { clientId: 'nexusguard', clientVersion: '1.0' },
          threatInfo: {
            threatTypes: [
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        },
        { timeout: 5000 }
      );

      if (response.data?.matches && response.data.matches.length > 0) {
        return {
          isMalicious: true,
          riskLevel: 'high',
          threats: response.data.matches.map((m) => m.threatType),
        };
      }

      return null;
    } catch (error) {
      console.error('Google Safe Browsing check failed:', error.message);
      return null;
    }
  }

  // Basic checks (no API required)
  performBasicChecks(url) {
    const warnings = [];
    let suspicious = false;

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;

      // Check for suspicious patterns
      if (hostname.includes('bit.ly') || hostname.includes('tinyurl')) {
        warnings.push('Shortened URL - destination unclear');
        suspicious = true;
      }

      if (hostname.length > 50) {
        warnings.push('Unusually long domain name');
        suspicious = true;
      }

      if (hostname.split('.').length > 4) {
        warnings.push('Excessive subdomains');
        suspicious = true;
      }

      // Check for common phishing patterns (in both path and hostname)
      const fullUrl = pathname + hostname;
      if (
        fullUrl.includes('login') ||
        fullUrl.includes('signin') ||
        fullUrl.includes('verify') ||
        fullUrl.includes('confirm') ||
        fullUrl.includes('account') ||
        fullUrl.includes('update') ||
        fullUrl.includes('confirm')
      ) {
        warnings.push('Contains login/verification keywords');
        suspicious = true;
      }

      // Check for suspicious TLDs
      const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf'];
      if (suspiciousTLDs.some((tld) => hostname.endsWith(tld))) {
        warnings.push('Suspicious top-level domain');
        suspicious = true;
      }

      // Check for homograph attacks (similar looking domains)
      // Check for 0 (zero), 1 (one), l (lowercase L), O (uppercase O) which look like other characters
      if (hostname.includes('0') || hostname.includes('1') || hostname.includes('l') || hostname.includes('O')) {
        warnings.push('Domain may use lookalike characters');
        suspicious = true;
      }

      return { suspicious, warnings };
    } catch (error) {
      return { suspicious: false, warnings: [] };
    }
  }

  // Scan multiple URLs
  async scanMultipleURLs(urls) {
    const results = await Promise.all(urls.map((url) => this.scanURL(url)));
    return results;
  }
}

export default new URLScanner();
