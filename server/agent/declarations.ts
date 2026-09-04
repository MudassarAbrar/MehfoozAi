/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gemini function declarations — defines all 10 tools the agent can call.
 * Uses the @google/genai SDK Type enum for parameter schemas.
 */

import { Type } from '@google/genai';

export const safetyFunctionDeclarations = [
  {
    name: 'search_legal_corpus',
    description:
      'Search the approved Punjab legal corpus and return relevant grounded citations.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Legal topic or question to search.'
        },
        statute_filter: {
          type: Type.STRING,
          description: 'Optional act or statute filter (e.g. "PPWVA 2016", "PECA 2016").'
        },
        max_results: {
          type: Type.NUMBER,
          description: 'Number of results from 1 to 5.'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'look_up_support_directory',
    description:
      'Find approved support resources in Punjab by category and district.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          description:
            'One of: legal_aid, emergency, police, counselling, shelter, workplace_ombudsperson, cyber_safety.'
        },
        district: {
          type: Type.STRING,
          description: 'Optional Punjab district (e.g. "Lahore", "Multan").'
        }
      },
      required: ['category']
    }
  },
  {
    name: 'get_complaint_status',
    description:
      'Look up the authenticated user\'s complaint by tracking number.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tracking_number: {
          type: Type.STRING,
          description: 'Complaint tracking number (e.g. PSCA-LHR-2026-1234).'
        }
      },
      required: ['tracking_number']
    }
  },
  {
    name: 'open_crisis_modal',
    description:
      'Open the existing crisis interface with emergency call options.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'open_complaint_builder',
    description:
      'Open the complaint builder when the user explicitly wants to prepare a complaint.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          description: 'Complaint category (e.g. domestic_violence, workplace_harassment).'
        }
      }
    }
  },
  {
    name: 'prepare_complaint_draft',
    description:
      'Prepare a complaint draft for user review. This does not send an email.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          description: 'Complaint category.'
        },
        incident_summary: {
          type: Type.STRING,
          description: 'User-approved incident summary.'
        },
        district: {
          type: Type.STRING,
          description: 'Punjab district.'
        },
        requested_support: {
          type: Type.STRING,
          description: 'Requested support or remedy.'
        }
      },
      required: ['category', 'incident_summary']
    }
  },
  {
    name: 'save_incident_to_vault',
    description:
      'Save an approved encrypted incident record. Never receive or persist plaintext vault data on the server.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        incident_type: {
          type: Type.STRING,
          description: 'Incident category (e.g. domestic_violence, cyber_blackmail).'
        },
        title: {
          type: Type.STRING,
          description: 'Short title for the incident record.'
        }
      },
      required: ['incident_type', 'title']
    }
  },
  {
    name: 'start_safety_checkin',
    description:
      'Start a safety check-in that may alert selected emergency contacts if missed.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        destination: {
          type: Type.STRING,
          description: 'Destination address or location name.'
        },
        duration_minutes: {
          type: Type.NUMBER,
          description: 'Expected travel time in minutes.'
        },
        contact_ids: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          },
          description: 'Saved emergency-contact IDs.'
        }
      },
      required: ['destination', 'duration_minutes']
    }
  },
  {
    name: 'send_sms_to_contact',
    description:
      'Propose an SMS to a saved emergency contact. Requires explicit confirmation before sending.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        contact_id: {
          type: Type.STRING,
          description: 'Saved emergency-contact ID.'
        },
        message: {
          type: Type.STRING,
          description: 'Message preview.'
        },
        include_gps: {
          type: Type.BOOLEAN,
          description: 'Whether the user requested location inclusion.'
        }
      },
      required: ['contact_id', 'message']
    }
  },
  {
    name: 'email_complaint_to_authority',
    description:
      'Propose sending a reviewed complaint by email. Requires explicit confirmation before sending.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        complaint_id: {
          type: Type.STRING,
          description: 'Authenticated user complaint ID.'
        },
        recipient_email: {
          type: Type.STRING,
          description: 'Configured or approved recipient email.'
        }
      },
      required: ['complaint_id']
    }
  }
] as const;
