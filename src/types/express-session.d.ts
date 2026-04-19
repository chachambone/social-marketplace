// main server file (where app.listen is)
import 'express-session';

// Extend the session data interface
declare module 'express-session' {
  interface SessionData {
    userId: string;
    user: {
      id: string;
      email: string;
      username: string;
      userType: string;
    };
  }
}

