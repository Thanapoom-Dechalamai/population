import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import poppulationData from './data/population-and-demography.csv';
import { Col, Container, Row } from 'react-bootstrap';
import './App.css';
import RacingBarChart from './component/RacingBarChart';
import { getColor } from './hooks/tools';

const colorCache = {};
const App = () =>
{
  const [csvData, setCsvData] = useState([]);
  const [currentYear, setCurrentYear] = useState(1950);
  const [isPlaying, setIsPlaying] = useState(false);

  let dataMax = 0;
  let totalPop = (Array.isArray(csvData) && csvData?.length > 0) ? parseInt(csvData.filter(item => item["Country name"] === "World").find((item) => parseInt(item.Year) === currentYear).Population).toLocaleString() : 0;

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
      }, 200); // Interval speed: 200 milliseconds
      return () => clearInterval(intervalId);
    }
  }, [currentYear, isPlaying]);

  // Filter data based on the current year and exclude specified country names
  const filteredData = csvData
    .filter(item => item["Country name"] !== "World")
    .filter((item) =>
    {
      if (item.Population > dataMax && parseInt(item.Year) === currentYear)
      {
        dataMax = Math.round(item.Population * 1.15);
      }
      return parseInt(item.Year) === currentYear;
    })
    .sort((a, b) => b.Population - a.Population) // Sort by population in descending order
    .slice(0, 12)
    .reduce((prev, entry) =>
    {
      const color = getColor(entry["Country name"], colorCache);
      return [...prev, {
        name: entry["Country name"],
        value: entry["Population"],
        color
      }];
    }, []);

  return (
    <Container>
      <Row>
        <Col xs={12} className='mt-3' style={{ color: "#404040" }}>
          <div className='fw-bold fs-2'>
            Population growth per country, 1950 to 2021
          </div>
        </Col>
        <Col xs={12} className='align-items-center d-flex'>
          <div className='fw-bold fs-2' style={{ color: "#404040" }}>
            Year: {currentYear}
            <div className='fs-4'>
              Total: {totalPop}
            </div>
          </div>

        </Col>
        <Col className='mt-5 mb-5'>
          <RacingBarChart data={filteredData} dom={[0, dataMax]} />
        </Col>

        <div className='d-flex align-items-center'>
          <button className='rounded timelapse-button' onClick={() =>
          {
            if (currentYear === 2021)
            {
              setCurrentYear(1950);
            }
            setIsPlaying(!isPlaying);
          }}>
            {isPlaying ?
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pause-fill" viewBox="0 0 16 16">
                  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
                </svg>
                <span className='ms-2'>
                  Pause time-lapse
                </span>
              </> :
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play-fill" viewBox="0 0 16 16">
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                </svg>
                <span className='ms-2'>
                  Play time-lapse
                </span>
              </>
            }
          </button>
          <button className='rounded year-button ms-3 me-3' onClick={() =>
          {

            setCurrentYear(1950);
            setIsPlaying(false);
          }}>
            1950
          </button>
          <input
            type="range"
            min="1950"
            max="2021"
            step="1"
            value={currentYear}
            onChange={(e) =>
            {
              setIsPlaying(false);
              setCurrentYear(parseInt(e.target.value));
            }}
            title={currentYear}
            style={{
              width: "70%",
            }}
          />
          <button className='rounded year-button ms-3' onClick={() =>
          {

            setCurrentYear(2021);
            setIsPlaying(false);
          }}>
            2021
          </button>
        </div>
      </Row>
    </Container>
  );
};

export default App;
