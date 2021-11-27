import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Label,
} from "recharts";

function PM10Plot({ locationData }) {
  console.log(locationData);

  return (
    <LineChart width={300} height={400} data={locationData}>
      <Line type="monotone" dataKey="pm2_5" stroke="#8884d8" />
      <Line type="monotone" dataKey="pm10" stroke="#84d888" />
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="timestamp">
        <Label
          value="Timestamp"
          offset={0}
          position="insideBottom"
          fill="#c4c1c1"
        />
      </XAxis>
      <YAxis>
        <Label
          value="PM10 / PM2.5"
          offset={10}
          angle={-90}
          position="insideLeft"
          fill="#c4c1c1"
        />
      </YAxis>
      <Tooltip />
    </LineChart>
  );
}

export default PM10Plot;
