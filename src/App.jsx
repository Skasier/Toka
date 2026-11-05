import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import Join from "./Pages/Join/Join";
import Membership from './Pages/Membership/Membership'
import Dashboard from "./Pages/Dashboard/Dashboard";
import Classes from "./Pages/Classes/Classes";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/join" element={<Join />} />
          <Route path="/membership" element={<Membership/>} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
