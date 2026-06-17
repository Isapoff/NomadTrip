import { Routes, Route, useLocation } from "react-router";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import RoutesPage from "@/pages/RoutesPage";
import MapPage from "@/pages/MapPage";
import QuizPage from "@/pages/QuizPage";
import ResultsPage from "@/pages/ResultsPage";
import BuilderPage from "@/pages/BuilderPage";
import GuesthousesPage from "@/pages/GuesthousesPage";
import ProviderPage from "@/pages/ProviderPage";
import { useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-[#0A1017]">
              <Navbar />
              <main className="pt-16">
                <Routes>
                  <Route path="/routes" element={<RoutesPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/quiz" element={<QuizPage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/builder" element={<BuilderPage />} />
                  <Route path="/guesthouses" element={<GuesthousesPage />} />
                  <Route path="/provider" element={<ProviderPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </>
  );
}
