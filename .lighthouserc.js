module.exports = {
  ci: {
    collect: {
      // Command to start the standalone production build
      startServerCommand: 'node .next/standalone/server.js',
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
