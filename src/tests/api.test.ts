import { fetchRandomQuote } from '../utils/api';

// Mock the global fetch function
global.fetch = jest.fn();
console.warn = jest.fn(); // Mock console.warn to keep test output clean

describe('fetchRandomQuote', () => {
    beforeEach(() => {
        // Clear mocks before each test
        (global.fetch as jest.Mock).mockClear();
        (console.warn as jest.Mock).mockClear();
    });

    it('should fetch quote from FavQs API successfully', async () => {
        const mockApiResponse = {
            qotd_date: '2025-03-28T00:00:00.000+00:00',
            quote: {
                body: 'Test quote',
                author: 'Test Author'
            }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockApiResponse)
        });

        const quote = await fetchRandomQuote();
        expect(quote).toBe('Test quote - Test Author');
        expect(global.fetch).toHaveBeenCalledWith('https://favqs.com/api/qotd');
        expect(console.warn).not.toHaveBeenCalled();
    });

    it('should fallback to local quotes when API request fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        const quote = await fetchRandomQuote();
        expect(quote).toBeTruthy(); // Should return a fallback quote
        expect(quote).toContain(' - '); // Should contain author separator
        expect(global.fetch).toHaveBeenCalledWith('https://favqs.com/api/qotd');
        expect(console.warn).toHaveBeenCalledWith(
            'FavQs API failed, falling back to local quotes:',
            expect.any(Error)
        );
    });

    it('should fallback to local quotes when API returns non-ok response', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false
        });

        const quote = await fetchRandomQuote();
        expect(quote).toBeTruthy();
        expect(quote).toContain(' - ');
        expect(global.fetch).toHaveBeenCalledWith('https://favqs.com/api/qotd');
        expect(console.warn).toHaveBeenCalled();
    });
});
