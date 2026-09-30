import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home";
import TrainDetails from "./pages/TrainDetails";

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/train/:trainNo"
          element={<TrainDetails />}
        />

      </Routes>

    </BrowserRouter>

  );

}