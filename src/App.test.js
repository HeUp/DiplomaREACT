import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page with app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/СтройКонтроль/i);
  expect(titleElement).toBeInTheDocument();
});
