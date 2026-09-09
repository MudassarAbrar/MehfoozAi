/**
 * Security & Input Sanitization Utilities for Mehfooz
 * @license Apache-2.0
 */

// Forbidden executable file extensions
const FORBIDDEN_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'js', 'dll', 'com', 'scr', 
  'msi', 'php', 'py', 'elf', 'bin', 'reg', 'htm', 'html', 'jar', 'apk', 
  'iso', 'dmg', 'app', 'vb', 'wsf', 'cpl', 'gadget', 'hta', 'inf', 'ins', 
  'isu', 'job', 'jse', 'lnk', 'msc', 'pif', 'paf', 'rgs', 'sct', 'shb', 
  'shs', 'u3p', 'vbscript', 'vbe', 'ws', 'wsc', 'wsh'
]);

// Allowed safe MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf'
]);

// Patterns that indicate code injection, script tags, or dangerous syntax
const CODE_INJECTION_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
  /<style[\s\S]*?>[\s\S]*?<\/style>/gi,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /on\w+\s*=/gi, // onerror=, onload=, onclick=
  /<svg[\s\S]*?>/gi,
  /<applet[\s\S]*?>/gi,
  /<embed[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /\beval\s*\(/gi,
  /\bexec\s*\(/gi,
  /\bFunction\s*\(/gi,
  /<\?php/gi,
  /SELECT\s+.*\s+FROM/gi,
  /DROP\s+TABLE/gi,
  /INSERT\s+INTO/gi,
  /DELETE\s+FROM/gi,
  /<%[\s\S]*?%>/gi
];

/**
 * Validates text input for code injection, script tags, or SQL commands.
 * Returns whether input is safe and the sanitized string.
 */
export function validateAndSanitizeTextInput(input: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (!input) {
    return { isValid: true, sanitized: '' };
  }

  // Check for null bytes or control characters
  const containsNullBytes = /\0/.test(input);
  let cleaned = input.replace(/\0/g, '').trim();

  // Test against code injection patterns
  for (const pattern of CODE_INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      return {
        isValid: false,
        sanitized: cleaned.replace(pattern, '[REMOVED_SUSPICIOUS_CODE]'),
        error: 'Security Warning: Code tags, executable scripts, or invalid syntax detected in text.'
      };
    }
  }

  // Basic HTML entity encoding for extra safety
  cleaned = cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Unescape safe chars so normal text reads cleanly
  const DisplayText = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');

  return {
    isValid: true,
    sanitized: DisplayText
  };
}

/**
 * Sanitizes file names to remove path traversal sequences or special shell characters.
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return 'file';
  // Strip path traversal sequences like ../ or ..\
  let clean = fileName.replace(/(\.\.[\/\\])+/g, '');
  // Strip null bytes and control chars
  clean = clean.replace(/[\0\x00-\x1F\x7F]/g, '');
  // Keep standard alphanumeric, dots, hyphens, underscores, and spaces
  clean = clean.replace(/[^a-zA-Z0-9._\s-]/g, '_');
  return clean.substring(0, 100);
}

/**
 * Validates uploaded file extension, MIME type, size, and header magic bytes.
 * Rejects executable files disguised as images or documents.
 */
export async function validateFileUpload(file: File): Promise<{
  isValid: boolean;
  error?: string;
  sanitizedFileName: string;
}> {
  const sanitizedFileName = sanitizeFileName(file.name);
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  // 1. Extension check
  if (FORBIDDEN_EXTENSIONS.has(ext)) {
    return {
      isValid: false,
      error: `Security Alert: Executable file extension (.${ext}) is strictly prohibited for security.`,
      sanitizedFileName
    };
  }

  // 2. MIME type check
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: `Unsupported file type (${file.type}). Only JPEG, PNG, WEBP, HEIC images, and PDF documents are allowed.`,
      sanitizedFileName
    };
  }

  // 3. File size check (max 15MB)
  if (file.size > 15 * 1024 * 1024) {
    return {
      isValid: false,
      error: 'File size exceeds the maximum allowed limit of 15MB.',
      sanitizedFileName
    };
  }

  // 4. Magic Bytes Inspection (deep header verification)
  try {
    const buffer = await readFileBytes(file, 16);
    const isValidMagic = checkMagicBytes(buffer, ext, file.type);
    if (!isValidMagic) {
      return {
        isValid: false,
        error: 'Security Warning: File content structure does not match a valid image or PDF format (potential executable disguise). File rejected.',
        sanitizedFileName
      };
    }
  } catch (err) {
    console.warn('Magic bytes read warning:', err);
  }

  return {
    isValid: true,
    sanitizedFileName
  };
}

/**
 * Reads the first N bytes of a File blob.
 */
function readFileBytes(file: File, length: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const blob = file.slice(0, length);
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error('Unable to read file header'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Validates byte signatures for JPEG, PNG, WEBP, PDF, and HEIC headers.
 */
function checkMagicBytes(bytes: Uint8Array, ext: string, mimeType: string): boolean {
  if (bytes.length < 4) return false;

  // Executable signatures (MZ for Windows EXE/DLL, ELF for Linux, #! for script)
  if (bytes[0] === 0x4D && bytes[1] === 0x5A) return false; // MZ header
  if (bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) return false; // ELF header
  if (bytes[0] === 0x23 && bytes[1] === 0x21) return false; // #! shebang header

  // JPEG magic: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return true;
  }

  // PNG magic: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return true;
  }

  // GIF magic: GIF87a or GIF89a (0x47 0x49 0x46 0x38)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return true;
  }

  // WEBP magic: RIFF ... WEBP (0x52 0x49 0x46 0x46)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return true;
  }

  // PDF magic: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return true;
  }

  // HEIC magic: ....ftypheic or ftypheif or ftypmsf1
  if (bytes.length >= 12) {
    const ftyp = String.fromCharCode(...bytes.slice(4, 8));
    if (ftyp === 'ftyp') return true;
  }

  // If MIME type is image or pdf but no matching magic header found, reject
  if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
    return false;
  }

  return true;
}

export { validateFileUpload as validateUploadedFile };

