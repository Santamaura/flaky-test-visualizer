import React, { useState } from 'react';
import FlakyTestVisualizer from "./ui/flakyTestVisualizer";
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData ] = useState (null);
  const getData = () => {
    setLoading(true);
    fetch("api/flaky_tests")
    .then(validateResponse)
    .then((res) => res.json())
    .then((response) => setData(response.data));
    setLoading(false);
  }
  const validateResponse = (response: Response) => {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    setLoading(false);
    const error = new Error(`HTTP Error ${response.statusText}`);
    throw error;
  }
  return (
    <div className="App">
      <FlakyTestVisualizer data={data} getData={getData} loading={loading} />
    </div>
  );
}

export default App;
