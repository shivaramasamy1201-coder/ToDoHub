/**
 * Authentication Middleware
 * Validates Supabase JWT session token passed in Authorization: Bearer <token>
 */
export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication token is required'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Malformed authorization token'
      });
    }

    // Decode JWT payload safely
    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token format'
      });
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

    // Check token expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Session has expired. Please log in again.'
      });
    }

    // Ensure valid user sub is present
    if (!payload.sub) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token payload'
      });
    }

    // Attach authenticated user information to request
    req.user = {
      id: payload.sub,
      email: payload.email || null,
      role: payload.role || 'authenticated'
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication failed'
    });
  }
};
