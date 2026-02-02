import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Document, DocumentSummaryDto } from 'modules/documents';
import { renderTemplate } from '../components/document-report-drawer/utils/template-renderer';
import { transformTemplateData } from '../components/document-report-drawer/utils/transform-template-data';
import templateHtml from '../components/document-report-drawer/templates/purchase-contract-template.html?raw';

/**
 * Generates a PDF file from HTML template for Purchase and Sale Agreements
 * @param doc - The document object
 * @param summary - The document summary/report data
 * @returns Promise that resolves to the PDF blob
 */
async function generateTemplatePDF(_doc: Document, summary: DocumentSummaryDto): Promise<Blob> {
  try {
    // Extract JSON object from summaryContent (may have surrounding text)
    const jsonMatch = summary.summaryContent?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in summary content');
    }

    // Parse JSON from extracted content
    const parsedData = JSON.parse(jsonMatch[0]);

    // Transform data to match template structure
    const templateData = transformTemplateData(parsedData);

    // Render template with transformed data
    const renderedHtml = renderTemplate(templateHtml, templateData);

    // Create a temporary container to render the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = renderedHtml;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px'; // Match the drawer width
    tempDiv.style.backgroundColor = '#ffffff';
    document.body.appendChild(tempDiv);

    // Wait for images and fonts to load
    const images = tempDiv.getElementsByTagName('img');
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });
    await Promise.all(imagePromises);

    // Wait a bit for styles to apply
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Convert HTML to canvas using html2canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempDiv.scrollHeight,
    });

    // Cleanup
    document.body.removeChild(tempDiv);

    // Create PDF from canvas
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  } catch (error) {
    console.error('Failed to generate template PDF:', error);
    throw error;
  }
}

/**
 * Generates a PDF file from document report data
 * @param doc - The document object
 * @param summary - The document summary/report data
 * @returns Promise that resolves to the PDF blob
 */
export const generateDocumentReportPDF = async (doc: Document, summary: DocumentSummaryDto): Promise<Blob> => {
  // Check if this is a Purchase and Sale Agreement that should use the template
  const useTemplate = summary?.documentType === 'Purchase and Sale Agreements';

  if (useTemplate) {
    // Generate PDF from HTML template
    return generateTemplatePDF(doc, summary);
  }

  // Use text-based PDF generation for other document types
  return generateTextBasedPDF(doc, summary);
}

/**
 * Generates a text-based PDF file from document report data (for non-template documents)
 * @param doc - The document object
 * @param summary - The document summary/report data
 * @returns The PDF blob
 */
