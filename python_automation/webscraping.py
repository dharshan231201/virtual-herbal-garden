import requests
from bs4 import BeautifulSoup

def scrape_headlines(url):
    try:
        response = requests.get(url) # the response will give the status and response.txt will give the raw html page in order to convert the raw html to data we use beautiful soup
        response.raise_for_status()  # if there is any error then it directly goes to excption block
        soup = BeautifulSoup(response.text, 'html.parser')

        headlines = soup.find_all('h2')
        # Print the headlines with line numbers)
        # Use enumerate to get both the index (i) and the headline element
        for i, headline in enumerate(headlines): # Start counting from 1
            print(f"{i}. {headline.text.strip()}")

    except requests.exceptions.RequestException as e:
        print(f"Error during request: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

scrape_headlines('https://www.indiatoday.in')