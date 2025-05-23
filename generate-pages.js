const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'workouts.json');
const TEMPLATE_FILE = path.join(__dirname, 'workouts', 'workout-template.html');
const OUTPUT_DIR = path.join(__dirname, 'workouts');


const workouts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

function makeSlug(text) {
    return text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
}


workouts.forEach(workout => {
    const slug = workout.slug || makeSlug(workout.workoutTitle);
    const outpath = path.join(OUTPUT_DIR, `${slug}.html`);

    if (fs.existsSync(outpath)) {
        console.log(`Skipping (already exists): ${outpath}`);
        return;
    }

    const filled = template
        .replace(/{{title}}/g, workout.workoutTitle)
        .replace(/{{character}}/g, workout.character)
        .replace(/{{description}}/g, workout.workoutDescription)
        .replace(/{{difficulty}}/g, workout.difficulty)
        .replace(/{{exercises}}/g, (workout.text || []).map(ex => `<li>${ex}</li>`).join('\n'));

    

    fs.writeFileSync(outpath, filled);
    console.log(`Created: ${outpath}`);
})