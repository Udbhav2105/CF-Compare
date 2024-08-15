// Asynchronous function to fetch and process data
async function getSolvedProblemsByRating(user_handle) {
    const url = `https://codeforces.com/api/user.status?handle=${user_handle}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Error fetching Codeforces API");
    }

    const data = await response.json();
    const submissions = data.result;


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


async function displayRatings() {
    try {
        const userHandle = 'vaibhavveerwaal';
        const ratings = await getSolvedProblemsByRating(userHandle);
        const data = transformRatings(ratings);
        console.log(data);

const margin = { top: 20, right: 30, bottom: 40, left: 40 },

    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Append SVG element
const svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Set the scales
const x = d3.scaleBand()
    .domain(data.map(d => d.rating))
    .range([0, width])
    .padding(0.1);

const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([height, 0]);

// Append X axis
svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .selectAll("text")
    .attr("class", "axis-label");

// Append Y axis
svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .attr("class", "axis-label");

// Append bars
svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.rating))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.count));
    } catch (error) {
        console.error('Error:', error);
    }
}
displayRatings();