import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MantineProvider } from '@mantine/core';
import taskReducer from '../store/taskSlice';
import { QuoteDisplay } from '../components/QuoteDisplay';

// Mock fetch for quote API
global.fetch = jest.fn();
console.warn = jest.fn(); // Suppress console warnings in tests

const createTestStore = (initialQuote: string = '') => {
    return configureStore({
        reducer: {
            tasks: taskReducer,
        },
        preloadedState: {
            tasks: {
                tasks: [],
                filter: 'all' as 'all' | 'completed' | 'pending',
                quote: initialQuote
            }
        }
    });
};

const renderWithProviders = (component: React.ReactElement, initialQuote: string = '') => {
    const store = createTestStore(initialQuote);
    return {
        ...render(
            <Provider store={store}>
                <MantineProvider>
                    {component}
                </MantineProvider>
            </Provider>
        ),
        store,
    };
};

describe('QuoteDisplay', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
        (console.warn as jest.Mock).mockClear();
    });

    it('fetches and displays quote from API', async () => {
        const mockQuote = {
            qotd_date: '2025-03-28T00:00:00.000+00:00',
            quote: {
                body: 'Test quote',
                author: 'Test Author'
            }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockQuote)
        });

        renderWithProviders(<QuoteDisplay />);

        // Wait for quote to be displayed
        const quoteText = await screen.findByText('Test quote - Test Author');
        expect(quoteText).toBeInTheDocument();
        expect(global.fetch).toHaveBeenCalledWith('https://favqs.com/api/qotd');
    });

    it('displays fallback quote when API fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        renderWithProviders(<QuoteDisplay />);

        // Wait for fallback quote to be displayed
        const quoteText = await screen.findByText(/./); // Match any text
        expect(quoteText).toBeInTheDocument();
        expect(quoteText.textContent).toContain(' - '); // Should contain author separator
        expect(console.warn).toHaveBeenCalled(); // Should log warning about fallback
    });

    it('displays existing quote from store', () => {
        const existingQuote = 'Existing Quote - Author';
        renderWithProviders(<QuoteDisplay />, existingQuote);

        expect(screen.getByText(existingQuote)).toBeInTheDocument();
    });

    it('has italic styling', () => {
        renderWithProviders(<QuoteDisplay />);
        const quoteElement = screen.getByText(/./);
        expect(quoteElement).toHaveStyle({ fontStyle: 'italic' });
    });
});
