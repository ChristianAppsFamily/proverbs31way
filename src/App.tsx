import { Routes, Route } from "react-router";
import LandingV1 from "@/pages/LandingV1";
import HomePage from "@/pages/Home";
import GardenPage from "@/pages/Garden";
import TablePage from "@/pages/Table";
import WellPage from "@/pages/Well";
import LetterPage from "@/pages/Letter";
import SanctuaryPage from "@/pages/Sanctuary";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingV1 />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/garden" element={<GardenPage />} />
      <Route path="/table" element={<TablePage />} />
      <Route path="/well" element={<WellPage />} />
      <Route path="/letter" element={<LetterPage />} />
      <Route path="/sanctuary" element={<SanctuaryPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
