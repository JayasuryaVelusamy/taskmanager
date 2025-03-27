interface FavQsResponse {
    qotd_date: string;
    quote: {
        body: string;
        author: string;
    };
}

const FAVQS_API = 'https://favqs.com/api/qotd';

const FALLBACK_QUOTES = [
    'The only way to do great work is to love what you do. - Steve Jobs',
    'Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill',
    'Innovation distinguishes between a leader and a follower. - Steve Jobs',
    'Stay hungry, stay foolish. - Steve Jobs',
    'The best way to predict the future is to create it. - Peter Drucker',
    'Quality is not an act, it is a habit. - Aristotle',
    'Success usually comes to those who are too busy to be looking for it. - Henry David Thoreau',
    'Don\'t watch the clock; do what it does. Keep going. - Sam Levenson',
    'Your time is limited, don\'t waste it living someone else\'s life. - Steve Jobs',
    'The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt'
];

const getFavQuote = async (): Promise<string> => {
    try {
        const response = await fetch(FAVQS_API);
        if (!response.ok) throw new Error('API request failed');
        const data: FavQsResponse = await response.json();
        return `${data.quote.body} - ${data.quote.author}`;
    } catch (error) {
        throw error;
    }
};

const getFallbackQuote = (): string => {
    const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
    return FALLBACK_QUOTES[randomIndex];
};

export const fetchRandomQuote = async (): Promise<string> => {
    try {
        return await getFavQuote();
    } catch (error) {
        console.warn('FavQs API failed, falling back to local quotes:', error);
        return getFallbackQuote();
    }
};
