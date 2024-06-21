# Project: Real-Time Chat Application

## Overview
Develop a real-time chat application where users can sign up, log in, join chat rooms, and send/receive messages in real time.

## Requirements

### Frontend
- Use a modern JavaScript framework/library such as ReactJS or AngularJS for building the UI.
- Create responsive pages for user registration, login, and chat interface.
- Implement real-time updates for incoming messages using WebSocket or a similar technology.

### Backend
- Develop the backend using Node.js with Express.js for handling HTTP requests.
- Implement user authentication and authorization using JWT (JSON Web Tokens).
- Manage chat rooms and user sessions in memory or with a database like MongoDB.
- Handle real-time message broadcasting using Socket.IO or a similar library.

### Database
- Choose a database suitable for storing user accounts, chat room metadata, and messages. MongoDB or PostgreSQL can be good choices depending on preference.
- Design the schema for efficient storage and retrieval of chat messages and user information.

## Additional Features (Optional - added for extra points)
- Implement features like typing indicators, read receipts, and online status.
- Add functionality for creating and deleting chat rooms dynamically.
- Ensure secure transmission of messages, considering encryption methods if necessary.

## Evaluation Criteria
- **Functionality**: All features work as described, with real-time capabilities tested thoroughly.
- **Code Quality**: Clean, modular code that follows best practices for the chosen technologies.
- **Security**: Proper implementation of security measures, especially around user authentication and data protection.
- **Scalability**: Consideration for scaling the application, such as handling multiple simultaneous connections efficiently.

## Submission Guidelines
- Provide clear documentation on how to set up and run the application locally.
- Include instructions for testing the application, covering both manual and automated tests if applicable.
- Submit the source code via a Git repository, showcasing proper use of version control.