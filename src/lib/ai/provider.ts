import { createOpenAI } from '@ai-sdk/openai';
import { RawTranscriptExtraction, RawTranscriptExtractionSchema } from '../types/credential';

/**
 * OpenCode Zen AI provider instance configured via Vercel AI SDK.
 * Points to the high-efficiency 'opencode/big-pickle' model endpoint.
 */
export const openCodeZen = createOpenAI({
  baseURL: process.env.OPENCODE_ZEN_BASE_URL || 'https://api.opencodezen.com/v1',
  apiKey: process.env.OPENCODE_ZEN_API_KEY || '',
  name: 'opencode-zen',
});

/**
 * Returns the model reference for structured academic parsing.
 */
export function getOpenCodeZenModel() {
  return openCodeZen('opencode/big-pickle');
}

/**
 * Evaluates Indian academic grade thresholds to compute degree classification.
 */
export function deriveClassification(cgpa: number): RawTranscriptExtraction['classification'] {
  if (cgpa >= 7.75) return 'First Class with Distinction';
  if (cgpa >= 6.75) return 'First Class';
  if (cgpa >= 6.0) return 'Higher Second Class';
  if (cgpa >= 5.0) return 'Second Class';
  return 'Pass Class';
}

/**
 * RegEx pattern matching Bachelor of Engineering (B.E.) abbreviations.
 * Requires dotted notation (e.g., 'B.E.', 'b.e.') or uppercase 'BE' to prevent
 * accidental matching of the common English word 'be'.
 */
export const BE_ABBREVIATION_REGEX = /\b(?:[bB]\.\s*[eE]\.?|BE)\b/;

/**
 * Classifies degree text into canonical standardized degree title.
 */
export function classifyDegree(text: string): string | null {
  if (/\b(?:m\.?\s*tech|master\s*of\s*technology)\b/i.test(text)) {
    return 'Master of Technology (M.Tech)';
  }
  if (/\b(?:m\.?\s*c\.?\s*a\.?|master\s*of\s*computer\s*applications?)\b/i.test(text)) {
    return 'Master of Computer Applications (MCA)';
  }
  if (/\b(?:b\.?\s*tech|bachelor\s*of\s*technology)\b/i.test(text)) {
    return 'Bachelor of Technology (B.Tech)';
  }
  if (BE_ABBREVIATION_REGEX.test(text) || /\bbachelor\s*of\s*engineering\b/i.test(text)) {
    return 'Bachelor of Engineering (B.E.)';
  }
  return null;
}

/**
 * High-accuracy heuristic parser for academic transcripts and grade sheets.
 * Acts as an offline/resilient fallback if the OpenCode Zen API endpoint is unreachable
 * or during offline Avishkar 2026-27 demonstration conditions.
 */
