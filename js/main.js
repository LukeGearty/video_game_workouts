function fetchWorkouts() {
    fetch('data/workouts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status ${response.status}`);
            }
            return response.json();
        })
        .then(workouts => {
            console.log(workouts);
            const container = document.getElementById('workout-list');

            workouts.forEach(workout => {
                const div = document.createElement('div');
                div.classList.add('workout-card');


                div.innerHTML = `
                <a href="workouts/${workout.slug}.html">${workout.workoutTitle}</a>
                `;

                container.appendChild(div);
            })
        })
        .catch(error => console.error('Failed to fetch data: ', error));
}


window.addEventListener('DOMContentLoaded', fetchWorkouts);

