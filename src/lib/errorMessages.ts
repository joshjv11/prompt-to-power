// Enhanced error messages with recovery suggestions

export interface ErrorInfo {
  message: string;
  suggestion?: string;
  type: 'file' | 'data' | 'ai' | 'generation' | 'unknown';
}

export function getErrorInfo(error: Error | string): ErrorInfo {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const lowerMessage = errorMessage.toLowerCase();

  // File upload errors
  if (lowerMessage.includes('csv') || lowerMessage.includes('parse') || lowerMessage.includes('file')) {
    if (lowerMessage.includes('empty')) {
      return {
        message: 'The file appears to be empty',
        suggestion: 'Please check that your file contains data and try uploading again.',
        type: 'file',
      };
    }
    if (lowerMessage.includes('format') || lowerMessage.includes('extension')) {
      return {
        message: 'Unsupported file format',
        suggestion: 'Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.',
        type: 'file',
      };
    }
    if (lowerMessage.includes('parse')) {
      return {
        message: 'Failed to parse file',
        suggestion: 'Please ensure your file is properly formatted. Check for encoding issues or try saving as CSV UTF-8.',
        type: 'file',
      };
    }
    return {
      message: errorMessage,
      suggestion: 'Please check your file format and try again.',
      type: 'file',
    };
  }

  // Data validation errors
  if (lowerMessage.includes('schema') || lowerMessage.includes('column') || lowerMessage.includes('data')) {
    if (lowerMessage.includes('no data')) {
      return {
        message: 'No data detected',
        suggestion: 'Please ensure your file has headers and at least one row of data.',
        type: 'data',
      };
    }
    if (lowerMessage.includes('column')) {
      return {
        message: errorMessage,
        suggestion: 'Please check that all column names are valid and try again.',
        type: 'data',
      };
    }
    return {
      message: errorMessage,
      suggestion: 'Please verify your data structure and try again.',
      type: 'data',
    };
  }

  // AI service errors
  if (lowerMessage.includes('ai service') || lowerMessage.includes('api') || lowerMessage.includes('network')) {
    return {
      message: 'AI service unavailable',
      suggestion: 'Please check your internet connection and try again. The system will use fallback generation if the AI service is unavailable.',
      type: 'ai',
    };
  }

  // Generation errors
  if (lowerMessage.includes('generate') || lowerMessage.includes('dashboard') || lowerMessage.includes('prompt')) {
    if (lowerMessage.includes('prompt')) {
      return {
        message: 'Please provide a more detailed prompt',
        suggestion: 'Try describing what visualizations you want, for example: "Show sales by region with a bar chart"',
        type: 'generation',
      };
    }
    return {
      message: errorMessage,
      suggestion: 'Please try again with a different prompt or check your data.',
      type: 'generation',
    };
  }

  // Generic error
  return {
    message: errorMessage,
    suggestion: 'Please try again. If the problem persists, try refreshing the page.',
    type: 'unknown',
  };
}


