import { useState, useEffect } from "react";
import api from "../callApi";
import FormData from "./FormData";
import { jsPDF } from "jspdf";

const Homepage = () => {
  const [data, setData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("/data");
      setData(response?.data?.dataCollections);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  // Convert JSON -> CSV
  const downloadCSV = (tableData, filename = "data.csv") => {
    if (!tableData || tableData.length === 0) return;
    const headers = Object.keys(tableData[0]);
    const csvRows = [headers.join(",")];

    for (const row of tableData) {
      const values = headers.map((header) => {
        const value = row[header];
        if (Array.isArray(value)) return `"${value.join("; ")}"`;
        return `"${value ? String(value).replace(/"/g, '""') : ""}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Convert RAW -> PDF
  const downloadPDF = (rawText, filename = "data.pdf") => {
    const doc = new jsPDF();
    const margin = 10;
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(rawText, 180);
    let y = margin;

    lines.forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 7;
    });

    doc.save(filename);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-1/3 left-2/3 w-96 h-96 bg-cyan-600 rounded-full filter blur-3xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-600 rounded-full filter blur-3xl opacity-20 animate-pulse-slow animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-600 rounded-full filter blur-3xl opacity-20 animate-pulse-slow animation-delay-6000"></div>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${6 + Math.random() * 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Navbar */}
      <header className="w-full px-10 py-4 flex justify-between items-center bg-gray-800/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
          🕷️ WebCrawler AI
        </h1>
        <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 font-semibold rounded-lg shadow-lg cursor-pointer hover:from-cyan-500 hover:to-emerald-500 transition-all duration-300 transform hover:-translate-y-1">
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-6 py-20 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-3xl"></div>
        
        <div className={`transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-4xl sm:text-5xl font-extrabold mt-7 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
            Extract Any Data from Any Website
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mb-8">
            Paste a link and let our AI-powered scraper fetch structured data for
            you — no coding required.
          </p>
          <div className="w-full max-w-xl">
            <FormData onSuccess={fetchData} />
          </div>
        </div>

        {/* Animated AI Icon */}
        <div className="mt-12 relative">
          <div className="w-24 h-24 bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-ai-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="absolute -inset-3 bg-cyan-500/30 rounded-2xl blur-lg -z-10 animate-ping-slow"></div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-16 px-6 bg-gray-800/50 backdrop-blur-sm grid gap-8 sm:grid-cols-2 lg:grid-cols-3 relative"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="bg-gray-800/60 backdrop-blur-md px-6 py-12 rounded-2xl shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-gray-700/50">
          <div className="w-14 h-14 bg-cyan-600/20 rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-cyan-300">Fast Extraction</h3>
          <p className="text-gray-300">
            Get results in seconds with our optimized scraping pipeline
          </p>
        </div>
        
        <div className="bg-gray-800/60 backdrop-blur-md px-6 py-12 rounded-2xl shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-gray-700/50">
          <div className="w-14 h-14 bg-emerald-600/20 rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-emerald-300">Structured Data</h3>
          <p className="text-gray-300">
            Emails, phones, names, locations, and more — neatly organized
          </p>
        </div>
        
        <div className="bg-gray-800/60 backdrop-blur-md px-6 py-12 rounded-2xl shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-gray-700/50">
          <div className="w-14 h-14 bg-cyan-600/20 rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl">⬇</span>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-cyan-300">Export Ready</h3>
          <p className="text-gray-300">
            Download your scraped data as CSV or PDF with one click
          </p>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16 px-6 relative">
        <div className="absolute -top-20 left-0 w-full h-20 bg-gradient-to-b from-transparent to-gray-900"></div>
        
        <h2 className="font-bold text-3xl mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
          Live Result
        </h2>

        {data.length === 0 ? (
          <div className="text-gray-400 text-center py-12 bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700/50">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p>No data found. Try scraping a website!</p>
          </div>
        ) : (
          <div className="space-y-10">
            {data.map((info, infoIndex) => {
              const validRows =
                info?.information?.data?.filter(
                  (item) => item.name && item.name.trim() !== ""
                ) || [];

              return (
                <div
                  key={infoIndex}
                  className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-700/50 transition-all duration-300 hover:shadow-cyan-500/10"
                >
                  {/* URL + Title */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-400 break-all">
                      <strong className="text-gray-300">🔗 URL :</strong>{" "}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                        href={info.url}
                      >
                        {info.url}
                      </a>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      <strong className="text-gray-300">Title :</strong>{" "}
                      {info.title || "Title not found!"}
                    </p>
                  </div>

                  {/* Show Table if valid data */}
                  {validRows.length > 0 ? (
                    <div>
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() =>
                            downloadCSV(
                              validRows,
                              `${info.title}.csv`
                            )
                          }
                          className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-sm rounded-lg shadow hover:from-cyan-500 hover:to-emerald-500 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                        >
                          ⬇ Download CSV
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <div className="max-h-[500px] overflow-y-auto w-full border border-gray-700 rounded-lg">
                          <table className="min-w-[1000px] text-xs sm:text-sm border-collapse">
                            <thead className="bg-gray-700 text-gray-200 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-3 border border-gray-600">Name</th>
                                <th className="px-4 py-3 border border-gray-600">Email</th>
                                <th className="px-4 py-3 border border-gray-600">Phone</th>
                                <th className="px-4 py-3 border border-gray-600">Location</th>
                                <th className="px-4 py-3 border border-gray-600">Image</th>
                                <th className="px-4 py-3 border border-gray-600">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {validRows.map((item, i) => (
                                <tr key={i} className="odd:bg-gray-800 even:bg-gray-700/50">
                                  <td className="px-4 py-3 border border-gray-600">{item.name}</td>
                                  <td className="px-4 py-3 border border-gray-600">
                                    {item.email?.length > 0
                                      ? item.email.map((em, idx) => (
                                          <p key={idx}>
                                            <a
                                              href={`mailto:${em}`}
                                              className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                                            >
                                              {em}
                                            </a>
                                          </p>
                                        ))
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-3 border border-gray-600">
                                    {item.phone?.length > 0
                                      ? item.phone.map((ph, idx) => (
                                          <p key={idx}>
                                            <a
                                              href={`tel:${ph}`}
                                              className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                                            >
                                              {ph}
                                            </a>
                                          </p>
                                        ))
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-3 border border-gray-600">{item.location || "N/A"}</td>
                                  <td className="px-4 py-3 border border-gray-600">
                                    {item.image ? (
                                      <a href={item.image} target="_blank" rel="noreferrer">
                                        <img
                                          src={item.image}
                                          alt={item.name || "profile"}
                                          className="w-12 h-12 rounded-full object-cover border border-gray-600"
                                        />
                                      </a>
                                    ) : (
                                      "N/A"
                                    )}
                                  </td>
                                  <td className="px-4 py-3 border border-gray-600">{item.description || "N/A"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : info?.information?.raw ? (
                    <div>
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() =>
                            downloadPDF(
                              info.information.raw,
                              `${info.title}.pdf`
                            )
                          }
                          className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-sm rounded-lg shadow hover:from-cyan-500 hover:to-emerald-500 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                        >
                          ⬇ Download PDF
                        </button>
                      </div>
                      <pre className="text-xs sm:text-sm text-left p-4 bg-gray-700/50 border border-gray-600 rounded-lg max-h-[400px] overflow-auto whitespace-pre-wrap">
                        {info.information.raw}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      No structured or raw data available.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-gray-800/80 backdrop-blur-md border-t border-gray-700 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} WebScraper AI. All rights reserved.
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(20px); }
          75% { transform: translateY(0px) translateX(10px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.7; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes ai-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.3); }
          70% { box-shadow: 0 0 0 20px rgba(34, 211, 238, 0); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-ai-pulse {
          animation: ai-pulse 2s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-6000 {
          animation-delay: 6s;
        }
        
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default Homepage;