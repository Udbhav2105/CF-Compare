import requests
from collections import defaultdict

def get_solved_problems_by_rating(user_handle):
    url = f"https://codeforces.com/api/user.status?handle=vaibhavveerwaal"
    response = requests.get(url)
    
    if response.status_code != 200:
        raise Exception("Error fetching data from Codeforces API")

    submissions = response.json()['result']
    
    rating_count = defaultdict(int)
    
    for submission in submissions:
        if submission['verdict'] == 'OK':
            problem = submission['problem']
            rating = problem.get('rating')
            if rating:
                rating_count[rating] += 1
    
    return rating_count

# Example usage:
user_handle = "tourist"
rating_distribution = get_solved_problems_by_rating(user_handle)

for rating, count in sorted(rating_distribution.items()):
    print(f"Rating {rating}: {count} problems solved")
