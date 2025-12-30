#!/usr/bin/env node
// Generate CSV from i18n translations
// Usage: node generate-translations-csv.js > translations.csv

const fs = require('fs');
const path = require('path');

// Read and evaluate i18n.js to extract translations
const i18nPath = path.join(__dirname, 'js', 'i18n.js');
const i18nContent = fs.readFileSync(i18nPath, 'utf8');

// Extract the translations object using regex
const translationsMatch = i18nContent.match(/const translations\s*=\s*(\{[\s\S]*?\n\};)/);
if (!translationsMatch) {
    console.error('Could not find translations object');
    process.exit(1);
}

// Evaluate the translations object
const translations = eval('(' + translationsMatch[1].slice(0, -1) + ')');

// Get all languages and all keys
const languages = Object.keys(translations);
const allKeys = new Set();
languages.forEach(lang => {
    Object.keys(translations[lang]).forEach(key => allKeys.add(key));
});
const keys = Array.from(allKeys).sort();

// CSV escape function
function escapeCSV(value) {
    if (value === undefined || value === null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

// Generate CSV
const header = ['key', ...languages].map(escapeCSV).join(',');
console.log(header);

keys.forEach(key => {
    const row = [key, ...languages.map(lang => translations[lang]?.[key] || '')];
    console.log(row.map(escapeCSV).join(','));
});
