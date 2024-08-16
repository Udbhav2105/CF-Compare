async function getSolvedProblemsByRating(user_handles) {
    const ratingsMap = {};
    for (const user_handle of user_handles) {
        const url = `https://codeforces.com/api/user.status?handle=${user_handle}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching Codeforces API for ${user_handle}`);
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

        ratingsMap[user_handle] = transformRatings(ratings);
    }
    return ratingsMap;
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

async function displayRatings(username1,username2) {
    try {
        const userHandles = [username1, username2];
        const ratingsMap = await getSolvedProblemsByRating(userHandles);

        const margin = { top: 20, right: 30, bottom: 40, left: 60 },
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        const svg = d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const allRatings = userHandles.flatMap(handle => 
            ratingsMap[handle].map(d => ({ ...d, user: handle }))
        );

        const x0 = d3.scaleBand()
            .domain(allRatings.map(d => d.rating))
            .range([0, width])
            .padding(0.1);

        const x1 = d3.scaleBand()
            .domain(userHandles)
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, d3.max(allRatings, d => d.count)])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x0).tickFormat(d3.format("d")))
            .selectAll("text")
            .attr("class", "axis-label");

        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .attr("class", "axis-label");

        const color = d3.scaleOrdinal()
            .domain(userHandles)
            .range(['steelblue', 'orange']);

        svg.selectAll(".bar")
            .data(allRatings)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x0(d.rating) + x1(d.user))
            .attr("y", d => y(d.count))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.count))
            .attr("fill", d => color(d.user));

        // Add legend
        const legend = d3.select("#legend")
            .selectAll(".legend-item")
            .data(userHandles)
            .enter()
            .append("div")
            .attr("class", "legend-item");

        legend.append("div")
            .attr("class", "legend-color")
            .style("background-color", d => color(d));

        legend.append("span")
            .text(d => d);
        
    } catch (error) {
        console.error('Error:', error);
    }
}


const form = document.getElementById('username-form');
const usernameInput1 = document.getElementById('username-input1');
const usernameInput2 = document.getElementById('username-input2');
const graph = document.getElementById("graph");
const legend = document.getElementById('legend');

const browserAPI = window.chrome || window.browser;

// To save default User name
function saveDefaultUsername(username) {
    chrome.storage.sync.set({ defaultUsername: username }, function() {
        console.log('Default username saved:', username);
    });
}

// Function to load the default username
function loadDefaultUsername(callback) {
    chrome.storage.sync.get(['defaultUsername'], function(result) {
        if (result.defaultUsername) {
            callback(result.defaultUsername);
        } else {
            callback(null);
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
        
try {
    let defaultUserName = '';
    loadDefaultUsername(function(storedUsername) {
        if (storedUsername) {
            document.getElementById('userProfile').textContent = storedUsername;
            defaultUserName = storedUsername;
        }
    });
    
    const tabs = await new Promise((resolve, reject) => {
        browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(tabs);
            }
        });
    });
    
    let currentTab = tabs[0];
    let url = currentTab.url;
    
    const urlSplitted = url.split('/');
    if (urlSplitted[2] === 'codeforces.com' && defaultUserName !== urlSplitted[urlSplitted.length-1]) {
        // Codeforces 
        document.getElementById('userProfile').addEventListener('click',(event)=>{
            event.preventDefault();
            document.getElementById('username-form').style.display = 'none';

        })
        form.style.display = 'none';
        const to_be_compared_with = urlSplitted[urlSplitted.length - 1];
        displayRatings(defaultUserName, to_be_compared_with);
        
        
        const compareButton = document.createElement('button');
        document.getElementById('submitUserProfile').addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById('username-form').style.display = 'none';
            compareButton.style.display = 'block';
        });
        compareButton.textContent = 'Compare More';
        compareButton.classList.add('button-33');
        form.insertAdjacentElement('afterend', compareButton);
        compareButton.addEventListener('click', function () {
            form.style.display = 'block';
            compareButton.style.display = 'none';
            });
            
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                graph.innerHTML = "";
                legend.innerHTML = "";
                const username1 = usernameInput1.value;
                const username2 = usernameInput2.value;
                displayRatings(username1, username2);
            });
        } else {
            // Not Codeforces
            document.getElementById('userProfile').addEventListener('click',(event)=>{
                event.preventDefault();
                document.getElementById('username-form').style.display = 'none';
                
            })
            document.getElementById('submitUserProfile').addEventListener('click', (event) => {
                event.preventDefault();
                document.getElementById('username-form').style.display = 'block';
            });

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                graph.innerHTML = "";
                legend.innerHTML = "";
                const username1 = usernameInput1.value;
                const username2 = usernameInput2.value;
                displayRatings(username1, username2);
            });
        }
    }   catch (error) {
        console.error('Error fetching URL or processing tabs:', error);
    }
    });

    
    document.getElementById('userProfileInput').style.display = 'none';
    document.getElementById('userProfile').addEventListener('click', () => {
        document.getElementById('userProfileInput').style.display = 'block';
    });
    
    document.getElementById('submitUserProfile').addEventListener('click', (event) => {
        event.preventDefault();
        location.reload();
        const username = document.getElementById('username').value;
        defaultName = username;
        document.getElementById('userProfile').innerText = defaultName;
        saveDefaultUsername(defaultName);
        document.getElementById('userProfileInput').style.display = 'none';
    });