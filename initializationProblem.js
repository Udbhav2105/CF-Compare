// Asynchronous function to fetch and process data
async function getSolvedProblemsByRating(user_handle) {
    const url = `https://codeforces.com/api/user.status?handle=${user_handle}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Error fetching Codeforces API");
    }

    const data = await response.json();
    const submissions = data.result;

    // Collect ratings
    const ratings = [];
    submissions.forEach(submission => {
        if (submission.verdict === 'OK') {
            const problem = submission.problem;
            const rating = problem.rating;
            if (rating) {
                ratings.push(rating);
            }
        }
    });

    return ratings;
}

// Transform the array of ratings into an array of objects
function transformRatings(ratings) {
    const ratingCountMap = ratings.reduce((acc, rating) => {
        if (acc[rating]) {
            acc[rating]++;
        } else {
            acc[rating] = 1;
        }
        return acc;
    }, {});

    const ratingObjects = Object.keys(ratingCountMap).map(rating => ({
        rating: Number(rating),
        count: ratingCountMap[rating]
    }));

    return ratingObjects;
}

// Usage
async function displayRatings() {
    try {
        const userHandle = 'vaibhavveerwaal';
        const ratings = await getSolvedProblemsByRating(userHandle);
        const ratingObjects = transformRatings(ratings);
        console.log(ratingObjects);
    } catch (error) {
        console.error('Error:', error);
    }
}

displayRatings();
