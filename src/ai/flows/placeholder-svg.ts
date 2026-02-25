
'use server';

function toBase64(str: string) {
    if (typeof window === 'undefined') {
        return Buffer.from(str).toString('base64');
    } else {
        return window.btoa(str);
    }
}

/**
 * Generates a professional SVG placeholder for logos and flyers when AI quota is exceeded.
 */
export async function createPlaceholderSvg(text: string, subtitle?: string, contact?: string): Promise<string> {
    const bgColor = '#1E1B3A'; // dark purple
    const textColor = '#E0E7FF'; // light purple/white
    const accentColor = '#8B5CF6'; // primary purple

    const titleSize = 36;
    const subtitleSize = 18;
    const contactSize = 14;

    let svgContent = `
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="${bgColor}"/>
        <rect x="25" y="25" width="462" height="462" rx="20" fill="none" stroke="${accentColor}" stroke-width="4"/>
    `;
    
    if (subtitle && contact) {
         // Flyer layout
         svgContent += `
         <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="${titleSize}" font-weight="bold" fill="${textColor}">
             ${text}
         </text>
         <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="${subtitleSize}" fill="${textColor}">
             ${subtitle}
         </text>
         <text x="50%" y="90%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="${contactSize}" fill="${accentColor}">
             ${contact}
         </text>
         `;
    } else {
        // Logo layout
        const initials = text.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        svgContent += `
         <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="128" font-weight="bold" fill="${accentColor}">
             ${initials}
         </text>
         <text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="32" fill="${textColor}">
             ${text}
         </text>
        `;
    }

    svgContent += `</svg>`;

    return `data:image/svg+xml;base64,${toBase64(svgContent)}`;
}
