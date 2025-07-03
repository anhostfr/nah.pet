import * as dns from 'node:dns';
import { promisify } from 'node:util';
import { nanoid } from 'nanoid';

const resolveTxt = promisify(dns.resolveTxt);

export interface DomainVerificationResult {
	success: boolean;
	error?: string;
}

export function generateVerificationToken(): string {
	return nanoid(48);
}

export async function verifyDomainOwnership(
	domain: string,
	verificationToken: string,
	method: 'dns' | 'file'
): Promise<DomainVerificationResult> {
	try {
		if (method === 'dns') {
			return await verifyDNSRecord(domain, verificationToken);
		} else {
			return await verifyFileMethod(domain, verificationToken);
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

async function verifyDNSRecord(domain: string, verificationToken: string): Promise<DomainVerificationResult> {
	try {
		console.log(domain)
		const txtRecords = await resolveTxt(domain);
		const flatRecords = txtRecords.flat();
		console.log(txtRecords)
		const hasVerificationRecord = flatRecords.some((record: string) => 
			record === verificationToken
		);

		if (hasVerificationRecord) {
			return { success: true };
		} else {
			return {
				success: false,
				error: `TXT record "${verificationToken}" not found for domain ${domain}`
			};
		}
	} catch (error) {
		return {
			success: false,
			error: `DNS lookup failed for ${domain}: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}

async function verifyFileMethod(domain: string, verificationToken: string): Promise<DomainVerificationResult> {
	try {
		
		const verificationUrl = `https://${domain}/.well-known/nah-pet-verification.txt`;
		
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000); 
		
		try {
			const response = await fetch(verificationUrl, {
				method: 'GET',
				headers: {
					'User-Agent': `Mozilla/5.0 (compatible; NahPet-Verify/${Math.random().toString(36).substring(2, 10)})`
				},
				signal: controller.signal
			});
			
			clearTimeout(timeoutId);

			if (!response.ok) {
				return {
					success: false,
					error: `HTTP ${response.status} ${response.statusText} when fetching ${verificationUrl}`
				};
			}

			
			const reader = response.body?.getReader();
			if (!reader) {
				return {
					success: false,
					error: 'Unable to read response body'
				};
			}

			let content = '';
			let totalLength = 0;
			const maxLength = 1024; 

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				totalLength += value.length;
				if (totalLength > maxLength) {
					return {
						success: false,
						error: 'Response too large (max 1KB)'
					};
				}

				content += new TextDecoder().decode(value);
			}

			const trimmedContent = content.trim();

			if (trimmedContent === verificationToken) {
				return { success: true };
			} else {
				return {
					success: false,
					error: `Verification token mismatch. Expected: "${verificationToken}", Found: "${trimmedContent}"`
				};
			}
		} finally {
			clearTimeout(timeoutId);
		}
	} catch (error) {
		return {
			success: false,
			error: `File verification failed for ${domain}: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}

export function validateDomainFormat(domain: string): boolean {
	
	if (domain.length > 253) return false;
	
	
	const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)*[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,11}$/;
	if (!domainRegex.test(domain)) return false;
	
	
	const labels = domain.split('.');
	return labels.every(label => label.length <= 63 && label.length > 0);
}

export function isDomainAllowed(domain: string): boolean {
	const blockedDomains = [
		'localhost',
		'nah.pet' 
	];
	
	const lowercaseDomain = domain.toLowerCase();
	
	
	if (blockedDomains.includes(lowercaseDomain)) {
		return false;
	}
	
	
	if (lowercaseDomain.endsWith('.nah.pet')) {
		return false;
	}
	
	
	if (isIPv4(lowercaseDomain)) {
		return false;
	}
	
	
	const privateDomains = [
		'.local', '.localhost', '.internal', '.private',
		'.test', '.invalid', '.example'
	];
	if (privateDomains.some(suffix => lowercaseDomain.endsWith(suffix))) {
		return false;
	}
	
	return true;
}

function isIPv4(domain: string): boolean {
	const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
	const match = domain.match(ipRegex);
	
	if (!match) return false;
	
	
	const octets = match.slice(1).map(Number);
	return octets.every(octet => octet >= 0 && octet <= 255);
}

export const SYSTEM_RESERVED_SLUGS = [
	'admin',
	'api',
	'app',
	'auth',
	'blog',
	'cdn',
	'dashboard',
	'dev',
	'docs',
	'ftp',
	'help',
	'login',
	'logout',
	'mail',
	'news',
	'register',
	'root',
	'shop',
	'ssl',
	'staging',
	'stats',
	'support',
	'test',
	'www',
	'domains',
	'pending',
	'settings',
	'profile',
	'account'
];

export function isSlugReserved(slug: string): boolean {
	return SYSTEM_RESERVED_SLUGS.includes(slug.toLowerCase());
}