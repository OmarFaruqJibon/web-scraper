import { useState, useEffect } from "react";
import api from "../callApi";
import FormData from "./FormData";
import { jsPDF } from "jspdf";   // <-- import jsPDF

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

  // Convert JSON -> CSV and trigger download
  const downloadCSV = (tableData, filename = "data.csv") => {
    if (!tableData || tableData.length === 0) return;

    const headers = Object.keys(tableData[0]);
    const csvRows = [];

    csvRows.push(headers.join(",")); // header

    for (const row of tableData) {
      const values = headers.map((header) => {
        const value = row[header];
        if (Array.isArray(value)) {
          return `"${value.join("; ")}"`;
        }
        return `"${value ? String(value).replace(/"/g, '""') : ""}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Convert RAW -> PDF and trigger download
  const downloadPDF = (rawText, filename = "data.pdf") => {
    const doc = new jsPDF();
    const margin = 10;
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(12);

    // Split text into pages
    const lines = doc.splitTextToSize(rawText, 180); // wrap at ~180px
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

  console.log(data);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col md:flex-row gap-6 p-4 sm:p-6">
      {/* Left: Form */}
      <div className="form-container w-full md:w-1/3">
        <FormData onSuccess={fetchData} />
      </div>

      {/* Right: Scraped Data */}
      <div className="w-full md:w-2/3 mx-auto mt-6 md:mt-10">
        <h2 className="font-bold text-2xl mb-6 text-center text-gray-800">
          Scraped Data
        </h2>

        {data.length === 0 ? (
          <p className="text-gray-500 italic text-center py-6 bg-white rounded-xl shadow border">
            No data found
          </p>
        ) : (
          <div className="space-y-10">
            {data.map((info, infoIndex) => (
              <div
                key={infoIndex}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200"
              >
                {/* URL + Title */}
                <div className="mb-4 sm:mb-6">
                  <p className="text-sm text-gray-600 break-all">
                    <strong className="text-gray-800">🔗 URL :</strong>{" "}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-900 hover:underline"
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

                {/* If structured data */}
                {info?.information?.data?.length > 0 ? (
                  <div>
                    {/* Download CSV Button */}
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() =>
                          downloadCSV(
                            info.information.data,
                            `scraped_data_${infoIndex + 1}.csv`
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
                              <th className="px-4 py-3 text-left border border-gray-300">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left border border-gray-300">
                                Email
                              </th>
                              <th className="px-4 py-3 text-left border border-gray-300">
                                Phone
                              </th>
                              <th className="px-4 py-3 text-left border border-gray-300">
                                Location
                              </th>
                              <th className="px-4 py-3 text-left border border-gray-300">
                                Image
                              </th>
                              <th className="px-4 py-3 text-left border border-gray-300">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {info.information.data.map((item, i) => (
                              <tr
                                key={i}
                                className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition"
                              >
                                <td className="px-4 py-3 border border-gray-300">
                                  {item.name || "N/A"}
                                </td>

                                {/* Email */}
                                <td className="px-4 py-3 border border-gray-300">
                                  {item.email ? (
                                    item?.email?.map((em, idx) => (
                                      <p key={idx}>
                                        <a
                                          href={`mailto:${em}`}
                                          className="text-blue-700 hover:underline"
                                        >
                                          {em}
                                        </a>
                                        <br />
                                      </p>
                                    ))
                                  ) : (
                                    "N/A"
                                  )}
                                </td>

                                {/* Phone */}
                                <td className="px-4 py-3 border border-gray-300">
                                  {item?.phone ? (
                                    item?.phone?.map((ph, idx) => (
                                      <p key={idx}>
                                        <a
                                          href={`tel:${ph}`}
                                          className="text-green-700 hover:underline"
                                        >
                                          {ph}
                                        </a>
                                        <br />
                                      </p>
                                    ))
                                  ) : (
                                    "N/A"
                                  )}
                                </td>

                                <td className="px-4 py-3 border border-gray-300">
                                  {item.location || "N/A"}
                                </td>
                                <td className="px-4 py-3 border border-gray-300">
                                  {item.image ? (
                                    <a
                                      href={item.image}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
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
                                <td className="px-4 py-3 border border-gray-300">
                                  {item.description || "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : info?.information?.raw ? (
                  <div>
                    {/* Download PDF Button */}
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() =>
                          downloadPDF(
                            info.information.raw,
                            `scraped_raw_${infoIndex + 1}.pdf`
                          )
                        }
                        className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow hover:bg-gray-950 transition cursor-pointer"
                      >
                        ⬇ Download PDF
                      </button>
                    </div>

                    {/* Show RAW */}
                    <pre className="text-xs sm:text-sm text-left p-4 rounded-lg overflow-x-auto max-h-[500px] whitespace-pre-wrap shadow-inner">
                      {info.information.raw}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No structured or raw data available.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
