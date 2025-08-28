import QRCode from 'qrcode';

export async function generateQRCode(url: string): Promise<string> {
	try {
		const qrCodeDataURL = await QRCode.toDataURL(url, {
			errorCorrectionLevel: 'M',
			type: 'image/png',
			margin: 1,
			color: {
				dark: '#000000',
				light: '#FFFFFF'
			}
		});

		return qrCodeDataURL;
	} catch (error) {
		console.error('Error while generating:', error);
		throw new Error('Impossible to generate QR code');
	}
}
