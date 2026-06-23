module.exports = {
  ci: {
    collect: {
      // Command to start the production server for the audit
      startServerCommand: 'npm run start',
      // Wait for the ready message in Next.js logs
      startServerReadyPattern: 'Ready in',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/privacy',
        'http://localhost:3000/terms'
      ],
      numberOfRuns: 1,
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
