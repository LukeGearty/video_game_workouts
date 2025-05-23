const http = require('http');
const fs = require('fs');
const path = require('path');
//imports Http to create server, fs for filesystem module, path to safely construct filepaths



//setting up file path _dirname = absolute path to curr directory, sets up full path to /data/workouts.json
const DATA_FILE = path.join(__dirname, 'data', 'workouts.json');


//create the slug
function makeSlug(text) {

    return text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
}

//helper function to parse JSON body
function parseBody(req, callback) {
    //takes in incoming HTTP request object and a function that will be called after the body is parsed
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            callback(null, data);
        } catch (err) {
            callback(err);
        }
    });
}


//creating server
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204); // No Content
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/api/workouts') {
        fs.readFile(path.join(__dirname, 'data', 'workouts.json'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to read workouts. '}));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/submit-workout') {
        // utilize helper function
        parseBody(req, (err, workout) => {
            if (err) { // if there is an error, respond with a 400 (bad request)
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
            }

            fs.readFile(DATA_FILE, 'utf8', (readErr, data) => {
                // try to read JSON file
                let workouts = [];
                if (!readErr && data) {
                    try {
                        workouts = JSON.parse(data);
                    } catch (e) {
                        workouts = [];
                    }
                }

                workout.slug = makeSlug(workout.workoutTitle);
                workouts.push(workout); // add workout

                // save the updated list back to the file
                fs.writeFile(DATA_FILE, JSON.stringify(workouts, null, 2), writeErr => {
                    if (writeErr) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Failed to save workout' }));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Workout saved successfully' }));

                    const TEMPLATE_PATH = path.join(__dirname, 'workouts', 'workout-template.html');

                    fs.readFile(TEMPLATE_PATH, 'utf8', (templateErr, template) => {
                        if (templateErr) {
                            console.error('Error reading template file: ', templateErr);
                            return;
                        }

                        const filledTemplate = template
                            .replace(/{{title}}/g, workout.workoutTitle)
                            .replace(/{{character}}/g, workout.character)
                            .replace(/{{description}}/g, workout.workoutDescription)
                            .replace(/{{difficulty}}/g, workout.difficulty)
                            .replace(/{{exercises}}/g, workout.text.map(ex => `<li>${ex}</li>`).join('\n'));
                    


                        const outputPath = path.join(__dirname, 'workouts', `${workout.slug}.html`);

                        fs.writeFile(outputPath, filledTemplate, (writeTemplateErr) => {
                            if (writeTemplateErr) {
                                console.error('Error writing workout HTML file: ', writeTemplateErr);
                            } else {
                                console.log(`Workout page created: ${outputPath}`);
                            }
                        });
                    });
                });
            });
        });
    } else { // handles other routes, if it's not a POST to submit-workout
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        }
    });



const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});