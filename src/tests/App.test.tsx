import { render, screen } from '@testing-library/react';
import App from '../App';
import { Provider } from 'react-redux';
import { store } from '../store/store';

test('renders the app', () => {
    render(
        <Provider store={store}>
            <App />
        </Provider>
    );
    const appElement = screen.getByTestId('app');
    expect(appElement).toBeInTheDocument();
});
