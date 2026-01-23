import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Consultation } from '@/types/consultation';

// Create OAuth2 client
export function createOAuthClient() {
  return new OAuth2Client(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI
  );
}

// Generate OAuth URL for user consent
export function generateAuthUrl(scopes: string[] = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
]): string {
  const oauth2Client = createOAuthClient();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    include_granted_scopes: true,
  });
}

// Exchange code for tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuthClient();
  
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
    token_type: tokens.token_type,
  };
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials.access_token;
}

// Helper function to create authenticated calendar client
export function createAuthenticatedCalendarClient(tokens: any) {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(tokens);
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// Check if token is expired
export function isTokenExpired(expiryDate: number): boolean {
  return Date.now() >= expiryDate;
}

// Simple in-memory token storage (replace with your database)
const tokenStorage = new Map<string, any>();

// Store user's tokens (for demo - replace with database)
export async function storeUserTokens(userId: string, tokens: any) {
  console.log(`📝 Storing tokens for user: ${userId}`);
  tokenStorage.set(userId, tokens);
  return { success: true };
}

// Get user's tokens (for demo - replace with database)
export async function getUserTokens(userId: string) {
  console.log(`📖 Retrieving tokens for user: ${userId}`);
  return tokenStorage.get(userId) || null;
}

// Handle OAuth callback
export async function handleOAuthCallback(code: string, userId: string) {
  try {
    // Get tokens from authorization code
    const tokens = await getTokensFromCode(code);
    
    // Store tokens for the user
    await storeUserTokens(userId, tokens);
    
    console.log(`✅ OAuth completed for user ${userId}`);
    return { success: true, tokens };
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    return { success: false, error: error.message };
  }
}

// Calendar Event Interface
export interface CalendarEvent {
  id?: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{
    email: string;
    displayName?: string;
    organizer?: boolean;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: { type: 'hangoutsMeet' };
    };
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

// Create Google Calendar Event
export async function createGoogleCalendarEvent(
  consultation: Consultation,
  consultantEmail: string,
  clientEmail: string
): Promise<{
  success: boolean; 
  eventId?: string; 
  error?: string;
  eventLink?: string;
}> {
  try {
    // Check if we have Google OAuth credentials
    if (!process.env.GOOGLE_CALENDAR_CLIENT_ID || !process.env.GOOGLE_CALENDAR_CLIENT_SECRET) {
      console.log('🔶 Google Calendar credentials not configured. Skipping calendar event creation.');
      return {
        success: true,
        eventId: `demo_event_${consultation.id}`,
      };
    }

    // Calculate end time
    const startTime = new Date(consultation.scheduled_time);
    const endTime = new Date(startTime.getTime() + consultation.duration_minutes * 60000);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Create calendar event object
    const event: CalendarEvent = {
      summary: `Blockchain Consultation - ${consultation.consultant_id}`,
      description: consultation.notes || 'Blockchain expert consultation session',
      start: {
        dateTime: startTime.toISOString(),
        timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone,
      },
      attendees: [
        {
          email: consultantEmail,
          displayName: 'Consultant',
          organizer: true,
          responseStatus: 'accepted',
        },
        {
          email: clientEmail,
          displayName: 'Client',
          responseStatus: 'needsAction',
        },
      ],
      conferenceData: {
        createRequest: {
          requestId: `meet_${consultation.id}_${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: true,
      },
    };

    console.log('📅 Google Calendar Event to be created:', {
      summary: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime,
      attendees: event.attendees.map(a => a.email),
      hasVideoConference: !!event.conferenceData,
    });

    // For demo, return a mock response
    const mockEventId = `google_event_${consultation.id}_${Date.now()}`;
    const mockEventLink = `https://calendar.google.com/event?id=${mockEventId}`;
    
    console.log('✅ Calendar event would be created with ID:', mockEventId);
    
    return {
      success: true,
      eventId: mockEventId,
      eventLink: mockEventLink,
    };
    
  } catch (error: any) {
    console.error('❌ Google Calendar error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create calendar event',
    };
  }
}

// Get user's calendar events
export async function getUserCalendarEvents(userId: string, maxResults: number = 10) {
  try {
    const tokens = await getUserTokens(userId);
    if (!tokens) {
      return { success: false, error: 'User not authenticated with Google Calendar' };
    }
    
    // Check if token needs refresh
    if (tokens.expiry_date && isTokenExpired(tokens.expiry_date)) {
      if (tokens.refresh_token) {
        tokens.access_token = await refreshAccessToken(tokens.refresh_token);
        await storeUserTokens(userId, tokens);
      } else {
        return { success: false, error: 'Token expired and no refresh token available' };
      }
    }
    
    const calendar = createAuthenticatedCalendarClient(tokens);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return { success: true, events: response.data.items || [] };
  } catch (error: any) {
    console.error('❌ Error getting calendar events:', error);
    return { success: false, error: error.message };
  }
}

// Revoke user's access
export async function revokeAccess(userId: string) {
  try {
    const tokens = await getUserTokens(userId);
    if (tokens?.access_token) {
      const oauth2Client = createOAuthClient();
      oauth2Client.setCredentials(tokens);
      await oauth2Client.revokeToken(tokens.access_token);
    }
    
    // Remove tokens from storage
    tokenStorage.delete(userId);
    console.log(`🔒 Access revoked for user ${userId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error revoking access:', error);
    return { success: false, error: error.message };
  }
}