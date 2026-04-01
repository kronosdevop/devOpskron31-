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

// Function to fix Vue 3 breaking changes
function fixVue3Issues(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Fix $listeners usage (removed in Vue 3)
        // Replace $listeners with $attrs for event listeners
        const listenersPattern = /\$listeners/g;
        if (content.includes('$listeners')) {
            content = content.replace(listenersPattern, '$attrs');
            modified = true;
        }

        // Fix v-on.native (removed in Vue 3)
        // Remove .native modifier as it's no longer needed
        const nativePattern = /v-on:([^=]+)\.native/g;
        if (content.includes('.native')) {
            content = content.replace(nativePattern, 'v-on:$1');
            modified = true;
        }

        // Fix $children (removed in Vue 3)
        // This is a breaking change that needs manual review
        if (content.includes('$children')) {
            // console.log(`Warning: $children usage found in ${filePath} - needs manual review`);
        }

        // Fix $on, $off, $once (removed in Vue 3)
        // These need to be replaced with external event bus or other patterns
        if (content.includes('$on') || content.includes('$off') || content.includes('$once')) {
            // console.log(`Warning: $on/$off/$once usage found in ${filePath} - needs manual review`);
        }

        // Fix filters (removed in Vue 3)
        // Replace filters with computed properties or methods
        if (content.includes('|')) {
            // This is a simple check, but filters need manual review
            // console.log(`Warning: Possible filter usage found in ${filePath} - needs manual review`);
        }

        // Fix v-slot syntax (shorthand available in Vue 3)
        // Replace v-slot: with # for shorthand
        const vSlotPattern = /v-slot:([a-zA-Z][a-zA-Z0-9_]*)/g;
        if (content.includes('v-slot:')) {
            content = content.replace(vSlotPattern, '#$1');
            modified = true;
        }

        // Fix v-slot without name (default slot)
        const vSlotDefaultPattern = /v-slot(?!:)/g;
        if (content.includes('v-slot') && !content.includes('v-slot:')) {
            content = content.replace(vSlotDefaultPattern, '#default');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            // console.log(`Fixed Vue 3 issues: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Function to find and fix all Vue files
function fixAllVue3Issues() {
    const vueFiles = findVueFiles('src');
    let fixedCount = 0;

    // console.log(`Found ${vueFiles.length} Vue files to process for Vue 3 issues...`);

    vueFiles.forEach(filePath => {
        if (fixVue3Issues(filePath)) {
            fixedCount++;
        }
    });

    // console.log(`\nFixed ${fixedCount} files with Vue 3 compatibility issues.`);
}

// Run the fix
fixAllVue3Issues(); 