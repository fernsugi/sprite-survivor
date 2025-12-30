#!/usr/bin/env node
// Import CSV translations back into i18n.js
// Usage: node import-translations-csv.js translations.csv

const fs = require('fs');
const path = require('path');

const csvPath = process.argv[2] || 'translations.csv';
const i18nPath = path.join(__dirname, 'js', 'i18n.js');

// Parse CSV (handles quoted fields with commas and escaped quotes)
function parseCSV(content) {
    const rows = [];
    const lines = content.split('\n');

    for (const line of lines) {
        if (!line.trim()) continue;

        const row = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (inQuotes) {
                if (char === '"') {
                    if (line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    row.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
        }
        row.push(current);
        rows.push(row);
    }

    return rows;
}

// Read CSV
const csvContent = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(csvContent);

if (rows.length < 2) {
    console.error('CSV must have header row and at least one data row');
    process.exit(1);
}

// Parse header to get languages
const header = rows[0];
const languages = header.slice(1); // First column is 'key'

// Build translations object
const translations = {};
languages.forEach(lang => {
    translations[lang] = {};
});

for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const key = row[0];
    if (!key) continue;

    for (let j = 0; j < languages.length; j++) {
        const lang = languages[j];
        const value = row[j + 1] || '';
        if (value) {
            translations[lang][key] = value;
        }
    }
}

// Generate formatted JSON for each language
function formatTranslations(translations) {
    let result = 'const translations = {\n';

    const langs = Object.keys(translations);
    langs.forEach((lang, langIndex) => {
        result += `  "${lang}": {\n`;

        const keys = Object.keys(translations[lang]);
        keys.forEach((key, keyIndex) => {
            const value = translations[lang][key];
            const escapedValue = value
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');

            result += `    "${key}": "${escapedValue}"`;
            result += keyIndex < keys.length - 1 ? ',\n' : '\n';
        });

        result += langIndex < langs.length - 1 ? '  },\n' : '  }\n';
    });

    result += '};';
    return result;
}

// Read current i18n.js
let i18nContent = fs.readFileSync(i18nPath, 'utf8');

// Replace translations object
const translationsStr = formatTranslations(translations);
const regex = /const translations\s*=\s*\{[\s\S]*?\n\};/;

if (!regex.test(i18nContent)) {
    console.error('Could not find translations object in i18n.js');
    process.exit(1);
}

i18nContent = i18nContent.replace(regex, translationsStr);

// Write back
fs.writeFileSync(i18nPath, i18nContent, 'utf8');

console.log(`Updated i18n.js with ${Object.keys(translations).length} languages and ${Object.keys(translations[languages[0]]).length} keys`);
