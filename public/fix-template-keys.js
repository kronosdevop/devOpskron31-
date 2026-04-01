const fs = require('fs');
const path = require('path');

// Function to recursively find all .vue files
function findVueFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findVueFiles(filePath, fileList);
        } else if (file.endsWith('.vue')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Function to fix template key placement issues
function fixTemplateKeys(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Pattern to match template v-for with key on child element
        // This matches: <template v-for="..."> <element :key="...">
        const templateKeyPattern = /<template\s+v-for="([^"]+)"([^>]*)>\s*<([^>]+)\s+:key="([^"]+)"([^>]*)>/g;

        content = content.replace(templateKeyPattern, (match, vForContent, templateAttrs, elementName, keyValue, elementAttrs) => {
            modified = true;
            // Move key to template tag and remove from child element
            return `<template v-for="${vForContent}" :key="${keyValue}"${templateAttrs}>\n        <${elementName}${elementAttrs}>`;
        });

        // Also handle cases where there might be multiple lines
        const multiLinePattern = /<template\s+v-for="([^"]+)"([^>]*)>\s*\n\s*<([^>]+)\s+:key="([^"]+)"([^>]*)>/g;

        content = content.replace(multiLinePattern, (match, vForContent, templateAttrs, elementName, keyValue, elementAttrs) => {
            modified = true;
            return `<template v-for="${vForContent}" :key="${keyValue}"${templateAttrs}>\n        <${elementName}${elementAttrs}>`;
        });

        // Handle cases where key might be on a different line
        const keyOnNewLinePattern = /<template\s+v-for="([^"]+)"([^>]*)>\s*\n\s*<([^>]+)[^>]*>\s*\n\s*:key="([^"]+)"/g;

        content = content.replace(keyOnNewLinePattern, (match, vForContent, templateAttrs, elementName, keyValue) => {
            modified = true;
            return `<template v-for="${vForContent}" :key="${keyValue}"${templateAttrs}>\n        <${elementName}>`;
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            // console.log(`Fixed template keys: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Function to find and fix all Vue files
function fixAllTemplateKeys() {
    const vueFiles = findVueFiles('src');
    let fixedCount = 0;

    // console.log(`Found ${vueFiles.length} Vue files to process for template key issues...`);

    vueFiles.forEach(filePath => {
        if (fixTemplateKeys(filePath)) {
            fixedCount++;
        }
    });

    // console.log(`\nFixed ${fixedCount} files with template key placement issues.`);
}

// Run the fix
fixAllTemplateKeys(); 