import { NextRequest } from 'next/server';

export interface JWTPayload {
  id: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function getUserFromToken(request: NextRequest): JWTPayload | null {
  try {
    // Get user token from cookies
    const userToken = request.cookies.get('auth_token')?.value;
    
    if (!userToken) {
      return null;
    }

    // Parse JWT token
    const base64Payload = userToken.split('.')[1];
    if (!base64Payload) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token parsing failed:', error);
    return null;
  }
}

export function getAdminFromToken(request: NextRequest): JWTPayload | null {
  try {
    // Get admin token from cookies
    const adminToken = request.cookies.get('admin_auth_token')?.value;
    
    if (!adminToken) {
      return null;
    }

    // Parse JWT token
    const base64Payload = adminToken.split('.')[1];
    if (!base64Payload) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    
    return payload as JWTPayload;
  } catch (error) {
    console.error('Admin token parsing failed:', error);
    return null;
  }
}
