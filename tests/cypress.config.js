import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },

    // Cypress-konfiguraatiot
    baseUrl: 'http://localhost:5173', // sovelluksen sijaintiurl kehitykympäristössä
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}', // polku ja tiedostonimimuoto, jolla Cypress etsii testitiedostot
    supportFile: 'cypress/support/e2e.js', // polku ja tiedostonimimuoto, jolla Cypress etsii supportFilen
    fixturesFolder: 'cypress/fixtures', // polku ja tiedostonimimuoto, jolla Cypress etsii fixtures-kansion
  },
});
