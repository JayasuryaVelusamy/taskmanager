import React, { useEffect } from 'react';
import { Text } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchRandomQuote } from '../utils/api';
import { setQuote } from '../store/taskSlice';

export const QuoteDisplay: React.FC = React.memo(() => {
    const quote = useAppSelector(state => state.tasks.quote);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const loadQuote = async () => {
            const newQuote = await fetchRandomQuote();
            dispatch(setQuote(newQuote));
        };
        loadQuote();
    }, [dispatch]);

    return (
        <Text c="dimmed" ta="center" style={{ fontStyle: 'italic' }}>
            {quote}
        </Text>
    );
});

QuoteDisplay.displayName = 'QuoteDisplay';
