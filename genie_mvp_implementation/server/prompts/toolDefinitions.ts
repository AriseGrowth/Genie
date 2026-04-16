/**
 * Tool definitions for Genie OS.
 *
 * The assistant uses function calling (OpenAI tool calling) to request
 * operations from the backend. Each tool must be declared here with
 * a JSON Schema describing its parameters. These definitions mirror
 * the server layer and inform the language model about what
 * operations are available. Do not include implementation details.
 */

import { JSONSchema7 } from 'json-schema';

export interface ToolDefinition {
  type: 'function';
  name: string;
  description: string;
  parameters: JSONSchema7;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: 'function',
    name: 'get_today_brief',
    description: 'Return today\'s schedule, open tasks, and follow‑up risks for the active workspace.',
    parameters: {
      type: 'object',
      properties: {
        workspace: { type: 'string', enum: ['personal', 'business'] }
      },
      required: ['workspace'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'create_email_draft',
    description: 'Create a draft email. Does not send.',
    parameters: {
      type: 'object',
      properties: {
        to: {
          type: 'array',
          items: { type: 'string' }
        },
        cc: { type: 'array', items: { type: 'string' } },
        bcc: { type: 'array', items: { type: 'string' } },
        subject: { type: 'string' },
        body: { type: 'string' },
        workspace: { type: 'string', enum: ['personal', 'business'] }
      },
      required: ['to', 'subject', 'body', 'workspace'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'create_task',
    description: 'Create a task in the selected workspace.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        notes: { type: 'string' },
        due_at: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
        workspace: { type: 'string', enum: ['personal', 'business'] }
      },
      required: ['title', 'workspace'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'summarize_meeting_text',
    description: 'Summarise meeting text and extract decisions and action items.',
    parameters: {
      type: 'object',
      properties: {
        meeting_text: { type: 'string' },
        workspace: { type: 'string', enum: ['personal', 'business'] }
      },
      required: ['meeting_text', 'workspace'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'request_approval',
    description: 'Create an approval request for any external action.',
    parameters: {
      type: 'object',
      properties: {
        action_type: {
          type: 'string',
          enum: ['send_email', 'create_calendar_event', 'update_calendar_event', 'store_sensitive_memory']
        },
        payload: { type: 'object' },
        workspace: { type: 'string', enum: ['personal', 'business'] }
      },
      required: ['action_type', 'payload', 'workspace'],
      additionalProperties: false
    }
  }
];