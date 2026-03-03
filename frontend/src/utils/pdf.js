import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportPDF(analysis) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  // Header bg
  doc.setFillColor(6, 6, 18);
  doc.rect(0, 0, W, 44, 'F');

  doc.setTextColor(0, 229, 255);
  doc.setFontSize(24); doc.setFont('helvetica', 'bold');
  doc.text('SEOlens Report', 14, 20);

  doc.setTextColor(90, 90, 128);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date(analysis.analyzed_at).toLocaleString()}`, 14, 28);
  if (analysis.url) doc.text(`URL: ${analysis.url}`, 14, 34);
  if (analysis.keyword) doc.text(`Keyword: ${analysis.keyword}`, 14, 40);

  // Score
  let y = 56;
  const sc = analysis.overall_score;
  const scColor = sc >= 80 ? [0, 255, 157] : sc >= 60 ? [255, 190, 11] : [255, 51, 102];
  doc.setTextColor(...scColor);
  doc.setFontSize(48); doc.setFont('helvetica', 'bold');
  doc.text(`${sc}`, 14, y + 16);
  doc.setTextColor(90, 90, 128); doc.setFontSize(12);
  doc.text(`/ 100  Grade: ${analysis.grade}`, 38, y + 12);

  y += 30;
  doc.setTextColor(240, 240, 255); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text('SEO Checks', 14, y); y += 5;

  const rows = Object.entries(analysis.checks).map(([, c]) => [
    c.label || '', c.score != null ? `${Math.round(c.score)}/100` : 'N/A',
    c.passed === true ? 'PASS' : c.passed === false ? 'FAIL' : 'N/A',
    c.recommendation || ''
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Check', 'Score', 'Status', 'Recommendation']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 3, fillColor: [18, 18, 40], textColor: [210, 210, 240], lineColor: [26, 26, 56], lineWidth: 0.1 },
    headStyles: { fillColor: [22, 22, 52], textColor: [0, 229, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [14, 14, 34] },
    columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 18, halign: 'center' }, 2: { cellWidth: 16, halign: 'center' }, 3: { cellWidth: 'auto' } },
    didParseCell(d) {
      if (d.column.index === 2) {
        if (d.cell.raw === 'PASS') d.cell.styles.textColor = [0, 255, 157];
        if (d.cell.raw === 'FAIL') d.cell.styles.textColor = [255, 51, 102];
      }
    }
  });

  if (analysis.ai_suggestions && !analysis.ai_suggestions.error) {
    const ai = analysis.ai_suggestions;
    let ay = doc.lastAutoTable.finalY + 12;
    doc.setTextColor(240, 240, 255); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('AI-Powered Suggestions', 14, ay); ay += 5;

    const aiRows = [];
    if (ai.optimized_title) aiRows.push(['Optimized Title', ai.optimized_title]);
    if (ai.optimized_meta) aiRows.push(['Optimized Meta', ai.optimized_meta]);
    if (ai.optimized_h1) aiRows.push(['Optimized H1', ai.optimized_h1]);
    if (ai.quick_win) aiRows.push(['Quick Win', ai.quick_win]);
    (ai.action_items || []).forEach((item, i) => aiRows.push([`Action ${i + 1}`, item]));
    if (ai.content_gaps) aiRows.push(['Content Gaps', ai.content_gaps]);

    autoTable(doc, {
      startY: ay, body: aiRows,
      styles: { fontSize: 8, cellPadding: 3, fillColor: [18, 18, 40], textColor: [210, 210, 240], lineColor: [26, 26, 56], lineWidth: 0.1 },
      columnStyles: { 0: { cellWidth: 34, textColor: [139, 92, 246], fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
    });
  }

  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(46, 46, 88);
    doc.text(`SEOlens — ${i} / ${pages}`, W / 2, 288, { align: 'center' });
  }

  doc.save(`seolens-report-${Date.now()}.pdf`);
}