function generateTextBasedPDF(doc: Document, summary: DocumentSummaryDto): Blob {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Helper function to draw horizontal line (double equals or single dashes)
  const drawLine = (isDouble: boolean = true, lineHeight = 6) => {
    checkPageBreak(lineHeight + 2);
    pdf.setDrawColor(128, 128, 128); // Grey color
    pdf.setLineWidth(isDouble ? 0.8 : 0.5);

    const lineY = yPosition;
    const lineXStart = margin;
    const lineXEnd = pageWidth - margin;

    // Draw line(s)
    if (isDouble) {
      // Double line: draw two lines close together
      pdf.line(lineXStart, lineY, lineXEnd, lineY);
      pdf.line(lineXStart, lineY + 1.5, lineXEnd, lineY + 1.5);
      yPosition += lineHeight;
    } else {
      // Single line
      pdf.line(lineXStart, lineY, lineXEnd, lineY);
      yPosition += lineHeight;
    }
  };

  // Helper function to sanitize text for PDF rendering
  // Replaces Unicode characters with ASCII equivalents to avoid rendering issues
  const sanitizeText = (text: string): string => {
    if (!text) return '';

    // Replace common Unicode characters with ASCII equivalents
    const sanitized = text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .replace(/[""]/g, '"') // Replace smart quotes with regular quotes
      .replace(/['']/g, "'") // Replace smart apostrophes with regular apostrophes
      .replace(/[—–]/g, '-') // Replace em/en dashes with hyphens
      .replace(/…/g, '...') // Replace ellipsis with three dots
      .replace(/[•·]/g, '*') // Replace bullet points with asterisks
      .replace(/[©®™]/g, '') // Remove copyright/trademark symbols
      .replace(/[^\x20-\x7E\n\r\t]/g, (char) => {
        // For other Unicode characters, try to find ASCII equivalent or remove
        const charCode = char.charCodeAt(0);
        // Keep common accented characters that might be in names/addresses
        if (charCode >= 0x00a0 && charCode <= 0x024f) {
          // Latin Extended-A and B - try to normalize
          return char.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        // For other Unicode, replace with space or remove
        return ' ';
      })
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return sanitized;
  };

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, fontSize: number, isBold = false, spacing = 5) => {
    if (!text || text.trim() === '') return;

    const sanitized = sanitizeText(text);
    if (!sanitized || sanitized.trim() === '') return;

    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

    try {
      // Ensure text is properly encoded as UTF-8 string
      const textToRender = String(sanitized);
      const lines = pdf.splitTextToSize(textToRender, maxWidth);

      lines.forEach((line: string) => {
        if (line && line.trim()) {
          // Double-check line doesn't contain problematic characters
          const cleanLine = line.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
          if (cleanLine) {
            checkPageBreak(fontSize * 0.5);
            pdf.text(cleanLine, margin, yPosition);
            yPosition += fontSize * 0.5;
          }
        }
      });
      yPosition += spacing; // Add spacing after text block
    } catch (error) {
      console.error('Error rendering text in PDF:', error, { text: sanitized.substring(0, 50) });
      // Fallback: render only ASCII characters
      const asciiOnly = sanitized.replace(/[^\x20-\x7E]/g, ' ').trim();
      if (asciiOnly) {
        checkPageBreak(fontSize * 0.5);
        pdf.text(asciiOnly.substring(0, Math.min(100, asciiOnly.length)), margin, yPosition);
        yPosition += fontSize * 0.5 + spacing;
      }
    }
  };

  // Helper function to add centered text
  const addCenteredText = (text: string, fontSize: number, isBold = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    const textWidth = pdf.getTextWidth(text);
    const xPosition = (pageWidth - textWidth) / 2;
    checkPageBreak(fontSize * 0.5);
    pdf.text(text, xPosition, yPosition);
    yPosition += fontSize * 0.5 + 5;
  };

  // Top border lines (double equals)
  drawLine(true, 6);
  yPosition += 3;

  // Title
  addCenteredText('TRANSACTION SUMMARY REPORT', 16, true);
  addCenteredText('Prepared By: Contre', 10);
  yPosition += 5;

  // Bottom border lines (double equals)
  drawLine(true, 6);
  yPosition += 8;

  // Document Information Section
  if (doc.documentName) {
    addWrappedText(`PROPERTY:       ${doc.documentName}`, 10, false, 2);
  }
  if (doc.documentType) {
    addWrappedText(`DOCUMENT:       ${doc.documentType}`, 10, false, 2);
  }
  if (doc.createdAt) {
    const uploadDate = new Date(doc.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const analyzedDate = summary.generatedAt
      ? new Date(summary.generatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
    addWrappedText(`DATE:           ${uploadDate}  |  ANALYZED: ${analyzedDate}`, 10, false, 2);
  }
  yPosition += 5;

  // Section separator (single dashes)
  drawLine(false, 6);
  yPosition += 8;

  // Summary Section Header
  addWrappedText('SUMMARY', 12, true, 2);
  drawLine(false, 6);
  yPosition += 8;

  // Summary Content
  const content = summary.summaryContent || 'No report content available.';
  if (!content || content.trim() === '') {
    addWrappedText('No report content available.', 10, false, 3);
  } else {
    // Split content by lines and process
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        yPosition += 3; // Add spacing for empty lines
        continue;
      }

      // Check if this is a section header (all caps, short, no punctuation except special chars)
      const isSectionHeader =
        line.match(/^[A-Z\s&]+$/) && line.length < 60 && !line.includes('.') && !line.match(/^\d/) && line.length > 3;

      if (isSectionHeader) {
        // It's a section header - add spacing before, format as header, add line
        yPosition += 5;
        addWrappedText(line, 11, true, 2);
        drawLine(false, 6);
        yPosition += 8;
      } else {
        // Regular content - check if it's a bullet point or special formatting
        if (line.startsWith('•') || line.startsWith('-') || line.match(/^\s*[•-]\s/)) {
          // Bullet point - add slight indent
          addWrappedText(line, 10, false, 2);
        } else if (line.match(/^[A-Z][A-Z\s]+:/)) {
          // Label: Value format (like "PROPERTY: ...")
          addWrappedText(line, 10, false, 2);
        } else {
          // Regular paragraph
          addWrappedText(line, 10, false, 3);
        }
      }
    }
  }

  yPosition += 10;

  // Bottom border lines
  drawLine(true, 6);
  yPosition += 5;

  // Footer
  addCenteredText('DISCLAIMER', 10, true);
  drawLine(false, 6);
  yPosition += 5;
  addWrappedText(
    'This report extracts information from transaction documents for reference only. It is NOT legal, real estate, or financial advice. This report does not verify source document accuracy, does not identify all potential issues, and the preparer assumes no liability for decisions based on this report. Consult licensed professionals for guidance.',
    8,
    false,
    5,
  );
  drawLine(false, 6);
  yPosition += 5;
  const footerDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  addCenteredText(`Contre  |  ${footerDate}  |  ${doc.documentName.replace(/[^a-zA-Z0-9]/g, '')}`, 8, false);
  drawLine(true, 6);

  // Generate PDF blob
  const pdfBlob = pdf.output('blob');
  return pdfBlob;
}

/**
 * Downloads a PDF file
 * @param blob - The PDF blob
 * @param filename - The filename for the downloaded file
 */
export const downloadPDF = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

