import { useState, useEffect } from "react";
import api from "../callApi";
import FormData from "./FormData";
import { jsPDF } from "jspdf";

const Homepage = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await api.get("/data");
      setData(response?.data?.dataCollections);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Navbar */}
      <header className="w-full px-10 py-4 flex justify-between items-center bg-white shadow-md">
        <h1 className="text-2xl font-bold">🕷️ WebCrawler</h1>
        {/* <nav className="space-x-6 hidden md:flex">
          <a href="#features" className="hover:text-blue-600">
            Features
          </a>
          <a href="#demo" className="hover:text-blue-600">
            Demo
          </a>
        </nav> */}
        <button style={{color: "#1DDE74"}} className="px-4 py-2 bg-gray-900 font-semibold rounded-lg shadow cursor-pointer">
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-6 py-20 bg-gradient-to-b from-blue-50 to-white">
        <h2 className="text-4xl sm:text-5xl font-extrabold mt-7 mb-4">
          Extract Any Data from Any Website
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          Paste a link and let our AI-powered scraper fetch structured data for
          you — no coding required.
        </p>
        <div className="w-full max-w-xl">
          <FormData onSuccess={fetchData} />
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-16 px-6 bg-gray-100 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="bg-white px-6 py-12 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">⚡ Fast Extraction</h3>
          <p className="text-gray-600">
            Get results in seconds with our optimized scraping pipeline
          </p>
        </div>
        <div className="bg-white  px-6 py-12  rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">📊 Structured Data</h3>
          <p className="text-gray-600">
            Emails, phones, names, locations, and more — neatly organized
          </p>
        </div>
        <div className="bg-white  px-6 py-12  rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">⬇ Export Ready</h3>
          <p className="text-gray-600">
            Download your scraped data as CSV or PDF with one click
          </p>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16 px-6">
        <h2 className="font-bold text-3xl mb-8 text-center">Live Result</h2>

        {data.length === 0 ? (
          <p className="text-gray-500 italic text-center py-6 bg-white rounded-xl shadow border">
            No data found. Try scraping a website!
          </p>
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
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
                >
                  {/* URL + Title */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 break-all">
                      <strong className="text-gray-800">🔗 URL :</strong>{" "}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                        href={info.url}
                      >
                        {info.url}
                      </a>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong className="text-gray-800">Title :</strong>{" "}
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
                              // `scraped_data_${infoIndex + 1}.csv`
                              `${info.title}.csv`
                            )
                          }
                          className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow hover:bg-gray-950 transition cursor-pointer"
                        >
                          ⬇ Download CSV
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <div className="max-h-[500px] overflow-y-auto w-full border border-gray-300 rounded-lg">
                          <table className="min-w-[1000px] text-xs sm:text-sm border-collapse">
                            <thead className="bg-gray-100 text-gray-800 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-3 border">Name</th>
                                <th className="px-4 py-3 border">Email</th>
                                <th className="px-4 py-3 border">Phone</th>
                                <th className="px-4 py-3 border">Location</th>
                                <th className="px-4 py-3 border">Image</th>
                                <th className="px-4 py-3 border">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {validRows.map((item, i) => (
                                <tr key={i} className="odd:bg-white even:bg-gray-50">
                                  <td className="px-4 py-3 border">{item.name}</td>
                                  <td className="px-4 py-3 border">
                                    {item.email?.length > 0
                                      ? item.email.map((em, idx) => (
                                          <p key={idx}>
                                            <a
                                              href={`mailto:${em}`}
                                              className="text-blue-700 hover:underline"
                                            >
                                              {em}
                                            </a>
                                          </p>
                                        ))
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-3 border">
                                    {item.phone?.length > 0
                                      ? item.phone.map((ph, idx) => (
                                          <p key={idx}>
                                            <a
                                              href={`tel:${ph}`}
                                              className="text-green-700 hover:underline"
                                            >
                                              {ph}
                                            </a>
                                          </p>
                                        ))
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-3 border">{item.location || "N/A"}</td>
                                  <td className="px-4 py-3 border">
                                    {item.image ? (
                                      <a href={item.image} target="_blank" rel="noreferrer">
                                        <img
                                          src={item.image}
                                          alt={item.name || "profile"}
                                          className="w-12 h-12 rounded-full object-cover border"
                                        />
                                      </a>
                                    ) : (
                                      "N/A"
                                    )}
                                  </td>
                                  <td className="px-4 py-3 border">{item.description || "N/A"}</td>
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
                              // `scraped_raw_${infoIndex + 1}.pdf`
                              `${info.title}.pdf`
                            )
                          }
                          className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow hover:bg-gray-950 transition cursor-pointer"
                        >
                          ⬇ Download PDF
                        </button>
                      </div>
                      <pre className="text-xs sm:text-sm text-left p-4 bg-gray-50 border rounded-lg max-h-[400px] overflow-auto whitespace-pre-wrap">
                        {info.information.raw}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
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
      <footer className="mt-auto py-6 bg-white border-t text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} WebScraper. All rights reserved.
      </footer>
    </div>
  );
};

export default Homepage;
