import React, { useState, useEffect, useCallback } from 'react';
import { Bar, XAxis, YAxis, ComposedChart, LabelList, Cell } from 'recharts';
import Papa from 'papaparse';
import poppulationData from './data/population-and-demography.csv';

const App = () =>
{
  const [csvData, setCsvData] = useState([]);
  const [currentYear, setCurrentYear] = useState(1950);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() =>
  {
    // Load the CSV data here
    Papa.parse(poppulationData, {
      download: true,
      header: true,
      complete: (result) =>
      {
        setCsvData(result.data);
      },
    });
  }, []);

  const handlePlayClick = useCallback(() => setIsPlaying(true), []);
  const handleStopClick = useCallback(() => setIsPlaying(false), []);

  useEffect(() =>
  {
    if (isPlaying)
    {
      const intervalId = setInterval(() =>
      {
        const nextYear = currentYear + 1;
        if (nextYear <= 2021)
        {
          setCurrentYear(nextYear);
        } else
        {
          setIsPlaying(false);
        }
      }, 100); // Interval speed: 100 milliseconds
      return () => clearInterval(intervalId);
    }
  }, [currentYear, isPlaying]);

  let dataMax = 0;
  // Filter data based on the current year and exclude specified country names
  const filteredData = csvData
    .filter((item) =>
    {
      if (item.Population > dataMax && item.Year == currentYear)
        dataMax = item.Population * 1.15;
      return item.Year == currentYear;
    })
    .sort((a, b) => b.Population - a.Population) // Sort by population in descending order
    .slice(0, 12); // Select the top 12 countries

  const colorCache = {};

  function simpleHash(str)
  {
    let hash = 0;
    for (let i = 0; i < str.length; i++)
    {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  const getColor = (seed) =>
  {
    if (colorCache[seed])
    {
      // If the color for the given seed is already cached, return it.
      return colorCache[seed];
    } else
    {
      // Use the simple hash function to derive color components
      const hash = simpleHash(seed);

      const rPart = (hash & 0xFF0000) >> 16;
      const gPart = (hash & 0x00FF00) >> 8;
      const bPart = hash & 0x0000FF;

      // Construct the color string
      const color = `#${rPart.toString(16).padStart(2, '0')}${gPart.toString(16).padStart(2, '0')}${bPart.toString(16).padStart(2, '0')}`;

      // Cache the color for the seed
      colorCache[seed] = color;

      return color;
    }
  };

  filteredData.forEach((dataPoint) =>
  {
    dataPoint.color = getColor(dataPoint["Country name"]);
    console.log(dataPoint.color);
  });

  return (
    <>
      <button onClick={handlePlayClick}>Play</button>
      <button onClick={handleStopClick}>Stop</button>
      <p>Current Year: {currentYear}</p>
      <ComposedChart
        layout="vertical"
        width={1500} // Adjust the size as needed
        height={400} // Adjust the size as needed
        data={filteredData}
        margin={{
          top: 20,
          right: 100,
          bottom: 20,
          left: 50,
        }}
      >
        <XAxis type="number"
          domain={[1000000, dataMax]}
          allowDataOverflow
        />
        <YAxis dataKey="Country name" type="category" />
        <Bar dataKey="Population" barSize={20} fill="#8080ff">
          <LabelList
            fill="gray"
            dataKey="Population"
            position="right"
            formatter={(value) =>
            {
              value = parseInt(value);
              console.log(value.toLocaleString());
              return new Date().getTime() / 1000;
            }}

          />
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </ComposedChart>
    </>
  );
};

export default App;