export function extractTranscriptHeuristically(rawText: string): RawTranscriptExtraction {
  const normalized = rawText.replace(/\r\n/g, '\n');

  // 1. Extract CGPA / SGPA
  let cgpa: number | null = null;
  const cgpaMatches = [
    // Cumulative Grade Point Average (C.G.P.A.) : 8.45
    /(?:Cumulative\s*Grade\s*Point\s*Average|C\.?G\.?P\.?A\.?)[^0-9\n]{0,30}?[:=]?\s*([0-9]+(?:\.[0-9]+)?)/i,
    /Final\s*(?:Grade|CGPA)[^0-9\n]{0,20}?[:=]?\s*([0-9]+(?:\.[0-9]+)?)/i,
    /\b(?:CGPA|C\.G\.P\.A\.)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)/i,
    /\b([0-9]\.[0-9]{1,2})\s*\/\s*10(?:\.00?)?\b/i,
    // Fall back to SGPA only if cumulative CGPA is absent
    /SGPA[^0-9\n]{0,20}?[:=]?\s*([0-9]+(?:\.[0-9]+)?)/i,
  ];

  for (const regex of cgpaMatches) {
    const match = normalized.match(regex);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val >= 0 && val <= 10) {
        cgpa = val;
        break;
      }
    }
  }

  if (cgpa === null) {
    throw new Error('Unable to extract a valid CGPA/grade point average from the transcript text.');
  }

  // 2. Extract Student Name
  let studentName: string | null = null;
  const nameMatches = [
    /(?:Candidate|Student|Student's)\s*Name\s*[:=]\s*([^\n,]+)/i,
    /Name\s*[:=]\s*([^\n,]+)/i,
    /Shri\s*\/\s*Shrimati\s*[:=]?\s*([^\n,]+)/i,
  ];

  for (const regex of nameMatches) {
    const match = normalized.match(regex);
    if (match && match[1]) {
      const cleaned = match[1].trim().replace(/\s{2,}/g, ' ');
      if (cleaned.length > 2 && !cleaned.toLowerCase().includes('university')) {
        studentName = cleaned;
        break;
      }
    }
  }

  if (!studentName) {
    throw new Error('Unable to extract the student candidate name from the transcript text.');
  }

  // 3. Extract Enrollment / Roll Number
  let enrollmentNumber = '';
  const enrollMatches = [
    /Enrollment\s*(?:No\.?|Number)\s*[:=]\s*([A-Za-z0-9\-_/]+)/i,
    /Roll\s*(?:No\.?|Number)\s*[:=]\s*([A-Za-z0-9\-_/]+)/i,
    /PRN\s*[:=]\s*([A-Za-z0-9\-_/]+)/i,
  ];

  for (const regex of enrollMatches) {
    const match = normalized.match(regex);
    if (match && match[1]) {
      enrollmentNumber = match[1].trim();
      break;
    }
  }

  // 4. Extract Degree
  // Prioritize explicitly labeled awarded degree fields over general body text mentions
  // Prefer "Awarded Degree:" first, then standalone "Degree:" (excluding "Prior Degree:" or "Previous Degree:")
  let degreeText: string | null = null;
  const awardedDegreeMatch = normalized.match(/(?:Awarded[ \t]+Degree)[ \t]*[:=][ \t]*([^\n,]+)/i);
  if (awardedDegreeMatch && awardedDegreeMatch[1]) {
    degreeText = awardedDegreeMatch[1];
  } else {
    const labeledDegreeMatch = normalized.match(
      /(?<!(?:prior|previous)[ \t]+)Degree(?:[ \t]+(?:Title|Name|Statement))?[ \t]*[:=][ \t]*([^\n,]+)/i
    );
    if (labeledDegreeMatch && labeledDegreeMatch[1]) {
      degreeText = labeledDegreeMatch[1];
    }
  }

  let degree: string | null = null;
  if (degreeText) {
    degree = classifyDegree(degreeText);
    if (!degree) {
      throw new Error(
        `Unrecognized degree: "${degreeText.trim()}". Only accredited technical degrees (B.Tech, B.E., M.Tech, MCA) are supported.`
      );
    }
  } else {
    // Restrict the examination/body-text scan to cases without an explicit labeled degree
    const examMatch = normalized.match(/Examination\s*[:=]\s*([^\n]+)/i);
    if (examMatch && examMatch[1]) {
      degree = classifyDegree(examMatch[1]);
    }

    // Fallback: scan normalized text without letting casual M.Tech text override an otherwise valid B.Tech
    if (!degree) {
      if (/\b(?:b\.?\s*tech|bachelor\s*of\s*technology)\b/i.test(normalized)) {
        degree = 'Bachelor of Technology (B.Tech)';
      } else if (BE_ABBREVIATION_REGEX.test(normalized) || /\bbachelor\s*of\s*engineering\b/i.test(normalized)) {
        degree = 'Bachelor of Engineering (B.E.)';
      } else {
        degree = classifyDegree(normalized);
      }
    }
  }

  if (!degree) {
    throw new Error('Unable to extract or classify an eligible academic degree from the transcript text.');
  }

  // 5. Extract Branch
  let branch = 'Computer Science & Engineering';
  if (/computer\s*(?:science|engineering|technology)/i.test(normalized)) {
    branch = 'Computer Science & Engineering';
  } else if (/information\s*technology/i.test(normalized)) {
    branch = 'Information Technology';
  } else if (/artificial\s*intelligence|data\s*science/i.test(normalized)) {
    branch = 'Artificial Intelligence & Data Science';
  } else if (/electronics|telecom/i.test(normalized)) {
    branch = 'Electronics & Telecommunication Engineering';
  } else if (/mechanical/i.test(normalized)) {
    branch = 'Mechanical Engineering';
  }

  // 6. Extract Institution
  let institution: string | null = null;

  // First inspect whether an accredited awarding university header/mention is present
  if (/rashtrasant|tukadoji|rtmnu|nagpur\s*university/i.test(normalized)) {
    institution = 'Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU)';
  } else if (/mumbai\s*university/i.test(normalized)) {
    institution = 'University of Mumbai';
  } else if (/pune\s*university|savitribai/i.test(normalized)) {
    institution = 'Savitribai Phule Pune University (SPPU)';
  }

  // If no known university header was matched, extract the explicit labeled field
  if (!institution) {
    const instMatches = [
      /(?:Awarding\s*)?(?:Institution|University|Institute)\s*[:=]\s*([^\n]+)/i,
      /College\s*[:=]\s*([^\n]+)/i,
    ];

    for (const regex of instMatches) {
      const match = normalized.match(regex);
      if (match && match[1]) {
        const candidate = match[1].trim();
        if (candidate.length > 2) {
          institution = candidate;
          break;
        }
      }
    }
  }

  if (!institution) {
    throw new Error('Unable to extract awarding institution/university from the transcript text.');
  }

  // 7. Extract Graduation Year
  let graduationYear: number | null = null;
  const yearMatches = normalized.match(/\b(20[1-3][0-9])\b/g);
  if (yearMatches && yearMatches.length > 0) {
    // Pick the most recent valid year
    const years = yearMatches.map((y) => parseInt(y, 10)).filter((y) => y >= 2015 && y <= 2030);
    if (years.length > 0) {
      graduationYear = Math.max(...years);
    }
  }

  if (graduationYear === null) {
    throw new Error('Unable to extract an eligible graduation/passing year (2015-2030) from the transcript text.');
  }

  const classification = deriveClassification(cgpa);

  const rawData = {
    studentName,
    degree,
    branch,
    institution,
    enrollmentNumber,
    cgpa,
    graduationYear,
    classification,
  };

  return RawTranscriptExtractionSchema.parse(rawData);
}
