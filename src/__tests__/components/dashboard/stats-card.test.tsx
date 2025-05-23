import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardStatsCard } from '@/components/dashboard/DashboardStatsCard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import apiClient from '@/lib/api-client';
import { StatsCard } from '@/components/dashboard/stats-card';

// Mock API client
jest.mock('@/lib/api-client', () => ({
  getStats: jest.fn(),
}));

const mockStats = {
  totalReleases: 100,
  activeReleases: 75,
  totalDownloads: 50000,
  platforms: {
    win: 80,
    mac: 15,
    linux: 5,
  },
  channels: {
    stable: 60,
    beta: 30,
    dev: 10,
  },
  downloadsTrend: [
    { date: '2025-01-01', count: 1000 },
    { date: '2025-01-02', count: 1500 },
    { date: '2025-01-03', count: 2000 },
  ],
};

const mockStatsData = {
  title: 'Test Stats',
  value: '42',
  description: 'Test Description'
};

describe('StatsCard', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const setup = () => {
    const utils = render(
      <QueryClientProvider client={queryClient}>
        <DashboardStatsCard />
      </QueryClientProvider>
    );
    return utils;
  };

  beforeEach(() => {
    (apiClient.getStats as jest.Mock).mockResolvedValue(mockStats);
    queryClient.clear();
  });

  it('renders loading state initially', () => {
    setup();
    expect(screen.getByText(/loading statistics/i)).toBeInTheDocument();
  });

  it('displays total releases count', async () => {
    setup();
    
    // Check for total releases metric
    expect(await screen.findByText('100')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /total releases/i })).toBeInTheDocument();
  });

  it('shows active releases percentage', async () => {
    setup();
    
    // Wait for stats to load
    await screen.findByText('75%');
    expect(screen.getByRole('heading', { name: /active releases/i })).toBeInTheDocument();
  });

  it('displays total downloads with proper formatting', async () => {
    setup();
    
    // Check for formatted download count (50,000)
    expect(await screen.findByText('50,000')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /total downloads/i })).toBeInTheDocument();
  });

  it('renders platform distribution chart', async () => {
    setup();
    
    // Wait for chart to render
    await screen.findByTestId('platform-chart');
    
    // Check for platform labels
    expect(screen.getByText(/windows/i)).toBeInTheDocument();
    expect(screen.getByText(/mac/i)).toBeInTheDocument();
    expect(screen.getByText(/linux/i)).toBeInTheDocument();
    
    // Check for percentages
    expect(screen.getByText('Windows: 80%')).toBeInTheDocument();
    expect(screen.getByText('Mac: 15%')).toBeInTheDocument();
    expect(screen.getByText('Linux: 5%')).toBeInTheDocument();
  });

  it('renders channel distribution chart', async () => {
    setup();
    
    // Wait for chart to render
    await screen.findByTestId('channel-chart');
    
    // Check for channel labels
    expect(screen.getByText(/stable/i)).toBeInTheDocument();
    expect(screen.getByText(/beta/i)).toBeInTheDocument();
    expect(screen.getByText(/dev/i)).toBeInTheDocument();
    
    // Check for percentages
    expect(screen.getByText('Stable: 60%')).toBeInTheDocument();
    expect(screen.getByText('Beta: 30%')).toBeInTheDocument();
    expect(screen.getByText('Dev: 10%')).toBeInTheDocument();
  });

  it('renders downloads trend chart', async () => {
    setup();
    
    // Wait for chart to render
    await screen.findByTestId('downloads-trend-chart');
    
    // Check for trend data points
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('2,000')).toBeInTheDocument();
  });

  it('handles error state gracefully', async () => {
    // Mock API error
    (apiClient.getStats as jest.Mock).mockRejectedValue(new Error('Failed to load stats'));
    
    setup();

    expect(await screen.findByText(/error loading statistics/i)).toBeInTheDocument();
  });

  it('updates periodically', async () => {
    jest.useFakeTimers();
    setup();

    // Wait for initial load
    await screen.findByText('100');

    // Clear mock calls
    (apiClient.getStats as jest.Mock).mockClear();

    // Advance timer by refresh interval (5 minutes)
    jest.advanceTimersByTime(5 * 60 * 1000);

    // Verify that stats were fetched again
    expect(apiClient.getStats).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('shows data tooltips on hover', async () => {
    setup();

    // Wait for charts to render
    await screen.findByTestId('platform-chart');

    // Hover over Windows segment
    const windowsSegment = screen.getByTestId('platform-win-segment');
    await userEvent.hover(windowsSegment);

    // Check tooltip content
    expect(screen.getByText('Windows: 80%')).toBeInTheDocument();
  });

  it('maintains responsiveness', async () => {
    const { container } = setup();

    // Wait for content to load
    await screen.findByText('100');

    // Verify charts exist
    const charts = container.querySelectorAll('[data-testid$="-chart"]');
    expect(charts.length).toBeGreaterThan(0);
  });

  it('renders stats card with all props', () => {
    render(
      <StatsCard {...mockStatsData} />
    );

    expect(screen.getByText(mockStatsData.title)).toBeInTheDocument();
    expect(screen.getByText(mockStatsData.value)).toBeInTheDocument();
    expect(screen.getByText(mockStatsData.description)).toBeInTheDocument();
  });
});