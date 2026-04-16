/**
 * Gmail integration stub.
 *
 * Provides functions to create and send drafts using the Gmail API.
 * In production you should authenticate using OAuth2 and call the
 * Gmail API directly. Here we return placeholder values to
 * demonstrate the expected shapes.
 */

export interface DraftInput {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
}

export async function createDraft(userId: string, input: DraftInput) {
  // TODO: call gmail.users.drafts.create
  return {
    gmailDraftId: 'gmail-draft-id'
  };
}

export async function sendDraft(userId: string, gmailDraftId: string) {
  // TODO: call gmail.users.drafts.send
  return {
    externalRef: 'gmail-message-id'
  };
}