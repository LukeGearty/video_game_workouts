const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'workouts.json');
const TEMPLATE_FILE = path.join(__dirname, 'workouts', 'workout-template.html');
const OUTPUT_DIR = path.join(__dirname, 'workouts');

const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

let workouts;

try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    workouts = JSON.parse(data);
} catch (err) {
    console.error('Failed to load workouts.json', err);
    process.exit(1);
}

function makeSlug(text) {
    return text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
}


workouts.forEach(workout => {
    const slug = workout.slug || makeSlug(workout.workoutTitle);

    const filled = template
        .replace(/{{title}}/g, workout.workoutTitle)
        .replace(/{{character}}/g, workout.character)
        .replace(/{{description}}/g, workout.workoutDescription)
        .replace(/{{difficulty}}/g, workout.difficulty || 'Unknown')
        .replace(/{{exercises}}/g, workout.text.map(ex => `<li>${ex}</li>`).join('\n'));

    const outputPath = path.join(OUTPUT_DIR, `${slug}.html`);
    fs.writeFileSync(outputPath, filled, 'utf8');
    console.log(`Updated: ${slug}.html`);
});