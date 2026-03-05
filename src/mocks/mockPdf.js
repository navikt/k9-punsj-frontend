const padOffset = (value) => String(value).padStart(10, '0');

const sanitizePdfText = (text) => String(text || '').replace(/[()\\]/g, ' ');

const buildMockPdf = (text) => {
    const streamText = `BT /F1 18 Tf 48 780 Td (${sanitizePdfText(text)}) Tj ET\n`;
    const objects = [
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
        `4 0 obj\n<< /Length ${streamText.length} >>\nstream\n${streamText}endstream\nendobj\n`,
        '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((obj) => {
        offsets.push(pdf.length);
        pdf += obj;
    });

    const xrefOffset = pdf.length;
    pdf += 'xref\n0 6\n0000000000 65535 f \n';
    for (let i = 1; i <= 5; i += 1) {
        pdf += `${padOffset(offsets[i])} 00000 n \n`;
    }
    pdf += 'trailer\n<< /Size 6 /Root 1 0 R >>\n';
    pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

    return pdf;
};

export const createMockPdfBytes = (text = 'Mock PDF fra MSW') => new TextEncoder().encode(buildMockPdf(text));
