import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';

const API_BASE_URL = 'http://localhost:5000/api/rankings';

function RankingAnalytics() {
    const [chartData, setChartData] = useState({ series: [], options: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Data Aggregation and Formatting ---
    const formatDataForChart = (rawData) => {
        if (!rawData || rawData.length === 0) return { series: [], options: {} };

        // 1. Group data by metric (e.g., 'NIRF Overall Rank')
        const metrics = rawData.reduce((acc, item) => {
            if (!acc[item.metric]) {
                acc[item.metric] = [];
            }
            acc[item.metric].push({
                x: item.year,
                y: item.value
            });
            return acc;
        }, {});

        // 2. Format into ApexCharts series structure
        const series = Object.keys(metrics).map(metricName => ({
            name: metricName,
            data: metrics[metricName]
        }));
        
        // 3. Define Chart Options
        const options = {
            chart: {
                height: 350,
                type: 'line',
                zoom: { enabled: false },
                toolbar: { show: false },
            },
            dataLabels: { enabled: true },
            stroke: { curve: 'smooth' },
            title: {
                text: 'Multi-Year Institutional Ranking Performance',
                align: 'left'
            },
            grid: { row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 } },
            xaxis: {
                type: 'category', // Treat years as categories
                title: { text: 'Academic Year' },
                categories: [...new Set(rawData.map(item => item.year))], // Unique list of years
            },
            yaxis: {
                title: { text: 'Score / Rank Value' },
                min: 0,
            },
            tooltip: {
                x: { format: 'yyyy' }
            }
        };

        return { series, options };
    };

    // --- Fetching and Processing ---
    const fetchRankingData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_BASE_URL);
            const formattedData = formatDataForChart(response.data);
            setChartData(formattedData);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to fetch ranking data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRankingData();
    }, []);
    
    // --- Mock Data Generation Handler ---
    const handleGenerateMockData = async () => {
        if (!window.confirm("Are you sure you want to generate 15 mock data records? This is only for testing.")) return;
        
        setLoading(true);
        setError(null);
        try {
            await axios.post(`${API_BASE_URL}/generate-mock`);
            await fetchRankingData(); // Refresh chart after generation
        } catch (err) {
            console.error("Mock data error:", err);
            setError("Failed to generate mock data. Check server logs.");
        } finally {
            setLoading(false);
        }
    };


    if (loading) return <div className="p-8 text-center text-blue-500">Loading Ranking Data...</div>;

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2">Institutional Ranking Analytics</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">API Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-yellow-600">
                <p className="text-sm text-gray-600 mb-4">
                    This visualization demonstrates the aggregation and analytical capability of the DBMS, fetching multi-year data from the 'rankings' table to display performance trends (NIRF/UGC).
                </p>
                
                {chartData.series.length === 0 ? (
                    <div className="text-center py-10">
                         <p className="text-gray-600 mb-4">No ranking data found in the database.</p>
                         <button 
                            onClick={handleGenerateMockData}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors shadow-md"
                         >
                            Generate Test Ranking Data (5 Years)
                         </button>
                    </div>
                ) : (
                    <ReactApexChart 
                        options={chartData.options} 
                        series={chartData.series} 
                        type="line" 
                        height={350} 
                    />
                )}
            </div>
        </div>
    );
}

export default RankingAnalytics;