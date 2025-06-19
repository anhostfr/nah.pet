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
		console.error('Erreur lors de la génération du QR code:', error);
		throw new Error('Impossible de générer le QR code');
	}
}
