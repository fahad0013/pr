import jsPDF from "jspdf";

interface QuestionResult {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  selected: number | null;
  subject: string;
}

interface ResultData {
  testName: string;
  questions: QuestionResult[];
  timeTaken: number;
  totalTime: number;
  scorePercent: number;
  correct: number;
  wrong: number;
  skipped: number;
}

const optionLabels = ["A", "B", "C", "D"];

export function generateResultPDF(data: ResultData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const addNewPageIfNeeded = (neededHeight: number) => {
    if (y + neededHeight > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.testName, pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleDateString("bn-BD")}`, pageWidth / 2, y, { align: "center" });
  y += 10;

  // Score summary box
  doc.setFillColor(240, 249, 240);
  doc.roundedRect(margin, y, contentWidth, 25, 3, 3, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text(`Score: ${data.scorePercent}%`, margin + 10, y + 10);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Correct: ${data.correct} | Wrong: ${data.wrong} | Skipped: ${data.skipped}`, margin + 10, y + 18);
  
  const mins = Math.floor(data.timeTaken / 60);
  const secs = data.timeTaken % 60;
  doc.text(`Time: ${mins}m ${secs}s`, margin + contentWidth - 30, y + 10);
  y += 32;

  // Questions
  data.questions.forEach((q, i) => {
    const isCorrect = q.selected === q.correctIndex;
    const isSkipped = q.selected === null;
    
    // Estimate height needed
    const qTextLines = doc.splitTextToSize(`Q${i + 1}. ${q.text}`, contentWidth - 10);
    const neededHeight = qTextLines.length * 5 + q.options.length * 6 + 12;
    addNewPageIfNeeded(neededHeight);

    // Question background
    const bgColor = isSkipped ? [245, 245, 245] : isCorrect ? [240, 253, 244] : [254, 242, 242];
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(margin, y, contentWidth, neededHeight, 2, 2, "F");

    // Status indicator
    const statusColor = isSkipped ? [156, 163, 175] : isCorrect ? [16, 185, 129] : [239, 68, 68];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.rect(margin, y, 3, neededHeight, "F");

    y += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(qTextLines, margin + 6, y);
    y += qTextLines.length * 5 + 2;

    // Options
    doc.setFontSize(8);
    q.options.forEach((opt, oi) => {
      const isRight = oi === q.correctIndex;
      const isUserPick = oi === q.selected;
      
      if (isRight) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
      } else if (isUserPick) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(239, 68, 68);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
      }
      
      const marker = isRight ? " [Correct]" : isUserPick && !isRight ? " [Your Answer]" : "";
      doc.text(`${optionLabels[oi]}. ${opt}${marker}`, margin + 8, y);
      y += 5;
    });

    doc.setTextColor(0, 0, 0);
    y += 4;
  });

  doc.save(`${data.testName.replace(/\s+/g, "_")}_result.pdf`);
}
