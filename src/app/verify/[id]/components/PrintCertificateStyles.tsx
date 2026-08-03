import React from "react";

export function PrintCertificateStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @page { size: A4 landscape; margin: 0; }
      @media print {
        *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body, html { margin: 0 !important; padding: 0 !important; background: #ffffff !important; width: 297mm !important; overflow: hidden !important; }
        .verify-page-wrapper, .cert-outer-wrapper { margin: 0 !important; padding: 0 !important; min-height: unset !important; background: #ffffff !important; width: 297mm !important; max-width: 297mm !important; overflow: hidden !important; }
        .no-print { display: none !important; }
        .certificate-print-container { display: block !important; width: 297mm !important; margin: 0 !important; padding: 0 !important; gap: 0 !important; background: none !important; box-shadow: none !important; }
        .certificate-page-1 { display: block !important; width: 297mm !important; height: 210mm !important; max-height: 210mm !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; aspect-ratio: unset !important; page-break-after: always !important; break-after: page !important; }
        .certificate-page-2 { width: 297mm !important; height: 210mm !important; max-height: 210mm !important; overflow: hidden !important; margin: 0 !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; aspect-ratio: unset !important; page-break-before: always !important; break-before: page !important; page-break-after: avoid !important; background-color: #fdfaf6 !important; color: #1d1d1f !important; box-sizing: border-box !important; padding: 0 !important; display: block !important; }
        .certificate-page-2 .cert-back-inner-wrapper { display: flex !important; flex-direction: column !important; justify-content: space-between !important; width: 100% !important; height: 210mm !important; padding: 8mm 12mm !important; box-sizing: border-box !important; overflow: hidden !important; }
        .cert-header { padding-bottom: 3px !important; margin-bottom: 0 !important; }
        .cert-metadata-grid { margin: 4px 0 !important; gap: 1rem !important; }
        .cert-footer-grid { margin-top: 4px !important; gap: 1rem !important; }
        .tutor-review-box { padding: 4px 8px !important; }
        .cert-sign-off-date { margin-bottom: 16px !important; }
        .cert-student-name-text { font-size: 15.4mm !important; letter-spacing: 0.45mm !important; }
        .cert-no-overlay { font-size: 5.3mm !important; top: 29.0% !important; left: 50% !important; transform: translateX(-50%) !important; }
        .cert-course-overlay { font-size: 6.2mm !important; top: 61.5% !important; }
        .cert-date-overlay { font-size: 5.9mm !important; top: 66.0% !important; }
        .cert-tutor-name-overlay { font-size: 5.3mm !important; top: 79.5% !important; left: 29.5% !important; }
        .cert-tutor-title-overlay { font-size: 3.2mm !important; top: 83.2% !important; left: 29.5% !important; }
        .cert-grade-table th, .cert-grade-table td { padding: 1mm 2mm !important; font-size: 0.65rem !important; }
        .cert-qr-overlay { bottom: 9% !important; left: 78.5% !important; width: 65.3mm !important; }
        .cert-qr-box { padding: 1.8mm !important; border-width: 0.45mm !important; border-radius: 2.4mm !important; width: 29.7mm !important; height: 29.7mm !important; }
        .cert-qr-line { border-top-width: 0.45mm !important; width: 41.5mm !important; margin: 1.2mm auto !important; }
        .cert-qr-label-title { font-size: 3.4mm !important; letter-spacing: 0.3mm !important; }
        .cert-qr-label-subtitle { font-size: 2.7mm !important; }
        .cert-back-inner-frame { top: 4mm !important; left: 4mm !important; right: 4mm !important; bottom: 4mm !important; border-width: 0.74mm !important; }
        .cert-back-inner-gold-line { top: 6mm !important; left: 6mm !important; right: 6mm !important; bottom: 6mm !important; border-width: 0.3mm !important; }
      }
    `}} />
  );
}
