export default {
  // Header
  appTitle: 'Legal Document AI Platform',
  navAnalyze: 'Contract Analysis',
  navChat: 'AI Q&A',
  navHistory: 'History',

  // Home
  homeTitle: 'Contract Legal Risk Analysis',
  homeSubtitle: 'Upload a contract and let AI identify legal risks and generate a professional report',
  startAnalyze: 'Start Analysis',
  analyzing: 'Analyzing...',
  analyzingTip: 'Analyzing contract content, please wait...',
  analyzingTime: 'AI model processing may take 2-5 minutes',
  analyzeNewFile: 'Analyze New File',

  // FileUpload
  uploadTitle: 'Upload Contract File',
  dragOrClick: 'Drag & drop a file here, or click to select',
  supportedFormats: 'Supports txt, pdf, docx, jpg, png, gif, bmp, webp — max 10MB',
  formatError: 'Only txt, pdf, docx, jpg, png, gif, bmp, webp formats are supported',
  sizeError: 'File size cannot exceed 10MB',

  // RiskReport
  reportTitle: 'Contract Risk Analysis Report',
  fileLabel: 'File: ',
  overallRisk: 'Overall Risk Level: ',
  riskDetails: 'Risk Details ({count} items)',
  riskPoint: 'Risk Point {index}',
  location: 'Location: ',
  summaryTitle: 'Summary & Recommendations',
  rawResponseTitle: 'AI Raw Analysis',
  riskHigh: 'High Risk',
  riskMedium: 'Medium Risk',
  riskLow: 'Low Risk',
  riskUnknown: 'Unknown Risk',

  // History
  historyTitle: 'Analysis History',
  newAnalysis: 'New Analysis',
  backToList: 'Back to List',
  loading: 'Loading...',
  noRecords: 'No analysis records yet',
  riskPoints: '{count} risk points',

  // Chat
  chatTitle: 'Legal AI Q&A',
  chatSubtitle: 'Ask the AI legal advisor, or paste/upload a contract for targeted questions',
  modeGeneral: 'General Q&A',
  modePaste: 'Paste Contract',
  modeUpload: 'Upload Contract',
  pastedContract: 'Contract pasted',
  chars: '{count} chars',
  pastePlaceholder: 'Paste the full contract text here...',
  selectTxtFile: 'Select .txt contract file',
  txtOnlyTip: 'Only txt is supported here. For PDF/Word/Images, use the Contract Analysis page first.',
  chatTitleBar: 'Legal Advisor Chat',
  basedOnContract: 'Answering based on contract',
  clearChat: 'Clear Chat',
  chatPlaceholder: 'Enter your legal question... (Enter to send, Shift+Enter for new line)',
  send: 'Send',
  startChat: 'Ask the legal advisor to start a conversation',
  clearConfirm: 'Clear the current conversation? This cannot be undone.',
  answerFailed: 'Failed to answer, please try again later',
  chatUploadError: 'Only .txt contract files can be uploaded here. For PDF/Word/Images, use the Contract Analysis page or paste text directly.',

  // Example questions
  exampleQ1: 'What clauses should I pay attention to in a rental contract?',
  exampleQ2: 'Are the breach of contract clauses in this agreement reasonable?',
  exampleQ3: 'Please explain the force majeure clause',
  exampleQ4: 'How to verify contract party qualifications?',

  // Common
  analyzeFailed: 'Analysis failed, please try again later',
  fetchHistoryFailed: 'Failed to fetch history',
  clearHistory: 'Clear History',
  clearHistoryConfirm: 'Clear all history records? This cannot be undone.',
  clearHistoryFailed: 'Failed to clear history',
}
